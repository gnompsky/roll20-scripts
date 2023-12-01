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

declare type EffectCategory = "bomb" | "bubbling" | "burn" | "burst" | "explode" | "glow" | "missile" | "nova";
declare type DirectionalEffectCategory = EffectCategory | "beam" | "breath" | "splatter";
declare type EffectColor = "acid" | "blood" | "charm" | "death" | "fire" | "frost" | "holy" | "magic" | "slime" | "smoke" | "water"
declare type EffectType = `${EffectCategory}-${EffectColor}` | ObjectId;
declare type DirectionalEffectType = `${DirectionalEffectCategory}-${EffectColor}` | ObjectId;

/* @see https://wiki.roll20.net/Custom_FX#Custom_FX_Tool */
declare type CustomFxDefinition = {
  angle: number;
  angleRandom: number;
  duration: number;
  emissionRate: number;
  gravity: Point;
  lifeSpan: number;
  maxParticles: number;
  sharpness: number;
  size: number;
  sizeRandom: number;
  speed: number;
  speedRandom: number;
  startColour: [number, number, number, number];
  startColourRandom: [number, number, number, number];
  endColour: [number, number, number, number];
  endColourRandom: [number, number, number, number];
  onDeath: EffectCategory;
};