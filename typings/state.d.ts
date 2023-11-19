// TODO: This needs work!
declare type StateValue = boolean | number | string;
interface State extends Record<string, StateValue | StateValue[] | State> {}
declare const state: State;