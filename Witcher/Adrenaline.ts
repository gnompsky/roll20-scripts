class Adrenaline implements Mod {
  private static readonly ADRENALINE_ATTR = "_adrenaline";
  private static readonly ADRENALINE_STATUS = "status_green";
  
  public initialise(): void {}
  public registerEventHandlers(): void {
    on("chat:message", _.bind(this.handleChatMessage, this));
    on("change:attribute", _.bind(this.handleAdrenalineChange, this));
  }

  private handleChatMessage(m: OneOfMessage) {
    if (messageIsApiCommand(m, "adrenaline")) {
      const msg = <ApiMessage>m;
      const args = msg.content.split(" ");
      const command = args[1];

      if (!msg.selected || msg.selected.length <= 0){
        sendChat(msg.who, "/me you must select a token to manage adrenaline dice");
        return;
      }

      const selectedToken = getObj('graphic', msg.selected[0]._id)!;
      const tokenRepresents = selectedToken.get("represents");
      if (!tokenRepresents){
        sendChat(msg.who, "/me the selected token does not represent a character!");
        return;
      }
      const selectedCharacter = getObj('character', tokenRepresents)!;

      // Try and get the character's adrenaline. If the character doesn't have an adrenaline attribute, add one
      let selectedCharacterAdrenalineAttr = getAttrObjectByName(tokenRepresents, Adrenaline.ADRENALINE_ATTR);
      if (!selectedCharacterAdrenalineAttr){
        selectedCharacterAdrenalineAttr = createObj('attribute', {
          name: Adrenaline.ADRENALINE_ATTR,
          current: "0",
          _characterid: selectedCharacter.id
        });
      }

      if (command === "add"){
        this.addAdrenaline(selectedToken, selectedCharacter, selectedCharacterAdrenalineAttr);
      } else if (command === "spend") {
        this.spendAdrenaline(selectedToken, selectedCharacter, selectedCharacterAdrenalineAttr);
      }

      return;
    }
  }

  private addAdrenaline(token: GraphicObject, character: CharacterObject, attribute: AttributeObject) {
    const who = character.get("name");

    // Get current body stat and modifier to caculate max adrenaline die
    const characterBody = getAttrByNameAsInt(character.id, "total_body");
    const characterBodyStatSum = getAttrByNameAsInt(character.id, "bodystatsum");
    const maxAdrenaline = (characterBody || 0) + (characterBodyStatSum || 0);

    // Get current adrenaline and add 1
    const currentAdrenaline = parseInt(attribute.get("current"));
    if (currentAdrenaline >= maxAdrenaline) {
      sendChat(who, "/me can't hold any more adrenaline dice");
      return;
    }
    const newAdrenaline = Math.min(maxAdrenaline, currentAdrenaline + 1);
    attribute.set("current", ""+newAdrenaline);

    // Trigger status marker change
    this.handleAdrenalineChange(attribute);

    // Send a notification to chat
    sendChat(character.get("name"), "/me gained an adrenaline die!");
  }

  private spendAdrenaline(token: GraphicObject, character: CharacterObject, attribute: AttributeObject) {
    const who = character.get("name");

    // Check we have any adrenaline to spend
    const currentAdrenaline = parseInt(attribute.get("current"));
    if (currentAdrenaline <= 0){
      sendChat(who, "/me doesn't have any adrenaline to spend");
      return;
    }

    // Get current stamina and subtract 10
    const staAttribute = getAttrObjectByName(character.id, "sta");
    if (!staAttribute) {
      sendChat(who, "/me does not have a STA attribute");
      return;
    }
    
    const currentSta = parseInt(staAttribute.get("current"));
    if (currentSta >= 10) {
      staAttribute.set("current", ""+(currentSta - 10));
    } else {
      sendChat(who, "/me tried to spend an adrenaline die but does not have enough STA");
      return;
    }

    // Get current adrenaline and subtract 1
    const newAdrenaline = Math.max(0, currentAdrenaline - 1);
    attribute.set("current", ""+newAdrenaline);

    // Trigger status marker change
    this.handleAdrenalineChange(attribute);

    // Send a notification to chat that includes the die roll
    sendChat(who, "/me spent an adrenaline die for [[1d10]]! This can be added to a single attack's damage, a single roll or added as temporary HP.");
  }

  private handleAdrenalineChange(obj: AttributeObject) {
    // On Adrenaline attribute change, update the status marker
    // This doesn't trigger when we update the attribute via script, so we also call this manually
    if(obj.get("name") === Adrenaline.ADRENALINE_ATTR) {
      const characterId = obj.get('_characterid');
      const currentAdrenaline = parseInt(obj.get('current'), 10);
      const tokens = <GraphicObject[]>findObjs({ _type: 'graphic', represents: characterId });

      const statusValue = currentAdrenaline > 0
        ? currentAdrenaline
        : false;

      _.each(tokens, token => token.set(Adrenaline.ADRENALINE_STATUS, ""+statusValue));
    }
  };
}

registerMod(Adrenaline);
