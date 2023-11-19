interface NotImplemented {
  dummy: never;
}

declare type CssColor = "transparent" | `#${string}`;
declare type Point = { x: number; y: number; };
declare type LayerName = "gmlayer" | "objects" | "map" | "walls";
declare type ObjectId = string;
declare type ObjectIdCsv = string;
declare type PlayerList = "all" | ObjectIdCsv;
declare type ImgSrc = `${"https://s3.amazonaws.com/files.d20.io/images/" | "https://s3.amazonaws.com/files.staging.d20.io/images/"}${string}`;

declare type MarkerType = "red" | "blue" | "green" | "brown" | "purple" | "pink" | "yellow" | "dead" | "skull" | "sleepy" | "half-heart" | "half-haze" |
  "interdiction" | "snail" | "lightning-helix" | "spanner" | "chained-heart" | "chemical-bolt" | "death-zone" | "drink-me" | "edge-crack" | "ninja-mask" |
  "stopwatch" | "fishing-net" | "overdrive" | "strong" | "fist" | "padlock" | "three-leaves" | "fluffy-wing" | "pummeled" | "tread" | "arrowed" | "aura" |
  "back-pain" | "black-flag" | "bleeding-eye" | "bolt-shield" | "broken-heart" | "cobweb" | "broken-shield" | "flying-flag" | "radioactive" | "trophy" |
  "broken-skull" | "frozen-orb" | "rolling-bomb" | "white-tower" | "grab" | "screaming" | "grenade" | "sentry-gun" | "all-for-one" | "angel-outfit" |
  "archery-target";

declare type EffectType = ""; // TODO: Dynamically build this? All except beam-color, breath-color, splatter-color
declare type DirectionalEffectType = EffectType | "";  // TODO: Dynamically build this?