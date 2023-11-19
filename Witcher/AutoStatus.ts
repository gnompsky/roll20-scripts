class AutoStatus {
  private readonly HP_BAR_ID = 1;
  private readonly HP_BAR_PROPERTY: keyof GraphicObjectProperties = `bar${this.HP_BAR_ID}_value`;
  private readonly STA_BAR_ID = 2;
  private readonly STA_BAR_PROPERTY: keyof GraphicObjectProperties = `bar${this.STA_BAR_ID}_value`;

  public init() {
    this.setupEventHandlers();
  }

  private setupEventHandlers() {
    on(
      `change:graphic:${this.HP_BAR_PROPERTY}`,
      (obj, prev) => this.handleBarChange(obj, prev, this.HP_BAR_ID, this.HP_BAR_PROPERTY, "dead")
    );
    on(
      `change:graphic:${this.STA_BAR_PROPERTY}`,
      (obj, prev) => this.handleBarChange(obj, prev, this.STA_BAR_ID, this.STA_BAR_PROPERTY, "sleepy", this.onStunEmpty)
    );
  }

  private handleBarChange(
    obj: GraphicObject,
    prev: GraphicObjectProperties,
    barId: number,
    barProperty: keyof GraphicObjectProperties,
    statusOnEmpty: string,
    onEmptyCallback?: (obj: GraphicObject) => void
  ) {
    const barValStr = obj.get(barProperty);
    const barVal = parseInt(barValStr, 10);
    if (isNaN(barVal)) {
      log(`[AutoStatus] handleBarChange: Bar ${barId} does not contain a number: '${barValStr}'`);
      return;
    }

    obj.set(`status_${statusOnEmpty}`, barVal <= 0);

    if (onEmptyCallback) {
      const prevVal = parseInt(prev[barProperty], 10);
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

const AutoStatusInstance = new AutoStatus();

on("ready", () => {
  AutoStatusInstance.init();
});
