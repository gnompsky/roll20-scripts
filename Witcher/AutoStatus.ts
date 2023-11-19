class AutoStatus implements Mod {
  private readonly HP_BAR_ID = 1;
  private readonly HP_BAR_PROPERTY = "bar1_value";
  private readonly STA_BAR_ID = 2;
  private readonly STA_BAR_PROPERTY = "bar2_value";

  public initialise(): void {}
  public registerEventHandlers(): void {
    on<"graphic">(
      `change:graphic:${this.HP_BAR_PROPERTY}`,
      (obj, prev) => this.handleBarChange(obj, prev, this.HP_BAR_ID, this.HP_BAR_PROPERTY, "dead")
    );

    on<"graphic">(
      `change:graphic:${this.STA_BAR_PROPERTY}`,
      (obj, prev) => this.handleBarChange(obj, prev, this.STA_BAR_ID, this.STA_BAR_PROPERTY, "sleepy", this.onStunEmpty)
    );
  }

  private handleBarChange(
    obj: GraphicObject,
    prev: GraphicObjectProperties,
    barId: typeof this.HP_BAR_ID | typeof this.STA_BAR_ID,
    barProperty: typeof this.HP_BAR_PROPERTY | typeof this.STA_BAR_PROPERTY,
    statusOnEmpty: MarkerType,
    onEmptyCallback?: (obj: GraphicObject) => void
  ) {
    const barValStr = obj.get(barProperty);
    const barVal = typeof barValStr === "string" ? parseInt(barValStr, 10) : barValStr;
    if (isNaN(barVal)) {
      log(`[AutoStatus] handleBarChange: Bar ${barId} does not contain a number: '${barValStr}'`);
      return;
    }

    if (barVal <= 0) {
      logger(AutoStatus, `${barProperty} is now empty, ${obj.get("name")} is now ${statusOnEmpty}`);
    }
    obj.set(`status_${statusOnEmpty}`, barVal <= 0);

    if (onEmptyCallback) {
      const prevValStr = prev[barProperty];
      const prevVal = typeof prevValStr === "string" ? parseInt(prevValStr, 10) : prevValStr;
      if (prevVal > 0 &&
        barVal !== prevVal &&
        barVal <= 0 &&
        obj.get("_pageid") === Campaign().get("playerpageid")
      ) {
        onEmptyCallback(obj);
      }
    }
  }

  private onStunEmpty(obj: GraphicObject) {
    sendChat(
      obj.get("name"),
      "/me you are stunned! You can’t take any actions other than Recover and anyone attacking you only has to beat DC:10 to hit you until you " +
      "regain 20 STA and pass a STUN save!"
    );
  }
}

registerMod(AutoStatus);
