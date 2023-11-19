// TODO: This needs work!
declare type State = boolean |
  number |
  string |
  (boolean | number | string)[] |
  Record<string, boolean | number | string>;

declare const state: Record<string, State>;