module StatusManager {
  export type State = {
    meta: {
      [key: ObjectId]: StatusMeta[]
    }
  };
  
  export type Status = "fire" | "stun" | "poison" | "bleed" | "freeze" | "staggered" | "intoxication" | "hallucination" | "nausea" | "suffocation" | "blinded";
  export type StatusLocation = "head" | "torso" | "larm" | "rarm" | "lleg" | "rleg";
  export type StatusMeta = StatusDefinition & {
    status: Status;
    locations: Record<StatusLocation, boolean>;
  };
  
  export type StatusDefinition = {
    name: string;
    marker: MarkerType;
    description?: string;
    damagePerRound?: number;
    duration?: number;
    clearInstructions?: string,
    armourSoaks: boolean,
    locationTargetable: boolean
  };
}

//TODO: Remove/Add should be able to amend locations
//TODO: Toggle command
//TODO: Markers not applying
class StatusManager implements Mod<StatusManager.State> {
  private static readonly CMD_ADD = "add";
  private static readonly CMD_REMOVE = "remove";
  private static readonly CMD_TOGGLE = "toggle";
  private static readonly CMD_CLEAR_ALL = "clear";
  
  public initialise(): void {
    const state = this.getState();
    if (!state.meta) state.meta = {};
  }
  public registerEventHandlers(): void {
    on("change:campaign:turnorder", _.bind(this.handleTurnorderChange, this));
    on("chat:message", _.bind(this.handleChatMessage, this));
  }

  private handleTurnorderChange(obj: CampaignObject, prev: CampaignObjectProperties) {
    if(obj.get('turnorder') === prev.turnorder) return;

    const turnOrder = getTurnOrder();
    const prevTurnOrder = getPrevTurnOrder(prev);

    // If there is a new item at the top of the turn order
    if(turnOrder.length && prevTurnOrder.length && turnOrder[0].id !== prevTurnOrder[0].id) {
      const turn = turnOrder[0];
      if (turn.id === "-1") return;

      const tokenObj = getObj("graphic", turn.id);
      if (!tokenObj) return;

      const tokenStateMeta = this.getTokenStateMeta(tokenObj);
      const statusMessage = this.buildStatusDisplay(tokenObj, tokenStateMeta);
      sendChat("System", statusMessage);
    }
  }
  
  private handleChatMessage(m: OneOfMessage) {
    if(!messageIsApiCommand(m, "status")) return;
    const msg = <ApiMessage>m;
    
    const args = _.rest(msg.content.split(" "));
    const command = args.length >= 1 ? args[0].toLowerCase() : undefined;
    if (!command) return sendChat(msg.who, `/w gm missing command`);

    if (command === StatusManager.CMD_CLEAR_ALL) {
      // TODO: this.clearAllStatuses();
      return;
    }

    if (!msg.selected?.length) {
      sendChat(msg.who, "/w gm you must select a token to manage its status");
      return;
    }

    const statusString = args.length >= 2 ? args[1].toLowerCase() : undefined;
    if (!statusString || !StatusManager.statusMap.hasOwnProperty(statusString)) {
      sendChat(msg.who, `/w gm "${statusString}" is not a recognised status effect`);
      return;
    }

    const locationKeys = args.length >= 3 
      ? <StatusManager.StatusLocation[]>args.slice(2) 
      : [];
    
    const selectedToken = getObj("graphic", msg.selected[0]._id)!;
    const status = statusString as StatusManager.Status;

    switch (command) {
      case StatusManager.CMD_ADD: return this.addStatus(selectedToken, status, locationKeys);
      case StatusManager.CMD_REMOVE: return this.removeStatus(selectedToken, status);
      // TODO: case StatusManager.CMD_TOGGLE: return this.toggleStatus(selectedToken, status, locationKeys);
      default: return sendChat(msg.who, `/w gm unrecognised command "${command}"`);
    }
  }

  private addStatus(token: GraphicObject, statusName: StatusManager.Status, locations: StatusManager.StatusLocation[]) {
    const status = StatusManager.statusMap[statusName];

    // TODO: Not sure how to show locations?
    token.set(
      `status_${status.marker}`, 
      typeof status.duration === "undefined" ? true : status.duration
    );

    const tokenStateMeta = this.getTokenStateMeta(token);
    let existingStatus = tokenStateMeta.find(x => x.status === statusName);

    // If we already have this status and it's not location targetable, we'll do nothing here
    if (!existingStatus?.locationTargetable) {
      return;
    }
    
    // If we don't have the status, add it
    if (!existingStatus) {
      existingStatus = {
        ...status,
        status: statusName,
        locations: {
          head: false,
          torso: false,
          larm: false,
          rarm: false,
          lleg: false,
          rleg: false
        }
      };
      tokenStateMeta.push(existingStatus);
    }
    
    // Now iterate over affected locations (if applicable) and set them to true
    if (existingStatus.locationTargetable) {
      _.forEach(locations, location => {
        existingStatus!.locations[location] = true;
      });
    }
    
    this.setTokenStateMeta(token, tokenStateMeta);
  };

  private removeStatus(token: GraphicObject, statusName: StatusManager.Status) {
    const status = StatusManager.statusMap[statusName];

    token.set(status.marker, false);

    let tokenStateMeta = this.getTokenStateMeta(token);
    const statusToRemove = tokenStateMeta.find(x => x.status === statusName);
    if (!statusToRemove) return;
    
    tokenStateMeta = _.without(tokenStateMeta, statusToRemove);
    this.setTokenStateMeta(token, tokenStateMeta);
  }
  
  private buildStatusDisplay(token: GraphicObject, meta: StatusManager.StatusMeta[]) {
    let message = `&{template:default} {{name=${token.get("name")}'s Turn}}`;

    if (meta && Array.isArray(meta) && meta.length) {
      // TODO: Move decrementing of status duration to its own method?
      _.each(meta, (status) => {
        message += ` {{${status.name}=`;

        // Decrement duration if applicable
        if (typeof status.duration === "number") {
          if (status.duration <= 1) {
            this.removeStatus(token, status.status);

            return message + "Cleared }}";
          } else {
            status.duration--;
            token.set(`status_${status.marker}`, status.duration);
          }
        }

        if (status.locationTargetable && status.locations){
          let first = true;
          _.each(status.locations, (isAffected, location) => {
            if (!isAffected) return;
            
            if (!first){
              message += `
`;
            }
            first = false;

            switch (location){
              case "head": message += `([[${status.damagePerRound}]] - SP) to the head`; break;
              case "torso": message += `([[${status.damagePerRound}]] - SP) to the torso`; break;
              case "larm": message += `([[${status.damagePerRound}]] - SP) to the l. arm`; break;
              case "rarm": message += `([[${status.damagePerRound}]] - SP) to the r. arm`; break;
              case "lleg": message += `([[${status.damagePerRound}]] - SP) to the l. leg`; break;
              case "rleg": message += `([[${status.damagePerRound}]] - SP) to the r. leg`; break;
            }
          });
        } else if (!!status.damagePerRound) {
          message += `[[${status.damagePerRound}]] damage per round`;
        } else if (status.description) {
          message += status.description;
        }

        if (!!status.duration || status.clearInstructions) {
          message += `
`;
          if (!!status.duration){
            message += `Will end in [[${status.duration}]] rounds`;
          } else {
            message += `To end: ${status.clearInstructions}`;
          }
        }

        message += "}}";
      });
    } else {
      message += "{{ =No Active Status Effects }}";
    }

    return message;
  }
  
  private getTokenStateMeta(token: GraphicObject) {
    const meta = this.getState().meta;
    return meta.hasOwnProperty(token.id) ? meta[token.id] : [];
  }

  private setTokenStateMeta(token: GraphicObject, newMeta: StatusManager.StatusMeta[]) {
    this.getState().meta[token.id] = newMeta;
  }

  private getState(): StatusManager.State {
    return getState<StatusManager, StatusManager.State>(this);
  }
  
  private static readonly statusMap: Record<StatusManager.Status, StatusManager.StatusDefinition> = {
    "fire": {
      name: "On Fire",
      marker: "half-haze",
      damagePerRound: 5,
      duration: -1,
      clearInstructions: "Whole turn to pour water or stop, drop and roll",
      armourSoaks: true,
      locationTargetable: true
    },
    "stun": {
      name: "Stunned",
      marker: "sleepy",
      damagePerRound: 0,
      description: "DC: 10 to hit you.",
      duration: -1,
      clearInstructions: "Stun save (takes whole round) or get hit",
      armourSoaks: false,
      locationTargetable: false
    },
    "poison": {
      name: "Poisoned",
      marker: "skull",
      damagePerRound: 3,
      duration: -1,
      clearInstructions: "DC 15 Endurance check (1 action)",
      armourSoaks: false,
      locationTargetable: false
    },
    "bleed": {
      name: "Bleeding",
      marker: "bleeding-eye",
      damagePerRound: 2,
      duration: -1,
      clearInstructions: "Healing spell or DC 15 First Aid check (1 action)",
      armourSoaks: false,
      locationTargetable: true
    },
    "freeze": {
      name: "Frozen",
      marker: "frozen-orb",
      damagePerRound: 0,
      description: "-3 SPD, -1 REF",
      duration: -1,
      clearInstructions: "DC 16 Physique check (1 action)",
      armourSoaks: false,
      locationTargetable: false
    },
    "staggered": {
      name: "Staggered",
      marker: "lightning-helix",
      damagePerRound: 0,
      description: "-2 Att/Def",
      duration: 1,
      armourSoaks: false,
      locationTargetable: false
    },
    "intoxication": {
      name: "Intoxicated",
      marker: "drink-me",
      damagePerRound: 0,
      description: "-2 REF,DEX,INT, -3 Verbal Combat, 25% amnesia",
      duration: -1,
      clearInstructions: "Sleep it off or White Honey",
      armourSoaks: false,
      locationTargetable: false
    },
    "hallucination": {
      name: "Hallucinating",
      marker: "aura",
      damagePerRound: 0,
      description: "GM free rein to make visions up",
      duration: -1,
      clearInstructions: "DC 15 Deduction to recognise each false image",
      armourSoaks: false,
      locationTargetable: false
    },
    "nausea": {
      name: "Nauseous",
      marker: "yellow",
      damagePerRound: 0,
      description: "Every 3 rounds roll uner BODY or spend round throwing up",
      duration: -1,
      clearInstructions: "Sleep it off",
      armourSoaks: false,
      locationTargetable: false
    },
    "suffocation": {
      name: "Suffocating",
      marker: "ninja-mask",
      damagePerRound: 3,
      duration: -1,
      clearInstructions: "Restore air supply",
      armourSoaks: false,
      locationTargetable: false
    },
    "blinded": {
      name: "Blinded",
      marker: "broken-skull",
      damagePerRound: 0,
      description: "-3 Att/Def, -5 sight-based Awareness",
      duration: -1,
      clearInstructions: "Turn to clear your eyes",
      armourSoaks: false,
      locationTargetable: false
    }
  };
}

registerMod(StatusManager);
