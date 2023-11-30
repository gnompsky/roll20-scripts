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

type TurnOrder = {
  /* 
    The ID of the Graphic object. 
    If this is set, the turn order list will automatically pull the name and icon for the list based on the graphic on the tabletop.
   */
  "id": ObjectId | "-1",
  /* The current value for the item in the list. Can be a number or text. */
  "pr": string | `${number}`;
  /* Custom title for the item. Will be ignored if ID is set to a value other than "-1". */
  "custom": string | undefined;
  /* The Page ID for this item. Currently this should always equal Campaign().get("initiativepage"). */
  "_pageid": ObjectId;
}[];
function getTurnOrder(): TurnOrder {
  const turnOrder = Campaign().get('turnorder');
  return !turnOrder.length
    ? []
    : Array.from(JSON.parse(turnOrder)) as TurnOrder;
}
function getPrevTurnOrder(prev: CampaignObjectProperties) {
  return !prev.turnorder.length
    ? []
    : Array.from(JSON.parse(prev.turnorder)) as TurnOrder;
}
function setTurnOrder(turnOrder: TurnOrder) {
  Campaign().set('turnorder', JSON.stringify(turnOrder));
}

function playerControls(token: Roll20Object<{ controlledby: PlayerList }>, playerId: ObjectId): boolean {
  if (playerIsGM(playerId)) return true;
  const controlledBy = token.get("controlledby");
  if (controlledBy === "all") return true;
  return controlledBy.split(",").indexOf(playerId) !== -1;
}
