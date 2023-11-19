interface NotImplemented {
  dummy: never;
}

declare type CssColor = "transparent" | `#${number}`;
declare type Point = { x: number; y: number; };
declare type LayerName = "gmlayer" | "objects" | "map" | "walls";
declare type ControlledBy = "all" | string;

// TODO: Add docs to each property in these object properties
/*
  @see https://help.roll20.net/hc/en-us/articles/360037772793-API-Objects#API:Objects-Path
 */
declare type PathObjectProperties = Roll20ObjectProperties & {
  _type: "path";
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
  controlledby: ControlledBy;
  barrierType: "wall" | "oneWay" | "transparent";
  oneWayReversed: boolean;
};
declare type PathObject = Roll20Object<PathObjectProperties>;

/*
  @see https://help.roll20.net/hc/en-us/articles/360037772793-API-Objects#Window
 */
declare type WindowObjectProperties = Roll20ObjectProperties & {
  _type: "window";
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
declare type WindowObject = Roll20Object<WindowObjectProperties>;

/*
  @see https://help.roll20.net/hc/en-us/articles/360037772793-API:Objects-Door
 */
declare type DoorObjectProperties = Roll20ObjectProperties & {
  _type: "door";
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
declare type DoorObject = Roll20Object<DoorObjectProperties>;

/*
  @see https://help.roll20.net/hc/en-us/articles/360037772793-API:Objects-Text
 */
declare type TextObjectProperties = Roll20ObjectProperties & {
  _type: "text";
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
  controlledBy: ControlledBy;
};
declare type TextObject = Roll20Object<TextObjectProperties>;

/*
  @see https://help.roll20.net/hc/en-us/articles/360037772793-API:Objects-Text
 */
declare type GraphicObjectProperties = Roll20ObjectProperties & {
  _type: "graphic";
  _subtype: "token" | "card";
  _cardid?: number;
  imgsrc: string;
  bar1_link: string;
  bar2_link: string;
  bar3_link: string;
  represents: string;
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
  controlledBy: ControlledBy;
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
declare type GraphicObject = Roll20Object<GraphicObjectProperties>;

declare type Roll20ObjectProperties = {
  id: string;
  _id: string;
  _type: string;
  _pageid: string;
}
declare type Roll20Object<TProperties extends Record<string, any> = Roll20ObjectProperties> = {
  id: Roll20ObjectProperties["_id"];
  
  get(property: "_id"): TProperties["_id"];
  get(property: "_type"): TProperties["_type"];
  // TODO: Can we conditionally get the return type based on property type in TProperties?
  get(property: keyof TProperties): string;
  // TODO: Can we exclude readonly properties from TProperties here?
  set(property: keyof TProperties, value: string): void;
  set(newData: TProperties): void;
};

declare type EffectType = ""; // TODO: Dynamically build this? All except beam-color, breath-color, splatter-color
declare type DirectionalEffectType = EffectType | "";  // TODO: Dynamically build this?
