declare type Mod<TState extends StateValue = boolean> = {
  initialise(): void;
  registerEventHandlers(): void;
};

function logger<TMod extends Mod>(type: { new(): TMod}, message: any, functionName?: string) {
  const functionNameOrEmpty = functionName ? `${functionName}: ` : logger.caller || "";
  const encodedMessage = typeof message === "string" ? message : JSON.stringify(message);
  log(`[${type.name}] ${functionNameOrEmpty}${encodedMessage}`);
}

function registerMod<TMod extends Mod<TState>, TState extends StateValue = {}>(modType: { new(): TMod} ) {
  logger(modType, "Instantiating");
  const instance = new modType();

  on('ready',function() {
    logger(modType, "setupState()");
    if (!state.hasOwnProperty(modType.name) || !state[modType.name]) state[modType.name] = <TState>{};
    
    logger(modType, "initialise()");
    instance.initialise();

    logger(modType, "registerEventHandlers()");
    instance.registerEventHandlers();
  });
}

// TODO: Why can't we infer TState???!?!!?!?
function getState<
  TMod extends Mod<TState>,
  TState extends StateValue = TMod extends Mod<infer T> ? T : never
>(mod: TMod): TState {
  return <TState>state[mod.constructor.name];
}

function messageIsApiCommand(message: OneOfMessage, commandPrefix: string, expectArguments: boolean = true): boolean {
  return messageIsOneOf(message, "api") && message.content.startsWith(`!${commandPrefix}${expectArguments ? " " : ""}`);
}
function messageIsOneOf(message: OneOfMessage, ...types: OneOfMessage["type"][]): boolean {
  return types.indexOf(message.type) !== -1;
}
function messageContains(message: OneOfMessage, substring: string): boolean {
  return message.content.indexOf(substring) !== -1;
}