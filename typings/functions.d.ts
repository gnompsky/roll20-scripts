/* @see https://help.roll20.net/hc/en-us/articles/360037772793-API-Objects#API:Objects-Campaign()(function) */
declare function Campaign(): CampaignObject;

/* @see https://help.roll20.net/hc/en-us/articles/360037772793-API-Objects#API:Objects-createObj(type,attributes) */
declare function createObj<T extends string & CreateableRoll20ObjectTypes>(type: T, attributes: Roll20ObjectPropertiesTypeMap[T]): Roll20ObjectTypeMap;

/* @see https://help.roll20.net/hc/en-us/articles/360037772793-API-Objects#API:Objects-filterObjs(callback) */
declare function filterObjs(predicate: (obj: OneOfRoll20Object) => boolean): OneOfRoll20Object[];

/* @see https://help.roll20.net/hc/en-us/articles/360037772793-API-Objects#API:Objects-findObjs(attrs) */
declare function findObjs(
  attrs: Partial<PathObjectProperties> | Partial<WindowObjectProperties> | Partial<DoorObjectProperties> | Partial<TextObjectProperties> |
    Partial<GraphicObjectProperties> | Partial<PageObjectProperties> | Partial<CampaignObjectProperties> | Partial<PlayerObjectProperties> |
    Partial<MacroObjectProperties> | Partial<RollableTableObjectProperties> | Partial<TableItemObjectProperties> | Partial<CharacterObjectProperties> |
    Partial<AttributeObjectProperties> | Partial<AbilityObjectProperties> | Partial<HandoutObjectProperties> | Partial<DeckObjectProperties> |
    Partial<CardObjectProperties> | Partial<HandObjectProperties> | Partial<JukeboxTrackObjectProperties> | Partial<CustomFXObjectProperties>,
  options?: { caseInsensitive: boolean; }
): OneOfRoll20Object[];

/* @see https://help.roll20.net/hc/en-us/articles/360037772793-API-Objects#API:Objects-getAllObjs() */
declare function getAllObjs(): OneOfRoll20Object[];

/* @see https://help.roll20.net/hc/en-us/articles/360037772793-API-Objects#API:Objects-getAttrByName(character_id,attribute_name,value_type) */
declare function getAttrByName(character_id: ObjectId, attribute_name: string, value_type?: "current" | "max"): string;

/* @see https://help.roll20.net/hc/en-us/articles/360037772833-API-Function-Documentation#API:FunctionDocumentation-getObj */
declare function getObj<T extends string & Roll20ObjectType>(type: T, id: ObjectId): Roll20ObjectTypeMap[T] | undefined;

/* @see https://help.roll20.net/hc/en-us/articles/360037772833-API-Function-Documentation#API:FunctionDocumentation-log */
declare function log(message: any): void;

