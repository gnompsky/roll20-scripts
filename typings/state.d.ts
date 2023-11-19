// TODO: This needs work! It's hard to get correct without circular references
declare type State = Record<string, StateValue>;

//declare type StatePrimitiveValue = boolean | number | string;
declare type StateValue = any;
// declare type StateValue = StatePrimitiveValue | 
//   (StateValue | StateValue[] | Record<string, StateValue>)[] |
//   Record<string, StatePrimitiveValue | StatePrimitiveValue[] | Record<string, StatePrimitiveValue>>;

declare const state: State;