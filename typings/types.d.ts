interface NotImplemented {
  dummy: never;
}

declare type CssColor = "transparent" | `#${number}`;
declare type Point = { x: number; y: number; };

/*
  @see https://help.roll20.net/hc/en-us/articles/360037772793-API-Objects#API:Objects-Path
 */
declare type PathObjectProperties = Roll20ObjectProperties & {
  _type: "path";
  _path: string;
  fill: CssColor;
  stroke: CssColor;
  rotation: number;
  layer: "gmlayer" | "objects" | "map" | "walls";
  stroke_width: number;
  width: number;
  height: number;
  top: number;
  left: number;
  scaleX: number;
  scaleY: number;
  controlledby: "all" | string;
  barrierType: "wall" | "oneWay" | "transparent";
  oneWayReversed: boolean;
};
declare type PathObject = Roll20Object<PathObjectProperties>;

/*
  @see https://help.roll20.net/hc/en-us/articles/360037772793-API-Objects#Window
 */
declare type WindowObjectProperties = Roll20ObjectProperties & {
  _type: "window";
  _pageid: string;
  _path: string;
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

declare type Roll20ObjectProperties = {
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
