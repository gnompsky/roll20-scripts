declare function on(event: "chat:message", callback: (msg: ChatMessage) => void): void;

// Campaign Events
/*
  This event fires after all the current data for the campaign has been loaded. 
  So if you want to find a list of all objects in a campaign, or a specific object that is already in the Campaign, be sure to only look for it after 
  the ready event fires. In addition, if you bind to add events (such as add:graphic) before the ready event fires, you will receive add events for 
  objects that were already present in the campaign.
  @see https://help.roll20.net/hc/en-us/articles/360037772813-API-Events#API:Events-CampaignEvents
 */
declare function on(event: "ready", callback: () => void): void;

/*
  Fired whenever the page that the players are currently on changes.
  @see https://help.roll20.net/hc/en-us/articles/360037772813-API-Events#API:Events-CampaignEvents
 */
declare function on(event: "change:campaign:playerpageid", callback: () => void): void;

/*
  Fired whenever the turn order listing for the campaign changes.
  @see https://help.roll20.net/hc/en-us/articles/360037772813-API-Events#API:Events-CampaignEvents
 */
declare function on(event: "change:campaign:turnorder", callback: () => void): void;

/*
  Fired whenever the turn order is hidden or shown for a page. This may not be the same as the ID of the currently active page. 
  If this is set to false (including if an API script sets it to false), it will close the turn order for all GMs/players. 
  Setting it to a valid page ID will open it for all GMs/players.
  @see https://help.roll20.net/hc/en-us/articles/360037772813-API-Events#API:Events-CampaignEvents
 */
declare function on(event: "change:campaign:initiativepage", callback: () => void): void;

// Object Events
declare type ChangeGraphicEvent = `change:graphic${`:${keyof GraphicObjectProperties}` | ''}`;
declare function on(event: ChangeGraphicEvent, callback: (obj: GraphicObject, prev: GraphicObjectProperties) => void): void;
