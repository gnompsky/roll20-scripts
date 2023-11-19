// TODO: This needs work!
declare type State = Record<string, StateValue>;

declare type StatePrimitiveValue = boolean | number | string; 
declare type StateValue = StatePrimitiveValue | 
  (StatePrimitiveValue | StatePrimitiveValue[] | Record<string, StatePrimitiveValue>)[] |
  Record<string, StatePrimitiveValue | StatePrimitiveValue[] | Record<string, StatePrimitiveValue>>;

declare const state: State;