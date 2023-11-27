declare type Mod<TState extends StateValue = boolean> = {
  initialise(): void;
  registerEventHandlers(): void;
};

function logger<TMod extends Mod>(type: { new(): TMod}, message: any) {
  const encodedMessage = typeof message === "string" ? message : JSON.stringify(message);
  log(`[${type.name}] ${encodedMessage}`);
}

function registerMod<TMod extends Mod<TState>, TState extends StateValue = {}>(modType: { new(): TMod} ) {
  logger(modType, "Instantiating");
  const instance = new modType();

  on('ready', function() {
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

function getAttrObjectByName(character_id: ObjectId, attribute_name: string): AttributeObject | undefined {
  const matches = findObjs({ _type: "attribute", _characterid: character_id, name: attribute_name });
  return matches?.length ? matches[0] as AttributeObject : undefined;
}
function getAttrByNameAsInt(character_id: ObjectId, attribute_name: string, value_type: "current" | "max" = "current"): number | undefined {
  const stringValue = getAttrByName(character_id, attribute_name, value_type);
  return stringValue ? parseInt(stringValue, 10) : undefined;
}

function pickFromList<T>(list: T[]): T {
  return _.sample(list, 1)[0];
}

type PickableTable = {
  min?: number;
  /* If omitted, the roll must match minOrExact exactly to be picked */
  max?: number;
  exact?: number;
}
function pickFromTable<T extends PickableTable>(table: T[], diceSize: number) {
  const roll = randomInteger(diceSize);
  return Object.assign({}, table.find(x => {
    return x.exact === roll || (x.min && x.max && x.min <= roll && x.max >= roll);
  }));
}
