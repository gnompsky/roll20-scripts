module BetterFumble {
  export type RollMeta = {
    actor: string;
    skillName: string;
  };

  export type RollValues = {
    roll: number;
    stat: number;
    skill: number;
    mod: number;
  };
  
  export type ResolvedFumble = {
    rollMeta: RollMeta,
    rollValues?: RollValues,
    rawFumbleValue: number,
    rollIndex?: number
  };
  
  export type TemplateHandler = (meta: Record<string, string>, rolls: InlineRoll[]) => ResolvedFumble[];
}

/* Implements Fumble rules by Spirited-dark */
class BetterFumble implements Mod {
  private readonly _templateHandlers: Record<string, BetterFumble.TemplateHandler> = {
    singleroll: _.bind(this.tryResolveSingleRoll, this),
    doubleroll: _.bind(this.tryResolveDoubleRoll, this),
    mainskill: _.bind(this.tryResolveProfessionalSkill, this),
    blueskill: _.bind(this.tryResolveProfessionalSkill, this),
    greenskill: _.bind(this.tryResolveProfessionalSkill, this),
    redskill: _.bind(this.tryResolveProfessionalSkill, this),
    weaponattack: _.bind(this.tryResolveWeaponAttack, this),
    npcweapon: _.bind(this.tryResolveNpcWeapon, this),
    npcdefense: _.bind(this.tryResolveNpcDefense, this),
    // This isn't worth the effort as Stexinator doesn't have labels on the roll. We could do it manually as we know it's always
    // STAT = @{will} and SKILL = @{rep_level} but with how rarely we roll rep it doesn't seem worth it.
    //reputation: _.bind(this.tryResolveReputation, this),
  };
  
  public initialise(): void {}
  public registerEventHandlers(): void {
    on("chat:message", (msg) => {
      const isFumbleMessage = messageIsOneOf(msg, "general", "whisper") &&
        messageContains(msg, "{{fumble=");

      if (isFumbleMessage) {
        this.handleFumble(<GeneralMessage | WhisperMessage>msg);
      }
    });
  }

  private handleFumble(msg: GeneralMessage | WhisperMessage) {
    if (!msg.rolltemplate || !this._templateHandlers.hasOwnProperty(msg.rolltemplate)) return;

    const meta = this.getRollMeta(msg);
    const rolls = msg.inlinerolls || [];
    const resolvedFumble = this._templateHandlers[msg.rolltemplate](meta, rolls);

    _.forEach(resolvedFumble, (fumble) => {
      if (fumble.rollValues?.roll !== 1) return;
      this.calculateAndReportFumble(msg, fumble);
    });
  }

  private calculateAndReportFumble(
    msg: OneOfMessage,
    {rollMeta, rollValues, rawFumbleValue, rollIndex}: BetterFumble.ResolvedFumble,
  ) {
    const { actor, skillName } = rollMeta;
    const { stat, skill, mod } = rollValues!;
    const chatPrefix = messageIsOneOf(msg, "whisper")
      ? `/w gm`
      : "/me";
    const rollIndexText = typeof rollIndex !== "undefined"
      ? rollIndex === 0 ? "1st " : "2nd "
      : "";

    const fumbleVal = rawFumbleValue - skill - mod;
    logger(BetterFumble, `${rawFumbleValue}[FV] - ${skill}[SKILL] - ${mod}[MOD] = ${fumbleVal}`);

    if (fumbleVal <= 0) {
      const rollCalc = `[[1[ROLL] + ${stat}[STAT] + ${skill}[SKILL] + (${mod}[MOD])]]`;
      sendChat(actor, `${chatPrefix} avoided a fumble on their ${rollIndexText}${skillName} roll for a roll of ${rollCalc}`);
    } else {
      const fumbledRollCalc = `[[0[ROLL] + ${stat}[STAT] + ${skill}[SKILL] + (${mod}[MOD])]]`;
      const fumbleCalc = `[[${rawFumbleValue}[FUMBLE ROLL] - ${skill}[SKILL] - (${mod}[MOD])]]`;

      const straightRollCalc = `[[0[ROLL] + ${stat}[STAT] + ${skill}[SKILL] - ${fumbleCalc}[FUMBLE] + (${mod}[MOD])]]`;

      sendChat(actor, `${chatPrefix} fumbles their ${rollIndexText}${skillName} roll for a roll of ${straightRollCalc} or ${fumbledRollCalc} (with fumble of ${fumbleCalc})`);
    }
  }
  
  private tryResolveSingleRoll(meta: Record<string, string>, rolls: InlineRoll[], rollIndex?: number): BetterFumble.ResolvedFumble[] {
    return [{
      rollMeta: {
        actor: meta.name,
        skillName: this.toTitleCase(meta.title),
      },
      rollValues: this.getRollValues(rolls, { stat: "STAT", skill: "SKILL" }, rollIndex),
      rawFumbleValue: this.getFumbleValue(rolls, rollIndex),
      rollIndex
    }];
  }

  private tryResolveDoubleRoll(meta: Record<string, string>, rolls: InlineRoll[]): BetterFumble.ResolvedFumble[] {
    return [
      this.tryResolveSingleRoll(meta, rolls, 0)[0],
      this.tryResolveSingleRoll(meta, rolls, 1)[0]
    ];
  }

  private tryResolveProfessionalSkill(meta: Record<string, string>, rolls: InlineRoll[]): BetterFumble.ResolvedFumble[] {
    return [{
      rollMeta: {
        actor: meta.name,
        skillName: this.toTitleCase(meta.title),
      },
      rollValues: this.getRollValues(rolls, { stat: "STAT", skill: "PROF. SKILL" }),
      rawFumbleValue: this.getFumbleValue(rolls)
    }];
  }

  private tryResolveWeaponAttack(meta: Record<string, string>, rolls: InlineRoll[]): BetterFumble.ResolvedFumble[] {
    return [{
      rollMeta: {
        actor: meta.name,
        skillName: this.toTitleCase(meta.title),
      },
      rollValues: this.getRollValues(rolls, { skillBase: "SKILLBASE" }),
      rawFumbleValue: this.getFumbleValue(rolls)
    }];
  }

  private tryResolveNpcWeapon(meta: Record<string, string>, rolls: InlineRoll[]): BetterFumble.ResolvedFumble[] {
    return [{
      rollMeta: {
        actor: meta.name,
        skillName: this.toTitleCase(meta["weapon-name"]),
      },
      rollValues: this.getNpcWeaponRollValues(rolls), // Use our special case here for our messed up roll template
      rawFumbleValue: this.getFumbleValue(rolls)
    }];
  }

  private tryResolveNpcDefense(meta: Record<string, string>, rolls: InlineRoll[]): BetterFumble.ResolvedFumble[] {
    return [{
      rollMeta: {
        actor: meta.name,
        skillName: this.toTitleCase(meta.title),
      },
      rollValues: this.getRollValues(rolls, { skillBase: "SKILL BASE" }),
      rawFumbleValue: this.getFumbleValue(rolls)
    }];
  }
  
  private toTitleCase(text: string) {
    if (!text || text.length === 0) return text;

    const words = text.toLowerCase().split(" ");

    let sentence = words[0][0].toUpperCase() + words[0].substring(1);
    for (let i = 1; i < words.length; i++) {
      sentence += " " + words[i][0].toUpperCase() + words[i].substring(1);
    }

    return sentence;
  }

  private getRollMeta(msg: OneOfMessage): Record<string, string> {
    const sanitisedContent = msg.content.replace(/[\r\n]/g, "");
    const properties = sanitisedContent.match(/\{\{(.+?)}}/g)!;

    const meta: Record<string, string> = {};
    _.each(properties, (prop) => {
      const parts = prop.replace("{{", "").replace("}}", "").split("=");
      meta[parts[0]] = parts[1];
    });

    return meta;
  }

  private getRollValues(
    inlineRolls: InlineRoll[],
    rollLabels: { stat?: string, skill?: string, skillBase?: string },
    rollIndex: number = 0
  ) : BetterFumble.RollValues | undefined {
    // Look for a roll that has ALL of the labels we've been provided
    const skillRoll = _.filter(inlineRolls, (roll) => Object.values(rollLabels)
      .filter(l => l.length)
      .every((label) => label && roll.expression.indexOf(`[${label}]`) !== -1)
    )[rollIndex];
    logger(BetterFumble, `Checking roll ${rollIndex}`);
    if (skillRoll) {
      logger(BetterFumble, skillRoll);
    } else {
      logger(BetterFumble, `[ERROR] No roll found with labels ${JSON.stringify(rollLabels)}`);
      logger(BetterFumble, inlineRolls);
      return;
    }
    
    let roll: number | null = null;
    let stat: number | null = null;
    let skill: number | null = null;
    let mod: number | null = null;

    // Work backwards through results so we hit name before value for easier identification
    let nextType: string | null = null;
    for (let i = skillRoll.results.rolls.length - 1; i >= 0; i--) {
      const value = skillRoll.results.rolls[i];

      if (value.type === "L") {
        nextType = value.text;
        continue;
      } else if (value.type === "M" && nextType) {
        const exprValue = parseInt((""+value.expr).replace("+", ""), 10);
        switch (nextType) {
          case rollLabels.stat:
            stat = exprValue;
            break;
          case rollLabels.skill:
            skill = exprValue;
            break;
          case rollLabels.skillBase:
            // Skill base is a weird one as we can't get skill and stat from it.
            // The original intent behind the new fumble mechanics was that a higher skill would lead to lower chance of fumble.
            // To that end we can probably just halve the base and that'll get us most of the way there.
            const half = exprValue / 2;
            stat = Math.floor(half);
            skill = Math.ceil(half);
            break;
          // We can have a number of different mods e.g. MOD, LOCATION, EXTRA ACTION, so add them all up here
          default:
            if (mod == null) mod = 0;
            mod += exprValue;
            break;
        }
      } else if (value.type === "R" && value.dice === 1 && value.sides === 10) {
        nextType = null;
        roll = _.reduce(value.results, (sum, result: any) => {
          return sum + result.v;
        }, 0);
      }

      // If we have all 3 return
      if (roll !== null && stat !== null && skill !== null && mod !== null) {
        break;
      }
    }

    return {
      roll: roll || 0,
      stat: stat || 0,
      skill: skill || 0,
      mod: mod || 0,
    };
  }

  // TODO: This is only required because we have no [SKILLBASE] label on the attack roll in the template :(
  private getNpcWeaponRollValues(
    inlineRolls: InlineRoll[]
  ) : BetterFumble.RollValues | undefined {
    // Look for a roll that has ALL of the labels we've been provided
    const skillRoll = _.filter(inlineRolls, (roll) => roll.expression.indexOf(`[MOD]`) !== -1)[0];
    logger(BetterFumble, `Checking roll 0}`);
    if (skillRoll) {
      logger(BetterFumble, skillRoll);
    } else {
      logger(BetterFumble, '[ERROR] No roll found with label "[MOD]"');
      logger(BetterFumble, inlineRolls);
      return;
    }

    let roll: number | null = null;
    let stat: number | null = null;
    let skill: number | null = null;
    let mod: number | null = null;

    // Work backwards through results so we hit name before value for easier identification
    let nextType: string | null = null;
    for (let i = skillRoll.results.rolls.length - 1; i >= 0; i--) {
      const value = skillRoll.results.rolls[i];

      if (value.type === "L") {
        nextType = value.text;
        continue;
      } else if (value.type === "M") { // We don't insist on having a nextType here because our attack roll doesn't have one
        const exprValue = parseInt((""+value.expr).replace("+", ""), 10);
        switch (nextType) {
          case "MOD":
            mod = exprValue;
            break;
          // We only have 1 mod + 1 attack base roll, if we're not looking at mod then we must be looking at the attack roll
          default:
            // Skill base is a weird one as we can't get skill and stat from it.
            // The original intent behind the new fumble mechanics was that a higher skill would lead to lower chance of fumble.
            // To that end we can probably just halve the base and that'll get us most of the way there.
            const half = exprValue / 2;
            stat = Math.floor(half);
            skill = Math.ceil(half);
            break;
        }
        
        // Reset last read label as the next roll might not have one
        nextType = null;
      } else if (value.type === "R" && value.dice === 1 && value.sides === 10) {
        nextType = null;
        roll = _.reduce(value.results, (sum, result: any) => {
          return sum + result.v;
        }, 0);
      }

      // If we have all 3 return
      if (roll !== null && stat !== null && skill !== null && mod !== null) {
        break;
      }
    }

    return {
      roll: roll || 0,
      stat: stat || 0,
      skill: skill || 0,
      mod: mod || 0,
    };
  }

  private getFumbleValue(inlineRolls: any[], rollIndex: number = 0): number {
    // This accounts for pre and post fumble fix PR
    const fumbleRoll = _.filter(
      inlineRolls,
      (roll: any) => roll.expression === "1d10!+1" || roll.expression === "1d10!"
    )[rollIndex];

    // Old style roll, we need to subtract the 1
    const fumbleMod = fumbleRoll.expression.indexOf("+1") !== -1 ? -1 : 0;

    return fumbleRoll.results.total + fumbleMod;
  }
}

registerMod(BetterFumble);
