﻿// TODO: Add docs to each property in these object properties
/* @see https://help.roll20.net/hc/en-us/articles/360037772793-API-Objects#API:Objects-Path */
declare type PathObjectProperties = Roll20ObjectProperties & {
  readonly _type: "path";
  _path: string;
  fill: CssColor;
  stroke: CssColor;
  rotation: number;
  layer: LayerName;
  stroke_width: number;
  width: number;
  height: number;
  top: number;
  left: number;
  scaleX: number;
  scaleY: number;
  controlledby: PlayerList;
  barrierType: "wall" | "oneWay" | "transparent";
  oneWayReversed: boolean;
};
/* @see https://help.roll20.net/hc/en-us/articles/360037772793-API-Objects#API:Objects-Path */
declare type PathObject = Roll20Object<PathObjectProperties> & {
  /* @see https://help.roll20.net/hc/en-us/articles/360037772793-API-Objects#API:Objects-object.remove() */
  remove(): void;
};

/* @see https://help.roll20.net/hc/en-us/articles/360037772793-API-Objects#Window */
declare type WindowObjectProperties = Roll20ObjectProperties & {
  readonly _type: "window";
  color: CssColor;
  x: number;
  y: number;
  isOpen: boolean;
  isLocked: boolean;
  path: {
    handle0: Point;
    handle1: Point;
  };
};
/* @see https://help.roll20.net/hc/en-us/articles/360037772793-API-Objects#Window */
declare type WindowObject = Roll20Object<WindowObjectProperties>;

/* @see https://help.roll20.net/hc/en-us/articles/360037772793-API:Objects-Door */
declare type DoorObjectProperties = Roll20ObjectProperties & {
  readonly _type: "door";
  color: CssColor;
  x: number;
  y: number;
  isOpen: boolean;
  isLocked: boolean;
  isSecret: boolean;
  path: {
    handle0: Point;
    handle1: Point;
  };
};
/* @see https://help.roll20.net/hc/en-us/articles/360037772793-API:Objects-Door */
declare type DoorObject = Roll20Object<DoorObjectProperties>;

/* @see https://help.roll20.net/hc/en-us/articles/360037772793-API:Objects-Text */
declare type TextObjectProperties = Roll20ObjectProperties & {
  readonly _type: "text";
  top: number;
  left: number;
  width: number;
  height: number;
  text: string;
  font_size: 8 | 10 | 12 | 14 | 16 | 18 | 20 | 22 | 26 | 32 | 40 | 56 | 72 | 100 | 200 | 300;
  rotation: number;
  // TODO: Can this also be hex? If so, can all the others also be RGB? I assume this is just a CSS colour string....
  color: `rgb(${number},${" " | ""}${number},${" " | ""}${number})`;
  font_family: string;
  layer: LayerName;
  controlledBy: PlayerList;
};
/* @see https://help.roll20.net/hc/en-us/articles/360037772793-API:Objects-Text */
declare type TextObject = Roll20Object<TextObjectProperties> & {
  /* @see https://help.roll20.net/hc/en-us/articles/360037772793-API-Objects#API:Objects-object.remove() */
  remove(): void;
};

/* @see https://help.roll20.net/hc/en-us/articles/360037772793-API:Objects-Text */
declare type GraphicObjectProperties = Roll20ObjectProperties & {
  readonly _type: "graphic";
  readonly _subtype: "token" | "card";
  readonly _cardid?: ObjectId;
  imgsrc: ImgSrc;
  bar1_link: ObjectId;
  bar2_link: ObjectId;
  bar3_link: ObjectId;
  represents: ObjectId;
  left: number;
  top: number;
  width: number;
  height: number;
  rotation: number;
  layer: LayerName;
  isdrawing: boolean;
  flipv: boolean;
  fliph: boolean;
  name: string;
  gmnotes: string;
  controlledBy: PlayerList;
  bar1_value: string | number;
  bar2_value: string | number;
  bar3_value: string | number;
  bar1_max: string | number;
  bar2_max: string | number;
  bar3_max: string | number;
  aura1_radius: "" | number;
  aura2_radius: "" | number;
  aura1_color: CssColor;
  aura2_color: CssColor;
  aura1_square: boolean;
  aura2_square: boolean;
  tint_color: CssColor;
  // TODO: Handle convenience methods for status markers?
  /* @see https://help.roll20.net/hc/en-us/articles/360037772793-API-Objects#API:Objects-ImportantNotesAboutStatusMarkers */
  statusmarkers: string;
  /* @see https://help.roll20.net/hc/articles/360041536113 */
  token_markers: string;
  showname: boolean;
  showplayers_name: boolean;
  showplayers_bar1: boolean;
  showplayers_bar2: boolean;
  showplayers_bar3: boolean;
  showplayers_aura1: boolean;
  showplayers_aura2: boolean;
  playersedit_name: boolean;
  playersedit_bar1: boolean;
  playersedit_bar2: boolean;
  playersedit_bar3: boolean;
  playersedit_aura1: boolean;
  playersedit_aura2: boolean;
  light_radius: string;
  light_dimradius: string;
  light_otherplayers: boolean;
  light_hassight: boolean;
  light_angle: `${number}`;
  light_losangle: `${number}`;
  lastmove: string;
  light_multiplier: `${number}`;
  adv_fow_view_distance: "" | `${number}`;
  light_sensitivity_multiplier: number;
  // TODO: This seems to have other values too
  night_vision_effect: string | "Dimming" | "Nocturnal";
  bar_location: "overlap_top" | "overlap_bottom" | "bottom";
  compact_bar: boolean;
  lockMovement: boolean;
};
/* @see https://help.roll20.net/hc/en-us/articles/360037772793-API:Objects-Text */
declare type GraphicObject = Roll20Object<GraphicObjectProperties> & {
  /* @see https://help.roll20.net/hc/en-us/articles/360037772793-API-Objects#API:Objects-ImportantNotesAboutStatusMarkers */
  get(property: `status_${MarkerType}${"" | "marker"}`): `${number}` | boolean;
  /* @see https://help.roll20.net/hc/en-us/articles/360037772793-API-Objects#API:Objects-ImportantNotesAboutStatusMarkers */
  set(property: `status_${MarkerType}${"" | "marker"}`, value: `${number}` | boolean): void;

  /* @see https://help.roll20.net/hc/en-us/articles/360037772793-API-Objects#API:Objects-object.remove() */
  remove(): void;
};

/* @see https://help.roll20.net/hc/en-us/articles/360037772793-API:Objects-Page */
declare type PageObjectProperties = Omit<Roll20ObjectProperties, "_pageid"> & {
  readonly _type: "page";
  readonly _zorder: string;
  name: string;
  showgrid: boolean;
  showdarkness: boolean;
  showlighting: boolean;
  width: number;
  height: number;
  snapping_increment: number;
  grid_opacity: number;
  fog_opacity: number;
  background_color: CssColor;
  gridcolor: CssColor;
  grid_type: "square" | "hex" | "hexr";
  scale_number: number;
  scale_units: "ft" | "m" | "km" | "mi" | "in" | "cm" | "un" | "hex" | "sq" | "custom";
  gridlabels: boolean;
  diagonaltype: "foure" | "pythagorean" | "threefive" | "manhattan";
  archived: boolean;
  lightupdatedrop: boolean;
  lightforcelos: boolean;
  lightrestrictmove: boolean;
  lightglobalillum: boolean;
  jukeboxtrigger: "nonestopall" | ObjectId;
};
/* @see https://help.roll20.net/hc/en-us/articles/360037772793-API:Objects-Page */
declare type PageObject = Roll20Object<PageObjectProperties>;

/* @see https://help.roll20.net/hc/en-us/articles/360037772793-API:Objects-Campaign */
declare type CampaignObjectProperties = Omit<Roll20ObjectProperties, "_pageid"> & {
  readonly _type: "campaign";
  turnorder: string;
  // TODO: Replace all string's that represent object IDs with a new ObjectId type (even if that is just a string too)
  initiativepage: false | ObjectId;
  playerpageid: false | ObjectId;
  playerspecificpages: false | Record<ObjectId, ObjectId>;
  _journalfolder: string;
  _jukeboxfolder: string;
};
/* @see https://help.roll20.net/hc/en-us/articles/360037772793-API:Objects-Campaign */
declare type CampaignObject = Roll20Object<CampaignObjectProperties>;

/* @see https://help.roll20.net/hc/en-us/articles/360037772793-API:Objects-Player */
declare type PlayerObjectProperties = Omit<Roll20ObjectProperties, "_pageid"> & {
  readonly _type: "player";
  readonly _d20userid: ObjectId;
  readonly _displayname: string;
  readonly _online: boolean;
  readonly _lastpage: ObjectId;
  readonly _macrobar: ObjectIdCsv;
  speakingas: "" | `${"character" | "player"}|${string})`;
  color: CssColor;
  showmacrobar: boolean;
};
/* @see https://help.roll20.net/hc/en-us/articles/360037772793-API:Objects-Player */
declare type PlayerObject = Roll20Object<PlayerObjectProperties>;

/* @see https://help.roll20.net/hc/en-us/articles/360037772793-API:Objects-Macro */
declare type MacroObjectProperties = Omit<Roll20ObjectProperties, "_pageid"> & {
  readonly _type: "macro";
  readonly _playerid: ObjectId;
  name: string;
  action: string;
  visibleto: PlayerList;
  istokenaction: boolean;
};
/* @see https://help.roll20.net/hc/en-us/articles/360037772793-API:Objects-Macro */
declare type MacroObject = Roll20Object<MacroObjectProperties> & {
  /* @see https://help.roll20.net/hc/en-us/articles/360037772793-API-Objects#API:Objects-object.remove() */
  remove(): void;
};

/* @see https://help.roll20.net/hc/en-us/articles/360037772793-API-Objects#API:Objects-RollableTable */
declare type RollableTableObjectProperties = Omit<Roll20ObjectProperties, "_pageid"> & {
  readonly _type: "rollabletable";
  name: string;
  showplayers: boolean;
};
/* @see https://help.roll20.net/hc/en-us/articles/360037772793-API-Objects#API:Objects-RollableTable */
declare type RollableTableObject = Roll20Object<RollableTableObjectProperties> & {
  /* @see https://help.roll20.net/hc/en-us/articles/360037772793-API-Objects#API:Objects-object.remove() */
  remove(): void;
};

/* @see https://help.roll20.net/hc/en-us/articles/360037772793-API-Objects#API:Objects-TableItem */
declare type TableItemObjectProperties = Omit<Roll20ObjectProperties, "_pageid"> & {
  readonly _type: "tableitem";
  readonly _rollabletableid: ObjectId;
  avatar: ImgSrc;
  name: string;
  weight: number;
};
/* @see https://help.roll20.net/hc/en-us/articles/360037772793-API-Objects#API:Objects-TableItem */
declare type TableItemObject = Roll20Object<TableItemObjectProperties> & {
  /* @see https://help.roll20.net/hc/en-us/articles/360037772793-API-Objects#API:Objects-object.remove() */
  remove(): void;
};

/* @see https://help.roll20.net/hc/en-us/articles/360037772793-API-Objects#API:Objects-Character */
declare type CharacterObjectProperties = Omit<Roll20ObjectProperties, "_pageid"> & {
  readonly _type: "character";
  avatar: ImgSrc;
  name: string;
  bio: string;
  gmnotes: string;
  archived: boolean;
  inplayerjournals: PlayerList;
  controlledby: PlayerList;
  readonly _defaulttoken: string;
};
/* @see https://help.roll20.net/hc/en-us/articles/360037772793-API-Objects#API:Objects-Character */
declare type CharacterObject = Roll20Object<CharacterObjectProperties> & {
  /* @see https://help.roll20.net/hc/en-us/articles/360037772793-API-Objects#API:Objects-object.remove() */
  remove(): void;
};

/* @see https://help.roll20.net/hc/en-us/articles/360037772793-API-Objects#API:Objects-Attribute */
declare type AttributeObjectProperties = Omit<Roll20ObjectProperties, "_pageid"> & {
  readonly _type: "attribute";
  readonly _characterid: ObjectIdCsv;
  name: string;
  current: string;
  max: string;
};
/* @see https://help.roll20.net/hc/en-us/articles/360037772793-API-Objects#API:Objects-Attribute */
declare type AttributeObject = Roll20Object<AttributeObjectProperties> & {
  /* @see https://help.roll20.net/hc/en-us/articles/360037772793-API-Objects#API:Objects-object.remove() */
  remove(): void;
};

/* @see https://help.roll20.net/hc/en-us/articles/360037772793-API-Objects#API:Objects-Ability */
declare type AbilityObjectProperties = Omit<Roll20ObjectProperties, "_pageid"> & {
  readonly _type: "ability";
  readonly _characterid: ObjectIdCsv;
  name: string;
  description: string;
  action: string;
  istokenaction: boolean;
};
/* @see https://help.roll20.net/hc/en-us/articles/360037772793-API-Objects#API:Objects-Ability */
declare type AbilityObject = Roll20Object<AbilityObjectProperties> & {
  /* @see https://help.roll20.net/hc/en-us/articles/360037772793-API-Objects#API:Objects-object.remove() */
  remove(): void;
};

/* @see https://help.roll20.net/hc/en-us/articles/360037772793-API-Objects#API:Objects-Handout */
declare type HandoutObjectProperties = Omit<Roll20ObjectProperties, "_pageid"> & {
  readonly _type: "handout";
  avatar: ImgSrc;
  name: string;
  notes: string;
  gmnotes: string;
  inplayerjournals: PlayerList;
  archived: boolean;
  controlledby: PlayerList;
};
/* @see https://help.roll20.net/hc/en-us/articles/360037772793-API-Objects#API:Objects-Handout */
declare type HandoutObject = Roll20Object<HandoutObjectProperties> & {
  /* @see https://help.roll20.net/hc/en-us/articles/360037772793-API-Objects#API:Objects-object.remove() */
  remove(): void;
};

/* @see https://help.roll20.net/hc/en-us/articles/360037772793-API-Objects#API:Objects-Deck */
declare type DeckObjectProperties = Omit<Roll20ObjectProperties, "_pageid"> & {
  readonly _type: "deck";
  name: string;
  _currentDeck: ObjectIdCsv;
  _currentIndex: number;
  _currentCardShown: boolean;
  showplayers: boolean;
  playerscandraw: boolean;
  avatar: ImgSrc;
  shown: boolean;
  players_seenumcards: boolean;
  players_seefrontofcards: boolean;
  gm_seenumcards: boolean;
  gm_seefrontofcards: boolean;
  infinitecards: boolean;
  _cardSequencer: number;
  cardsplayed: "faceup" | "facedown";
  defaultheight: string;
  defaultwidth: string;
  discardpilemode: "none" | "choosebacks" | "choosefronts" | "drawtop" | "drawbottom";
  _discardPile: ObjectIdCsv;
};
/* @see https://help.roll20.net/hc/en-us/articles/360037772793-API-Objects#API:Objects-Deck */
declare type DeckObject = Roll20Object<DeckObjectProperties>;

/* @see https://help.roll20.net/hc/en-us/articles/360037772793-API-Objects#API:Objects-Card */
declare type CardObjectProperties = Omit<Roll20ObjectProperties, "_pageid"> & {
  readonly _type: "card";
  name: string;
  avatar: ImgSrc;
  _deckid: ObjectId;
};
/* @see https://help.roll20.net/hc/en-us/articles/360037772793-API-Objects#API:Objects-Card */
declare type CardObject = Roll20Object<CardObjectProperties>;

/* @see https://help.roll20.net/hc/en-us/articles/360037772793-API-Objects#API:Objects-Hand */
declare type HandObjectProperties = Omit<Roll20ObjectProperties, "_pageid"> & {
  readonly _type: "hand";
  _parentid: ObjectId;
  currentHand: string;
  currentView: "bydeck" | "bycard";
};
/* @see https://help.roll20.net/hc/en-us/articles/360037772793-API-Objects#API:Objects-Hand */
declare type HandObject = Roll20Object<HandObjectProperties>;

/* @see https://help.roll20.net/hc/en-us/articles/360037772793-API-Objects#API:Objects-JukeboxTrack */
declare type JukeboxTrackObjectProperties = Omit<Roll20ObjectProperties, "_pageid"> & {
  readonly _type: "jukeboxtrack";
  playing: boolean;
  softstop: boolean;
  title: string;
  volume: number;
  loop: boolean;
};
/* @see https://help.roll20.net/hc/en-us/articles/360037772793-API-Objects#API:Objects-JukeboxTrack */
declare type JukeboxTrackObject = Roll20Object<JukeboxTrackObjectProperties>;

/* @see https://help.roll20.net/hc/en-us/articles/360037772793-API-Objects#API:Objects-CustomFX */
declare type CustomFXObjectProperties = Omit<Roll20ObjectProperties, "_pageid"> & {
  readonly _type: "custfx";
  name: string;
  definition: string;
};
/* @see https://help.roll20.net/hc/en-us/articles/360037772793-API-Objects#API:Objects-CustomFX */
declare type CustomFXObject = Roll20Object<CustomFXObjectProperties>;

declare type Roll20ObjectProperties = {
  id: ObjectId;
  _id: ObjectId;
  _type: "path" | "window" | "door" | "text" | "graphic" | "page" | "campaign" | "player" | "macro" | "rollabletable" | "tableitem" | "character" | 
    "attribute" | "ability" | "handout" | "deck" | "card" | "hand" | "jukeboxtrack";
  _pageid: ObjectId;
}
declare type Roll20Object<TProperties extends Record<string, any> = Roll20ObjectProperties> = {
  /* The globally unique ID of this object */
  readonly id: Roll20ObjectProperties["_id"];

  /* Get the globally unique ID of this object. This is identical to {@link id} */
  get(property: "_id"): TProperties["_id"];
  /* Get the type of the current object */
  get(property: "_type"): TProperties["_type"];

  // TODO: Can we conditionally get the return type based on property type in TProperties?
  /* Get the value of the given property of the current object */
  get(property: keyof TProperties): string;

  // TODO: Do we need to exclude other readonly properties from TProperties here?
  // TODO: This doesn't seem to omit any of the properties we don't want for some reason
  /* Set the value of the given property of the current object */
  set(property: Omit<keyof TProperties, "id" | "_id" | "_type" | "_pageid">, value: string): void;

  /* Set multiple values on the current object */
  set(newData: TProperties): void;
};

/* @see https://help.roll20.net/hc/en-us/articles/360037772793-API-Objects#API:Objects-createObj(type,attributes) */
declare function createObj(type: "graphic", attributes: GraphicObjectProperties): GraphicObject;
/* @see https://help.roll20.net/hc/en-us/articles/360037772793-API-Objects#API:Objects-createObj(type,attributes) */
declare function createObj(type: "text", attributes: TextObjectProperties): TextObject;
/* @see https://help.roll20.net/hc/en-us/articles/360037772793-API-Objects#API:Objects-createObj(type,attributes) */
declare function createObj(type: "path", attributes: PathObjectProperties): PathObject;
/* @see https://help.roll20.net/hc/en-us/articles/360037772793-API-Objects#API:Objects-createObj(type,attributes) */
declare function createObj(type: "character", attributes: CharacterObjectProperties): CharacterObject;
/* @see https://help.roll20.net/hc/en-us/articles/360037772793-API-Objects#API:Objects-createObj(type,attributes) */
declare function createObj(type: "ability", attributes: AbilityObjectProperties): AbilityObject;
/* @see https://help.roll20.net/hc/en-us/articles/360037772793-API-Objects#API:Objects-createObj(type,attributes) */
declare function createObj(type: "attribute", attributes: AttributeObjectProperties): AttributeObject;
/* @see https://help.roll20.net/hc/en-us/articles/360037772793-API-Objects#API:Objects-createObj(type,attributes) */
declare function createObj(type: "handout", attributes: HandoutObjectProperties): HandoutObject;
/* @see https://help.roll20.net/hc/en-us/articles/360037772793-API-Objects#API:Objects-createObj(type,attributes) */
declare function createObj(type: "rollabletable", attributes: RollableTableObjectProperties): RollableTableObject;
/* @see https://help.roll20.net/hc/en-us/articles/360037772793-API-Objects#API:Objects-createObj(type,attributes) */
declare function createObj(type: "tableitem", attributes: TableItemObjectProperties): TableItemObject;
/* @see https://help.roll20.net/hc/en-us/articles/360037772793-API-Objects#API:Objects-createObj(type,attributes) */
declare function createObj(type: "macro", attributes: MacroObjectProperties): MacroObject;

/* @see https://help.roll20.net/hc/en-us/articles/360037772793-API-Objects#API:Objects-Campaign()(function) */
declare function Campaign(): CampaignObject;

// TODO: This needs work!
declare type StateValue = boolean | number | string;
interface State extends Record<string, StateValue | StateValue[] | State> {}
declare const state: State;

/* @see https://help.roll20.net/hc/en-us/articles/360037772793-API-Objects#API:Objects-findObjs(attrs) */
declare function findObjs(
  attrs: Partial<PathObjectProperties> | Partial<WindowObjectProperties> | Partial<DoorObjectProperties> | Partial<TextObjectProperties> |
    Partial<GraphicObjectProperties> | Partial<PageObjectProperties> | Partial<CampaignObjectProperties> | Partial<PlayerObjectProperties> |
    Partial<MacroObjectProperties> | Partial<RollableTableObjectProperties> | Partial<TableItemObjectProperties> | Partial<CharacterObjectProperties> |
    Partial<AttributeObjectProperties> | Partial<AbilityObjectProperties> | Partial<HandoutObjectProperties> | Partial<DeckObjectProperties> |
    Partial<CardObjectProperties> | Partial<HandObjectProperties> | Partial<JukeboxTrackObjectProperties> | Partial<CustomFXObjectProperties>,
  options?: { caseInsensitive: boolean; }
): OneOfRoll20Object[];

/* @see https://help.roll20.net/hc/en-us/articles/360037772793-API-Objects#API:Objects-filterObjs(callback) */
declare function filterObjs(callback: (obj: OneOfRoll20Object) => boolean): void;

/* @see https://help.roll20.net/hc/en-us/articles/360037772793-API-Objects#API:Objects-getAllObjs() */
declare function getAllObjs(): OneOfRoll20Object[];