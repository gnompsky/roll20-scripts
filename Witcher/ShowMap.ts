module ShowMap {
  export type State = {
    mapPageId?: ObjectId;
  };
}

class ShowMap implements Mod<ShowMap.State> {
  public initialise(): void {
  }

  public registerEventHandlers(): void {
    on("chat:message", _.bind(this.handleChatMessage, this));
  }
  
  private handleChatMessage(m: OneOfMessage) {
    if (!messageIsApiCommand(m, "map")) return;
    const msg = <ApiMessage>m;
    const args = msg.content.split(" ");

    switch(true) {
      case args.length === 1: return this.toggleMap(msg);
      case args.length >= 3 && args[1] === "set": return this.setMap(msg, args.slice(2).join(" "));
      case args.length >= 3 && args[1] === "go": return this.goToMap(msg, args.slice(2).join(" "));
    }
  }

  private toggleMap(msg: ApiMessage) {
    const playerId = msg.playerid;
    const playerOnSpecificPage = !!(Campaign().get('playerspecificpages') || {})[playerId];
    
    const mapPageId = this.getState().mapPageId;
    if (!mapPageId) {
      sendChat(msg.who, "/w gm No default map page set, use !map set {name}");
      return;
    }
    
    const mapPage = getObj("page", mapPageId);
    if (!mapPage) {
      sendChat(msg.who, "/w gm Default map page did not resolve to a valid map, use !map set {name} to configure a real page");
      this.getState().mapPageId = undefined;
      return;
    }

    this.setPlayerMap(
      msg.who, 
      playerId, 
      mapPage.get("name"), 
      playerOnSpecificPage ? "return" : mapPageId
    );
  }
  
  private setMap(msg: ApiMessage, mapName: string) {
    const map = this.getMapByName(mapName);
    if (!map) {
      sendChat(msg.who, "/w gm Default map page did not resolve to a valid map, use !map set {name} to configure a real page");
      return;
    }

    this.getState().mapPageId = mapName;
    logger(ShowMap,`Set Map page to ${mapName}`);
    sendChat(msg.who, `/w gm Map set to ${mapName}`);
  }
  
  private goToMap(msg: ApiMessage, mapName: string) {
    if (mapName === "return") {
      this.setPlayerMap(msg.who, msg.playerid, mapName, mapName);
      return;
    }

    const mapPageId = this.getMapByName(mapName);
    if (!mapPageId) {
      sendChat(msg.who, "/w gm Default map page did not resolve to a valid map, use !map set {name} to configure a real page");
      return;
    }

    this.setPlayerMap(msg.who, msg.playerid, mapName, mapPageId);
  }
  
  private getMapByName(name: string): ObjectId | undefined {
    const mapPages = findObjs({_type: "page", name: name}) as PageObject[];
    if (mapPages.length === 0) {
      logger(ShowMap, "Failed to find map page with name " + name);
      return;
    }
    
    return mapPages[0].get("id");
  }
  
  private setPlayerMap(who: OneOfMessage["who"], playerId: ObjectId, mapName: string, mapId: ObjectId | "return") {
    logger(ShowMap, `Changing player ${playerId} to page ${mapId}`);

    const isReturn = mapId === "return";
    let playerSpecificPages = Campaign().get('playerspecificpages');

    if (isReturn) {
      if (playerSpecificPages && !!playerSpecificPages[playerId]) {
        delete playerSpecificPages[playerId];

        if (Object.keys(playerSpecificPages).length === 0) {
          playerSpecificPages = false;
        }
      }
    } else {
      playerSpecificPages = playerSpecificPages || {};
      playerSpecificPages[playerId] = mapId;
    }

    Campaign().set('playerspecificpages', false);
    Campaign().set('playerspecificpages', playerSpecificPages);

    const msg = isReturn ? "I'm back in the game" : "I'm just viewing the map " + mapName;
    sendChat(who, `/w gm ${msg}`);
  }

  private getState(): ShowMap.State {
    return getState<ShowMap, ShowMap.State>(this);
  }
}

registerMod(ShowMap);
