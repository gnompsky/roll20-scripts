module StatusManager {
  export type State = {
    meta: {
      [key: ObjectId]: StatusMeta[]
    }
  };
  
  export type Status = "fire" | "stun" | "poison" | "bleed" | "freeze" | "staggered" | "intoxication" | "hallucination" | "nausea" | "suffocation" | "blinded" |
    "prone" | "grappled" | "pinned";
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
      ? <StatusManager.StatusLocation[]>args.slice(2).filter(l => l.length) 
      : [];
    
    const selectedToken = getObj("graphic", msg.selected[0]._id)!;
    const status = statusString as StatusManager.Status;

    logger(StatusManager, `Attempting to ${command} status ${status} to token ${selectedToken.get("name")}`);
    
    switch (command) {
      case StatusManager.CMD_ADD: return this.addStatus(selectedToken, status, locationKeys);
      case StatusManager.CMD_REMOVE: return this.removeStatus(selectedToken, status);
      // TODO: case StatusManager.CMD_TOGGLE: return this.toggleStatus(selectedToken, status, locationKeys);
      default: return sendChat(msg.who, `/w gm unrecognised command "${command}"`);
    }
  }

  private addStatus(token: GraphicObject, statusName: StatusManager.Status, locations: StatusManager.StatusLocation[]) {
    const status = StatusManager.statusMap[statusName];
    const tokenName = token.get("name");
    
    // TODO: Not sure how to show locations?
    const statusProperty: `status_${MarkerType}${"" | "marker"}` = `status_${status.marker}`;
    const statusValue = typeof status.duration === "undefined" ? true : status.duration;
    token.set(statusProperty, statusValue);
    logger(StatusManager, `Set ${statusProperty}="${token.get(statusProperty)}" for ${tokenName}`);

    const tokenStateMeta = this.getTokenStateMeta(token);
    let existingStatus = tokenStateMeta.find(x => x.status === statusName);

    // If we already have this status and it's not location targetable, we'll do nothing here
    if (!!existingStatus && !existingStatus.locationTargetable) {
      logger(StatusManager, `Token ${tokenName} already has status ${statusName}. Nothing to do here`);
      return;
    }
    
    // If we don't have the status, add it
    if (!existingStatus) {
      logger(StatusManager, `Token ${tokenName} does not have status ${statusName}. Adding it`);
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
      logger(StatusManager, `Applying ${statusName} to ${tokenName}'s ${locations.join(", ")}`);
      _.forEach(locations, location => {
        existingStatus!.locations[location] = true;
      });
    }
    
    this.setTokenStateMeta(token, tokenStateMeta);
  };

  private removeStatus(token: GraphicObject, statusName: StatusManager.Status) {
    const status = StatusManager.statusMap[statusName];
    
    const statusProperty: `status_${MarkerType}${"" | "marker"}` = `status_${status.marker}`;
    token.set(statusProperty, false);
    logger(StatusManager, `Set ${statusProperty}=false for ${token.get("name")}`);

    let tokenStateMeta = this.getTokenStateMeta(token);
    const statusToRemove = tokenStateMeta.find(x => x.status === statusName);
    if (!statusToRemove) return;
    
    logger(StatusManager, `Removing ${statusName} from ${token.get("name")}`);
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
            logger(StatusManager, `Duration of ${status.status} on ${token.get("name")} has expired. Removing`);
            this.removeStatus(token, status.status);

            return message + "Cleared }}";
          } else {
            logger(StatusManager, `Decrementing duration of ${status.status} on ${token.get("name")} from ${status.duration} to ${status.duration - 1}`);
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
    logger(StatusManager, newMeta);
  }

  private getState(): StatusManager.State {
    return getState<StatusManager, StatusManager.State>(this);
  }
  
  private static readonly statusMap: Record<StatusManager.Status, StatusManager.StatusDefinition> = {
    /* Effects (p.161) */
    fire: {
      name: "On Fire",
      marker: "half-haze",
      damagePerRound: 5,
      clearInstructions: "Whole turn to pour water or stop, drop and roll",
      armourSoaks: true,
      locationTargetable: true
    },
    stun: {
      name: "Stunned",
      marker: "sleepy",
      damagePerRound: 0,
      description: "DC: 10 to hit you.",
      clearInstructions: "Stun save (takes whole round) or get hit",
      armourSoaks: false,
      locationTargetable: false
    },
    poison: {
      name: "Poisoned",
      marker: "skull",
      damagePerRound: 3,
      clearInstructions: "DC 15 Endurance check (1 action)",
      armourSoaks: false,
      locationTargetable: false
    },
    bleed: {
      name: "Bleeding",
      marker: "half-heart",
      damagePerRound: 2,
      clearInstructions: "Healing spell or DC 15 First Aid check (1 action)",
      armourSoaks: false,
      locationTargetable: true
    },
    freeze: {
      name: "Frozen",
      marker: "frozen-orb",
      damagePerRound: 0,
      description: "-3 SPD, -1 REF",
      clearInstructions: "DC 16 Physique check (1 action)",
      armourSoaks: false,
      locationTargetable: false
    },
    staggered: {
      name: "Staggered",
      marker: "lightning-helix",
      damagePerRound: 0,
      description: "-2 Att/Def",
      duration: 1,
      armourSoaks: false,
      locationTargetable: false
    },
    intoxication: {
      name: "Intoxicated",
      marker: "drink-me",
      damagePerRound: 0,
      description: "-2 REF,DEX,INT, -3 Verbal Combat, 25% amnesia",
      clearInstructions: "Sleep it off or White Honey",
      armourSoaks: false,
      locationTargetable: false
    },
    hallucination: {
      name: "Hallucinating",
      marker: "aura",
      damagePerRound: 0,
      description: "GM free rein to make visions up",
      clearInstructions: "DC 15 Deduction to recognise each false image",
      armourSoaks: false,
      locationTargetable: false
    },
    nausea: {
      name: "Nauseous",
      marker: "yellow",
      damagePerRound: 0,
      description: "Every 3 rounds roll under BODY or spend round throwing up",
      clearInstructions: "Sleep it off",
      armourSoaks: false,
      locationTargetable: false
    },
    suffocation: {
      name: "Suffocating",
      marker: "ninja-mask",
      damagePerRound: 3,
      clearInstructions: "Restore air supply",
      armourSoaks: false,
      locationTargetable: false
    },
    blinded: {
      name: "Blinded",
      marker: "bleeding-eye",
      damagePerRound: 0,
      description: "-3 Att/Def, -5 sight-based Awareness",
      clearInstructions: "Turn to clear your eyes",
      armourSoaks: false,
      locationTargetable: false
    },
    /* Combat Statuses (p. 163) */
    prone: {
      name: "Prone",
      marker: "back-pain",
      damagePerRound: 0,
      description: "-2 Att/Def",
      clearInstructions: "Move action to stand, after which you may use remaining action to move as normal",
      armourSoaks: false,
      locationTargetable: false
    },
    grappled: {
      name: "Grappled",
      marker: "fishing-net",
      damagePerRound: 0,
      description: "-2 to physical actions",
      clearInstructions: "Dodge/escape vs. original attack roll",
      armourSoaks: false,
      locationTargetable: false
    },
    pinned: {
      name: "Pinned",
      marker: "arrowed",
      damagePerRound: 0,
      description: "-2 to physical actions. Cannot move.",
      clearInstructions: "Dodge/escape vs. original attack roll",
      armourSoaks: false,
      locationTargetable: false
    },
  };
}

registerMod(StatusManager);
