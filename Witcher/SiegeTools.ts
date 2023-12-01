class SiegeTools implements Mod {
  private readonly _inProgress: Record<ObjectId, NodeJS.Timeout | null> = {};
  
  public initialise(): void {}
  public registerEventHandlers(): void {
    on("chat:message", _.bind(this.handleChatMessage, this)); 
  }

  private handleChatMessage(m: OneOfMessage) {
    if (!messageIsApiCommand(m, "siege")) return;
    const msg = m as ApiMessage;

    const args = msg.content.split(" ");
    if (args.length < 2) sendChat(msg.who, "/w gm Usage: !siege hit");

    const command = args[1].toLowerCase();
    switch(true) {
      case command === "start" && args.length >= 3: return this.handleStartBombardment(msg, parseInt(args[2], 10));
      case command === "stop": return this.handleStopBombardment(msg);
      default: return sendChat(msg.who, `/w gm Unrecognised command (${command}) or bad arguments`);
    }
  }
  
  private handleStartBombardment(msg: ApiMessage, interval: number) {
    if (!msg.selected?.length || msg.selected[0]._type !== "path") {
      return sendChat(msg.who, "/w gm Please select a path to define an area for bombardment");
    }
    
    const target = getObj("path", msg.selected[0]._id)!;
    this.startBombardment(target, interval);
  }
  
  private handleStopBombardment(msg: ApiMessage) {
    if (!msg.selected?.length || msg.selected[0]._type !== "path") {
      return sendChat(msg.who, "/w gm Please select a path that is being bombarded");
    }
    
    return this.stopBombardment(msg.selected[0]._id);
  }
  
  private startBombardment(target: PathObject, interval: number) {
    this.stopBombardment(target.id);

    const pathHelper = new PathHelper(target);
    
    this._inProgress[target.id] = setInterval(() => {
      const point = pathHelper.tryGetPointWithinPath();
      if (!point) return logger(SiegeTools, "Failed to resolve point for bombardment");
      
      // Top, Left is the centre point of the polygon. We need to offset by half the width/height of the polygon, and then scale.
      const x = target.get("left") 
        - (target.get("width") / 2) 
        + (point.x * target.get("scaleX"));
      const y = target.get("top")
        - (target.get("height") / 2)
        + (point.y * target.get("scaleY"));

      const type = pickFromList(SiegeTools.explosionEffects);

      spawnFx(x, y, type, target.get("_pageid"));
    }, interval);
  }
  
  private stopBombardment(targetId: ObjectId) {
    const timer = this._inProgress[targetId];
    if (!timer) return;

    clearTimeout(timer);
    delete this._inProgress[targetId];
  }
  
  private static readonly explosionEffects: EffectType[] = ["bomb-smoke", "bomb-fire"];
}

registerMod(SiegeTools);
