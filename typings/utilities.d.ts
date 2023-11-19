/*
  You can use this function to log output to the API console on the Script Editor page. 
  Useful for debugging your scripts and getting a better handle on what's going on inside the API sandbox.
  @see https://help.roll20.net/hc/en-us/articles/360037256774-API-Utility-Functions#API:UtilityFunctions-Logging
 */
declare function log(message: string): void;

/*
  These two functions will move an object on the tabletop to the front of layer it is currently on. 
  Note that you must pass in an actual object, such as one you receive in an event callback or by calling getObj or findObjs.
  @see https://help.roll20.net/hc/en-us/articles/360037256774-API-Utility-Functions#API:UtilityFunctions-ObjectLayering
 */
declare function toFront(obj: Roll20Object): void;

/*
  These two functions will move an object on the tabletop to the back of layer it is currently on. 
  Note that you must pass in an actual object, such as one you receive in an event callback or by calling {@link getObj} or {@link findObjs}.
  @see https://help.roll20.net/hc/en-us/articles/360037256774-API-Utility-Functions#API:UtilityFunctions-ObjectLayering
 */
declare function toBack(obj: Roll20Object): void;

/*
  <strong>Use This Function For Dice!</strong>
  This function accounts for {@link http://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle#Modulo_bias Modulo Bias} which ensures that 
  the resulting random numbers are also evenly distributed between 1 and MAX.

  @returns A random integer, with the lowest value being 1, and the highest value being max. This is the same functionality that Roll20 uses to power its 
  dice rolls, and these numbers have been statistically and rigorously proven to be random.
  @see https://help.roll20.net/hc/en-us/articles/360037256774-API-Utility-Functions#API:UtilityFunctions-RandomNumbers
 */
declare function randomInteger(max: number): number;

/*
  The Player Is GM function returns a boolean response on whether a player in the game is a GM or not. The function will always return the correct answer 
  depending on the current moment, so even if a GM chooses to re-join as a player or a player is promoted to a GM mid-game, {@link playerIsGM} will respond 
  accordingly without any need to clear a cache or restart the API sandbox.
  @see https://help.roll20.net/hc/en-us/articles/360037256774-API-Utility-Functions#API:UtilityFunctions-PlayerIsGM
 */
declare function playerIsGM(playerId: NotImplemented): boolean;

/*
  Sets the default token for the supplied Character Object to the details of the supplied Token Object. Both objects must already exist. 
  This will overwrite any default token currently associated with the character.
  @see https://help.roll20.net/hc/en-us/articles/360037256774-API-Utility-Functions#API:UtilityFunctions-Character
 */
declare function setDefaultTokenForCharacter(character: NotImplemented, token: NotImplemented): void;

/*
  Spawns a brief effect at the location at x,y of type. If you omit the pageId or pass 'undefined', then the page the players 
  are currently on ('playerpageid' in the Campaign object) will be used by default.

  For built-in effects type should be a string and be one of the following:beam-color, bomb-color, breath-color, bubbling-color, 
  burn-color, burst-color, explode-color, glow-color, missile-color, nova-color, splatter-color

  Where "color" in the above is one of: acid, blood, charm, death, fire, frost, holy, magic, slime, smoke, water

  For custom effects, type should be the ID of the custfx object for the custom effect.
  @see https://help.roll20.net/hc/en-us/articles/360037256774-API-Utility-Functions#API:UtilityFunctions-SpecialEffects(FX)
 */
declare function spawnFx(x: number, y: number, type: EffectType, pageId: NotImplemented): void;

/*
  Works the same as spawnFx, but instead of a single point you pass in two points, in the format {x: 100, y: 100}. 
  
  For example: spawnFxBetweenPoints({x: 100, y: 100}, {x: 400, y: 400}, "beam-acid"); 
  The effect will "travel" between the two points for effects that support that (the same ones that allow agency on the client side).

  The following effect types must always use spawnFxBetweenPoints instead of spawnFx: beam-color, breath-color, splatter-color
  @see https://help.roll20.net/hc/en-us/articles/360037256774-API-Utility-Functions#API:UtilityFunctions-SpecialEffects(FX)
 */
declare function spawnFxBetweenPoints(point1: Point, point2: Point, type: EffectType, pageId: NotImplemented): void;

/*
  Spawns an ad-hoc custom effect using the JSON for some effect definition at the location x,y. 
  If you omit the pageId or pass 'undefined', then the page the players are currently on ('playerpageid' in the Campaign object) will be used by default.

  definitionJSON is a javascript object following the JSON specification for {@link https://help.roll20.net/hc/en-us/articles/360037258714 Custom FX}.
  @see https://help.roll20.net/hc/en-us/articles/360037256774-API-Utility-Functions#API:UtilityFunctions-SpecialEffects(FX)
 */
declare function spawnFxWithDefinition(x: number, y: number, definitionJSON: NotImplemented, pageId: NotImplemented): void;

/*
  The play function takes in the Folder ID (get it from the "_jukeboxfolder" property in the Campaign object) of the playlist, 
  and will begin playing that playlist for everyone in the game.
  @see https://help.roll20.net/hc/en-us/articles/360037256774-API-Utility-Functions#API:UtilityFunctions-JukeboxPlaylists
 */
declare function playJukeboxPlaylist(playlistId: NotImplemented): void;

/*
  The stop function does not require any arguments, and will stop any playlist that is currently playing.
  @see https://help.roll20.net/hc/en-us/articles/360037256774-API-Utility-Functions#API:UtilityFunctions-JukeboxPlaylists
 */
declare function stopJukeboxPlaylist(): void;

/*
  Sends a "ping" the tabletop (the same as if a player holds down their mouse button). You must specify the top/left coordinates, and the pageid of the
  page to be pinged. You can optionally specify the ID of a player who performed the ping -- if you don't "api" will be assumed and the ping will be yellow.

  You can pass in "true" for the moveAll option if you want to move the players' views to that location as well.

  You can set the player IDs in visibleTo for the players who can see or be moved by the ping. This is presented as a single player ID, an array, 
  or a comma-delimited string.
  @see https://help.roll20.net/hc/en-us/articles/360037256774-API-Utility-Functions#API:UtilityFunctions-Miscellaneous
 */
declare function sendPing(
  left: number,
  top: number,
  pageId: NotImplemented,
  playerId?: NotImplemented,
  moveAll?: boolean,
  visibleTo?: NotImplemented | NotImplemented[] | string
): void;
