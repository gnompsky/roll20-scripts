class SiegeTools implements Mod {
  private readonly _inProgress: Record<ObjectId, NodeJS.Timeout | null> = {};
  private readonly _sfxTracks: JukeboxTrackObject[] = [];
  private readonly _vfxTypes: EffectType[] = ["bomb-smoke", "bomb-fire"];
  
  public initialise(): void {
    const sfxTracks = getJukeboxTracksByPlaylistName("SFX: Siege Weapons");
    if (sfxTracks?.length) {
      this._sfxTracks.length = 0;
      this._sfxTracks.push(...sfxTracks);
    }
  }
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
    const pathType = pathHelper.getPathType();
    if (pathType !== "Polygonal" && pathType !== "Oval") {
      sendChat("", `/w gm Bombardment cannot be started on a ${pathType} path`);
      return;
    }
    
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

      // Pick a VFX and prepare to play it
      const vfxType = pickFromList(this._vfxTypes)!;
      const playVfx = () => spawnFx(x, y, vfxType, target.get("_pageid"));
      
      // Pick an SFX and prepare to play it
      const sfxTrack = pickFromList(this._sfxTracks);
      
      if (sfxTrack) {
        // If we have an SFX, play it and then play the VFX on a slight delay to give Roll20 time to start the sound
        sfxTrack.set("loop", false);
        sfxTrack.set("softstop", false);
        sfxTrack.set("playing", true);
        setTimeout(playVfx, 200);
      } else {
        // If we don't have SFX, just play the VFX immediately
        playVfx();
      }
    }, interval);
  }
  
  private stopBombardment(targetId: ObjectId) {
    const timer = this._inProgress[targetId];
    if (!timer) return;

    clearTimeout(timer);
    delete this._inProgress[targetId];
  }
}

registerMod(SiegeTools);
