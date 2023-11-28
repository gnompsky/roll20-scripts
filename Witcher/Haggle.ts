class Haggle implements Mod {
  public initialise(): void {}
  public registerEventHandlers(): void {
    on("chat:message", _.bind(this.handleChatMessage, this));
  }

  private handleChatMessage(msg: OneOfMessage) {
    // !haggle {DC} {LIST_PRICE} {BUY/SELL}
    if(messageIsApiCommand(msg, "haggle")) {
      this.handleHaggle(<ApiMessage>msg);
    }
  }
  
  private handleHaggle(msg: ApiMessage) {
    logger(Haggle, "Haggle command received");
    const args = msg.content.split(" ");

    if (args.length < 4) {
      sendChat(msg.who, "/me unexpected number of args. Expected !haggle {buy/sell} {listPrice} {dc}");
      return;
    }

    const isBuy = args[1] === "buy";
    const listPrice = parseFloat(args[2]);
    const dc = parseInt(args[3]);

    if (!msg.selected || msg.selected.length <= 0){
      sendChat(msg.who, "/me you must select the token that is attempting to haggle");
      return;
    }

    const selectedToken = getObj('graphic', msg.selected[0]._id)!;
    const tokenRepresents = selectedToken.get("represents");
    if (!tokenRepresents){
      sendChat(msg.who, "/me the selected token does not represent a character!");
      return;
    }

    const whisper = getAttrByName(tokenRepresents, "whisper");

    const selectedCharacterIntStat = getAttrByNameAsInt(tokenRepresents, "total_int");
    const selectedCharacterIntMod = getAttrByNameAsInt(tokenRepresents, "intstatsum");
    const int = (selectedCharacterIntStat || 0) + (selectedCharacterIntMod || 0);
    const selectedCharacterBusinessSkill = getAttrByNameAsInt(tokenRepresents, "business");
    const selectedCharacterBusinessSkillMod = getAttrByNameAsInt(tokenRepresents, "businesssum");
    const business = (selectedCharacterBusinessSkill || 0) + (selectedCharacterBusinessSkillMod || 0);

    const businessRoll = this.rollBusiness(int, business);
    const beatDcBy = businessRoll.value - dc;

    const firstRoll = businessRoll.rolls[0];
    const rollStr = _.reduce(businessRoll.rolls.slice(1), (acc, roll) => {
      if (typeof roll.value === "string" || roll.value >= 0){
        return `${acc}+${roll.value}[${roll.name}]`;
      }

      return `${acc}-${Math.abs(roll.value)}[${roll.name}]`;
    }, `${firstRoll.value}[${firstRoll.name}]`);

    const fumbleInfoStr = !businessRoll.fr
      ? ""
      : `}} {{FV=[[${businessRoll.fr}[FR] - ${business}[SKILL]]]`;

    let message = `${whisper}&{template:default} {{name=Haggle
}} {{Roll=[[${rollStr}]]${fumbleInfoStr} 
}} {{Beat DC By=[[${businessRoll.value}[ROLL]-${dc}[DC]]]`;

    if (isBuy) {
      let buyPrice = "";
      if (beatDcBy <= 0) {
        buyPrice = `${listPrice}[LIST]*1`;
      } else if (beatDcBy < 4) {
        buyPrice = `${listPrice}[LIST]*0.9375`;
      } else if (beatDcBy < 6) {
        buyPrice = `${listPrice}[LIST]*0.875`;
      } else if (beatDcBy < 8) {
        buyPrice = `${listPrice}[LIST]*0.8125`;
      } else {
        buyPrice = `${listPrice}[LIST]*0.75`;
      }

      message += `}} {{Buy Price=[[floor(${buyPrice})]] crowns
}}`;
    } else {
      let sellPrice = "";
      if (beatDcBy < 4) {
        sellPrice = `${listPrice}[LIST]*0.5`;
      } else if (beatDcBy < 6) {
        sellPrice = `${listPrice}[LIST]*0.625`;
      } else if (beatDcBy < 8) {
        sellPrice = `${listPrice}[LIST]*0.75`;
      } else if (beatDcBy < 10) {
        sellPrice = `${listPrice}[LIST]*0.875`;
      } else {
        sellPrice = `${listPrice}[LIST]*1`;
      }

      message += `}} {{Sell Price=[[floor(${sellPrice})]] crowns
}}`;
    }

    sendChat(msg.who, message);
  }

  private rollBusiness(stat: number, skill: number) : { value: number, rolls: {value: number | string, name: string}[], fr?: number } {
    const firstRoll = randomInteger(10);

    // Crit
    if (firstRoll === 10){
      const rolls = [10];
      let value = 10;

      let roll = -1;
      let attempts = 0;
      do {
        roll = randomInteger(10);
        attempts++;
        rolls.push(roll);
        value += roll;
      } while(roll === 10 && attempts <= 5);

      return {
        value: value + stat + skill,
        rolls: [
          {value: `(${rolls.join("+")})`, name: "1d10!"},
          {value: stat, name: "STAT"},
          {value: skill, name: "SKILL"},
        ]
      };
    }

    // Fumble
    if (firstRoll === 1){
      let fr = randomInteger(10);
      if (fr === 10) {
        let attempts = 0;
        let roll = -1;
        do {
          let roll = randomInteger(10);
          attempts++;
          fr += roll;
        } while (roll === 10 && attempts <= 5);
      }

      const fv = fr - skill;

      if (fv <= 0) {
        return {
          value: 1 + stat + skill,
          rolls: [
            {value: 1, name: "1d10!"},
            {value: stat, name: "STAT"},
            {value: skill, name: "SKILL"},
          ],
          fr
        };
      } else {
        return {
          value: 0 + stat + skill - (fr - skill - 0) + 0,
          rolls: [
            {value: stat, name: "STAT"},
            {value: skill, name: "SKILL"},
            {value: -(fr - skill), name: "FV"},
          ],
          fr
        };
      }
    }

    // Everything else
    return {
      value: firstRoll + stat + skill,
      rolls: [
        {value: firstRoll, name: "1d10!"},
        {value: stat, name: "STAT"},
        {value: skill, name: "SKILL"}
      ]
    };
  };
}

registerMod(Haggle);
