class QuenState implements State {
  Quen: {
    quenedEntities: Record<string, boolean>,
  };
}

/* TODO: Automatically apply shield without having to click button in chat. Issue is finding selected token */
class Quen {
  private readonly HP_BAR_ID = 1;
  private readonly HP_BAR_VALUE_PROPERTY: keyof GraphicObjectProperties = `bar${this.HP_BAR_ID}_value`;
  private readonly TEMP_BAR_ID = 3;
  private readonly TEMP_BAR_VALUE_PROPERTY: keyof GraphicObjectProperties = `bar${this.TEMP_BAR_ID}_value`;
  private readonly TEMP_BAR_MAX_PROPERTY: keyof GraphicObjectProperties = `bar${this.TEMP_BAR_ID}_max`;

  public init() {
    state.quenedEntities = state.quenedEntities || {};
    this.setupEventHandlers();
  }

  private setupEventHandlers() {
    on<"graphic">(`change:graphic:${this.HP_BAR_VALUE_PROPERTY}`, _.bind(this.handleHealthChange, this));
    on("chat:message", _.bind(this.handleChatMessage, this));
  }

  /*
   * Auto apply Quen effect when player casts Quen
   */
  private handleChatMessage(msg: Message) {
    if(msg.type === "general" && msg.content.indexOf("spell-name=Quen") !== -1) {
      const staCostRegex = /\{\{cost=(\d+?)\}\}/;
      const staUsedMatch = msg.content.match(staCostRegex);
      if (!staUsedMatch || staUsedMatch.length < 2) return;

      const staUsed = parseInt(staUsedMatch[1], 10);
      if (staUsed <= 0) return;

      // Trigger quen command
      sendChat(msg.who, "[Apply Shield](!quen " + staUsed + ")");
      return;
    }

    /*
     * Apply Quen effect and temp HP on "!quen X" command where X is the number of
     * STA spent
     */
    if(msg.type === "api" && msg.content.indexOf("!quen ") !== -1) {
      const apiMessage = <ApiMessage>msg;
      const args = msg.content.split(" ");
      const staUsed = parseInt(args[1], 10);
      const shieldHp = staUsed * 5;
      const selectedToken = getObj("graphic", apiMessage.selected![0].id);
      if (!selectedToken) return;

      // Store that this character has Quen
      this.addQuenTo(selectedToken, shieldHp);
      return;
    }
  }

  private addQuenTo(token: GraphicObject, hp: number) {
    // Store that this token has quen
    state.quenedEntities[token.get("id")] = true;

    // Apply aura and tint
    token.set("aura1_radius", 0.2);
    token.set("aura1_color", "#00ffff");
    token.set("tint_color", "#00ffff");

    // Set temp HP
    token.set(this.TEMP_BAR_MAX_PROPERTY, hp);
    token.set(this.TEMP_BAR_VALUE_PROPERTY, hp);
  }

  private removeQuenFrom(token: GraphicObject) {
    // If this entity is not quened do nothing
    if (!state.quenedEntities || !state.quenedEntities[token.get("id")]){
      return;
    }

    // Remove this entity's quen from state
    delete state.quenedEntities[token.get("id")];

    // Remove aura and tint
    token.set("aura1_radius", "");
    token.set("aura1_color", "transparent");
    token.set("tint_color", "transparent");

    // Remove temp HP
    token.set(this.TEMP_BAR_MAX_PROPERTY, "");
    token.set(this.TEMP_BAR_VALUE_PROPERTY, "");
  }

  /* Automatically removes temp HP if they exist.
   *
   * When a token has its HP reduced the script checks to see if there are any
   * temp HP available. If it does those are removed first and the real HP is
   * updated to reflect the temp HP absorbing the hit.
   */
  private handleHealthChange(obj: GraphicObject, prev: GraphicObjectProperties) {
    const prevHpValStr = prev[this.HP_BAR_VALUE_PROPERTY];
    const prevHpVal = parseInt(prevHpValStr, 10);
    if (isNaN(prevHpVal)) {
      this.logger("handleHealthChange", `WARN: Previous bar ${this.HP_BAR_ID} does not contain a number: '${prevHpValStr}'`);
      return;
    }

    const hpValStr = obj.get(this.HP_BAR_VALUE_PROPERTY);
    const hpVal = parseInt(hpValStr, 10);
    if (isNaN(hpVal)) {
      this.logger("handleHealthChange", `WARN: Bar ${this.HP_BAR_ID} does not contain a number: '${hpValStr}'`);
      return;
    }

    if (prevHpVal > hpVal) {
      const tmpHpVal = parseInt(obj.get(this.TEMP_BAR_VALUE_PROPERTY), 10);
      if (!isNaN(tmpHpVal)) {
        const hpChange = prevHpVal - hpVal;
        const remainingTmp = tmpHpVal - hpChange;
        if (remainingTmp > 0) {
          obj.set(this.TEMP_BAR_VALUE_PROPERTY, remainingTmp);
          obj.set(this.HP_BAR_VALUE_PROPERTY, prevHpVal);
        }
        else {
          const remainingHp = prevHpVal + remainingTmp;
          obj.set(this.TEMP_BAR_VALUE_PROPERTY, 0);
          obj.set(this.HP_BAR_VALUE_PROPERTY, remainingHp);

          // If we HAD quen remove it now
          this.removeQuenFrom(obj);
        }
      }
    }
  }

  private logger(functionName: string, msg: string) {
    log(`[Quen] ${functionName}: ${msg}`);
  }

}

const QuenInstance = new Quen();

on('ready',function() {
  QuenInstance.init();
});
