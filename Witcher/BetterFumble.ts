type RollMeta = {
  actor: string;
  skillName: string;
};

type RollValues = {
  roll: number;
  stat: number;
  skill: number;
  mod: number;
};

/* Implements Fumble rules by Spirited-dark */
class BetterFumble implements Mod {
  public initialise(): void {}
  public registerEventHandlers(): void {
    on("chat:message", (msg) => {
      const isFumbleMessage = messageIsOneOf(msg, "general", "whisper") &&
        messageContains(msg, "{{fumble=") &&
        (msg.rolltemplate === "singleroll" || msg.rolltemplate === "doubleroll" || msg.rolltemplate === "mainskill");

      if (isFumbleMessage) {
        this.handleFumble(msg);
      }
    });
  }

  private titleCase(text: string) {
    const words = text.toLowerCase().split(" ");

    let sentence = words[0][0].toUpperCase() + words[0].substring(1);
    for (let i = 1; i < words.length; i++) {
      sentence += " " + words[i][0].toUpperCase() + words[i].substring(1);
    }

    return sentence;
  }

  private getRollMeta(content: string): RollMeta {
    const sanitisedContent = content.replace(/[\r\n]/g, "");
    const properties = sanitisedContent.match(/\{\{(.+?)}}/g)!;

    const meta: Record<string, string> = {};
    _.each(properties, (prop) => {
      const parts = prop.replace("{{", "").replace("}}", "").split("=");
      meta[parts[0]] = parts[1];
    });

    return {
      actor: meta.name,
      skillName: this.titleCase(meta.title)
    };
  }

  // TODO: Better typings for inline roll
  private getRollValues(inlineRolls: any[], rollIndex: number) : RollValues {
    const skillRoll = _.filter(inlineRolls, (roll: any) => roll.expression.indexOf("[STAT]") !== -1)[rollIndex];
    logger(BetterFumble, `Checking roll ${rollIndex}`, "getRollValues");
    logger(BetterFumble, skillRoll, "getRollValues");
    
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
        switch (nextType) {
          case "STAT":
            stat = parseInt(value.expr.replace("+", ""), 10);
            break;
          case "PROF. SKILL":
          case "SKILL":
            skill = parseInt(value.expr.replace("+", ""), 10);
            break;
          // We can have a number of different mods e.g. MOD, LOCATION, EXTRA ACTION, so add them all up here
          default:
            if (mod == null) mod = 0;
            mod += parseInt(value.expr.replace("+", ""), 10);
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

  private getFumbleValue(inlineRolls: any[], rollIndex: number): number {
    // This accounts for pre and post fumble fix PR
    const fumbleRoll = _.filter(
      inlineRolls,
      (roll: any) => roll.expression === "1d10!+1" || roll.expression === "1d10!"
    )[rollIndex];

    // Old style roll, we need to subtract the 1
    const fumbleMod = fumbleRoll.expression.indexOf("+1") !== -1 ? -1 : 0;

    return fumbleRoll.results.total + fumbleMod;
  }

  private calculateAndReportFumble(
    isWhisper: boolean,
    {actor, skillName}: RollMeta,
    {stat, skill, mod}: RollValues,
    rawFumbleValue: number
  ) {
    const prefix = isWhisper ? `/w gm ${actor}` : "/me"

    const fumbleVal = rawFumbleValue - skill - mod;
    logger(BetterFumble, `${rawFumbleValue}[FV] - ${skill}[SKILL] - ${mod}[MOD] = ${fumbleVal}`, "calculateAndReportFumble");

    if (fumbleVal <= 0) {
      const rollCalc = `[[1[ROLL] + ${stat}[STAT] + ${skill}[SKILL] + (${mod}[MOD])]]`;
      sendChat(actor, `${prefix} avoided a fumble on their ${skillName} roll for a roll of ${rollCalc}`);
    } else {
      const fumbledRollCalc = `[[0[ROLL] + ${stat}[STAT] + ${skill}[SKILL] + (${mod}[MOD])]]`;
      const fumbleCalc = `[[${rawFumbleValue}[FUMBLE ROLL] - ${skill}[SKILL] - (${mod}[MOD])]]`;

      const straightRollCalc = `[[0[ROLL] + ${stat}[STAT] + ${skill}[SKILL] - ${fumbleCalc}[FUMBLE] + (${mod}[MOD])]]`;

      sendChat(actor, `${prefix} fumbles their ${skillName} roll for a roll of ${straightRollCalc} or ${fumbledRollCalc} (with fumble of ${fumbleCalc})`);
    }
  }

  private extractRollValuesAndReportFumble(inlineRolls: object[], rollIndex: number, isWhisper: boolean, rollMeta: RollMeta) {
    const rollValues = this.getRollValues(inlineRolls, rollIndex);
    logger(BetterFumble, rollValues, "extractRollValuesAndReportFumble");

    if (rollValues.roll === 1) {
      const rawFumbleValue = this.getFumbleValue(inlineRolls, rollIndex);
      this.calculateAndReportFumble(isWhisper, rollMeta, rollValues, rawFumbleValue);
    }
  }

  private handleFumble(msg: GeneralMessage | WhisperMessage) {
    const isWhisper = messageIsOneOf(msg, "whisper");
    const rollMeta = this.getRollMeta(msg.content);
    logger(BetterFumble, `Handling fumble for ${rollMeta.actor} on ${rollMeta.skillName}`, "handleFumble");

    // Do initial roll regardless of if we're single or double rolling
    this.extractRollValuesAndReportFumble(msg.inlinerolls!, 0, isWhisper, rollMeta);

    // If we're double rolling, check the second roll
    if (msg.rolltemplate === "doubleroll") {
      this.extractRollValuesAndReportFumble(msg.inlinerolls!, 1, isWhisper, rollMeta);
    }
  }
}

registerMod(BetterFumble);
