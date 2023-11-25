module Business {
  export type BusinessType = "none" | "alchemist" | "herbalist" | "shop" | "smithy";
  
  export type PickableTableWithDescription = PickableTable & {
    name?: string;
    description?: () => string;
    special?: (initialTable: BusinessType, specificTable: BusinessType | null, skipReroll?: boolean) => PickableTableWithDescription;
    table?: string;
  };
}

class Business implements Mod {
  public initialise(): void {}
  public registerEventHandlers(): void {
    on("chat:message", _.bind(this.handleChatMessage, this));
  }

  private handleChatMessage(m: OneOfMessage): void {
    if(!messageIsApiCommand(m, "business", false)) return;
    
    const msg = <ApiMessage>m;
    const args = msg.content.split(" ");
    
    const command = args.length > 1 ? args[1].toLowerCase() : false;

    switch (true){
      case command === "income" && args.length > 2: return this.handleCommandIncome(
        msg,
        parseInt(args[2], 10), 
        args.length >= 4 ? parseInt(args[3], 10) : 0,
        args.length >= 5 ? parseInt(args[4], 10) : 0,
        args.length >= 6 ? parseInt(args[5], 10) : 0,
        args.length >= 7 ? parseInt(args[6], 10) : 0,
        args.length >= 8 ? parseInt(args[7], 10) : 0,
        args.length >= 9 ? parseInt(args[8], 10) : 0
      );
      case command === "tax" && args.length > 3: return this.handleCommandTax(
        msg,
        parseInt(args[2], 10),
        parseFloat(args[3])
      );
      case command === "event": return this.handleCommandEvent(
        msg,
        args.length < 3 ? 20 : +args[2], 
        args.length < 4 ? "none" : <Business.BusinessType>args[3]
      );
      default: return this.handleRenderMenu(msg);
    }
  }

  // !business income {DAYS} {[WEEKS_AWAY,0]} {[COIN,0]} {[GOODS,0]} {[LABOUR,0]} {[INFLUENCE,0]}
  private handleCommandIncome(
    { who }: ApiMessage,
    days: number,
    weeksAway: number,
    managerDailyCost: number,
    coinX: number,
    goodsX: number,
    labourX: number,
    influenceX: number
  ): void {
    // Crowns Earned per day = [1d10 * X / 2] - (if no manager)[30 * WEEKS_AWAY]
    const calcCoinForDay = (roll: number, x: number): number => (roll * x / 2) - (managerDailyCost > 0 ? 0 : (30 * weeksAway));
    const calcCapitalForDay = (roll: number, x: number, coinPerUnit: number): number => calcCoinForDay(roll, x) / coinPerUnit;
 
    const results = {
      days: <{ 
        roll: number,
        coin: number,
        goods: number,
        labour: number,
        influence: number
      }[]>[],
      totalCoin: "",
      totalGoods: "",
      totalLabour: "",
      totalInfluence: "",
      managerCosts: managerDailyCost > 0 ? `${days} * -${managerDailyCost}` : "",
    };
    for(let i = 0; i < days; i++) {
      const dayRoll = randomInteger(10);

      const day = {
        roll: dayRoll,
        coin: coinX > 0 ? Math.max(Math.floor(calcCoinForDay(dayRoll, coinX)), 0) : 0,
        goods: goodsX > 0 ? Math.max(Math.floor(calcCapitalForDay(dayRoll, goodsX, 5)), 0) : 0,
        labour: labourX > 0 ? Math.max(Math.floor(calcCapitalForDay(dayRoll, labourX, 5)), 0) : 0,
        influence: influenceX > 0 ? Math.max(Math.floor(calcCapitalForDay(dayRoll, influenceX, 7.5)), 0) : 0,
      };
      results.days.push(day);

      if (coinX > 0) results.totalCoin += i == days - 1 ? day.coin : `${day.coin} + `;
      if (goodsX > 0) results.totalGoods += i == days - 1 ? day.goods : `${day.goods} + `;
      if (labourX > 0) results.totalLabour += i == days - 1 ? day.labour : `${day.labour} + `;
      if (influenceX > 0) results.totalInfluence += i == days - 1 ? day.influence : `${day.influence} + `;
    }

    let daysStr: string = ""+days;
    if (weeksAway > 0) daysStr += ` (${weeksAway} weeks absent)`;

    let modsStr = "";
    if (coinX > 0) {
      modsStr += `+${coinX} Coin`;
      if (weeksAway > 0 && managerDailyCost <= 0) modsStr += ` (-${30 * weeksAway}/day)`;
      modsStr += `
`;
    }
    if (goodsX > 0) {
      modsStr += `+${goodsX} Goods`;
      if (weeksAway > 0 && managerDailyCost <= 0) modsStr += ` (-${6 * weeksAway}/day)`;
      modsStr += `
`;
    }
    if (labourX > 0) {
      modsStr += `+${labourX} Labour`;
      if (weeksAway > 0 && managerDailyCost <= 0) modsStr += ` (-${6 * weeksAway}/day)`;
      modsStr += `
`;
    }
    if (influenceX > 0) {
      modsStr += `+${influenceX} Influence`;
      if (weeksAway > 0 && managerDailyCost <= 0) modsStr += ` (-${4 * weeksAway}/day)`;
      modsStr += `
`;
    }

    const rollsStr = `[[${results.days.map(d => d.roll).join("]], [[")}]]`;

    let totalStr = "[[0";
    let earningsStr = "";
    if (results.totalCoin) {
      const coinStr = `[[floor(${results.totalCoin})]]`;
      earningsStr += `${coinStr} Crowns
`;
      totalStr += `+${coinStr}`;
    }

    if (results.totalGoods) {
      const goodsStr = `[[floor(${results.totalGoods})]]`;
      earningsStr += `${goodsStr} Goods
`;
      totalStr += `+${goodsStr}`;
    }

    if (results.totalLabour) {
      const labourStr = `[[floor(${results.totalLabour})]]`;
      earningsStr += `${labourStr} Labour
`;
      totalStr += `+${labourStr}`;
    }

    if (results.totalInfluence) {
      const influenceStr = `[[floor(${results.totalInfluence})]]`;
      earningsStr += `${influenceStr} Influence
`;
      totalStr += `+${influenceStr}`;
    }

    if (results.managerCosts) {
      const managementStr = `[[floor(${results.managerCosts})]]`;
      earningsStr += `${managementStr} Management Fee
`;
      totalStr += `+${managementStr}`;
    }
    totalStr += "]]";

    const message = `&{template:default} {{name=Income
}} {{Days=${daysStr}
}} {{Mods=${modsStr}
}} {{Rolls=${rollsStr}
}} {{Earnings=${earningsStr}
}} {{Total=${totalStr}
}}`;

    sendChat(who, message);
  };

  // !business tax {WORTH} {FACTOR} 
  private handleCommandTax({ who }: ApiMessage, worth: number, factor: number): void {
    let message = `&{template:default} {{name=Tax Due
}} {{Business Worth=${this.formatCurrency(worth)} Crowns
}} {{Tax Rate=${factor * 100}%
}} {{Tax Due=[[floor(${worth} * ${factor})]] Crowns
}}`;

    sendChat(who, message);
  };

  // !business event {CHANCE_PERCENT} {none,herbalist}
  private handleCommandEvent({ who }: ApiMessage, chancePercent: number, buildingType: Business.BusinessType): void {
    let event = Business.nullEvent;
    let newChance = Math.min(95, chancePercent + 5);
    if (randomInteger(100) <= chancePercent) {
      event = Business.rollEvent("none", buildingType);

      if (event.name != Business.nullEvent.name) newChance = 20;
    }

    const message = `/w gm &{template:default} {{name=Event - ${event.name} (${event.table})
}} {{Description=${event.description ? event.description() : ""}
}} {{Next Chance=${newChance}%
}}`;

    sendChat(who, message);
  }
  
  private handleRenderMenu({ who }: ApiMessage): void {
    const message = `/w gm &{template:default} {{name=Business
}} {{[Income](!
#Business-Income)=[Tax](!
#Business-Tax)
}} {{[Event](!
#Business-Event)=
}}`;
    sendChat(who, message);
  }
  
  private formatCurrency(amount: number): string {
    amount = Math.floor(amount);

    const parts = (amount + "").split(".");
    let main = parts[0];
    let len = main.length;
    let output = "";
    let first = main.charAt(0);
    let i;

    if (first === "-") {
      main = main.slice(1);
      len = main.length;
    } else {
      first = "";
    }
    i = len - 1;
    while(i >= 0) {
      output = main.charAt(i) + output;
      if ((len - i) % 3 === 0 && i > 0) {
        output = "," + output;
      }
      --i;
    }
    // put sign back
    output = first + output;
    // put decimal part back
    if (parts.length > 1) {
      output += "." + parts[1];
    }
    return output;
  };

  private static pickEventDetail(table: Business.PickableTableWithDescription[], diceSize: number): string {
    const event = pickFromTable(table, diceSize);
    return (event.description && event.description()) || "";
  }

  private static readonly nullEvent: Business.PickableTableWithDescription = { 
    min: 99, 
    max: 100, 
    name: "No Event", 
    description: () => "Nothing happens"
  } as const;

  private static rollEvent(
    initialTable: Business.BusinessType | null,
    specificTable: Business.BusinessType | null = null,
    skipReroll: boolean = false
  ): Business.PickableTableWithDescription {
    if (!initialTable) return Business.nullEvent;

    const event = pickFromTable(Business.events[initialTable], 100);

    if (typeof event.special === "function") {
      return event.special(initialTable, specificTable, skipReroll || false);
    } else {
      event.table = initialTable;
      return event;
    }
  }

  private static readonly eventBadWeather: Business.PickableTableWithDescription[] = [
    { exact: 1,        description: () => "The weather is devastating, your building gains the **broken** condition." },
    { min: 2, max: 10, description: () => "" },
  ];
  private static readonly eventFire: Business.PickableTableWithDescription[] = [
    { min: 1, max: 3, description: () => "just a minor fire that costs you [[10*1d2]] points of **Goods**" },
    { exact: 4,       description: () => "a major fire and becomes a significant danger. Unless you use magic to suppress it, you lose [[10*2d6]] points of **Goods** or **Labour** (splitting this cost up however you wish) and your building gains the **broken** condition" },
  ];
  private static readonly eventDeadlyAccident: Business.PickableTableWithDescription[] = [
    { min: 1, max: 2, description: () => "random employee or building resident" },
    { exact: 3,       description: () => "visitor or passerby" },
  ];
  private static readonly eventAccidentalPoisoning: Business.PickableTableWithDescription[] = [
    { exact: 1,       description: () => "The customer is actually a rival alchemist snooping around, in which case your rival’s shop is closed for [[1d6]] days, and because of the lack of competition your business gains a +5 bonus during that time on its first check each day to generate capital."},
    { min: 2, max: 4, description: () => ""},
  ];
  private static readonly eventExplosion: Business.PickableTableWithDescription[] = [
    { exact: 1,       description: () => "just a minor fire that costs you [[10*1d2]] more points of **Goods**" },
    { exact: 2,       description: () => "a major fire and becomes a significant danger. Unless you use magic to suppress it, you lose [[10*2d6]] points of **Goods** or **Labour** (splitting this cost up however you wish) and your building gains the **broken** condition" },
  ];
  private static readonly eventRobbery: Business.PickableTableWithDescription[] = [
    { min: 1, max: 3, description: () => "just a crime of opportunity. You can spend [[10*2d4]] points of **Influence** to cause them to leave you alone, negating this event. Otherwise, attempt a **DC 18** Intimidate check. If you succeed, the criminals are caught and you gain 10 points of **Influence**. Otherwise, the criminals rob your building, and you lose [[10*1d8]] points of **Goods**" },
    { exact: 4,       description: () => "a planned attack on your Shop. You can spend [[10*2d6]] points of **Influence** to cause them to leave you alone, negating this event. Otherwise, attempt a **DC 20** Intimidate check. If you succeed, the criminals are caught and you gain 10 points of **Influence**. Otherwise, the criminals rob your building, and you lose [[10*2d6]] points of **Goods**" },
  ];
  private static readonly eventDeadlyAccidentFire: Business.PickableTableWithDescription[] = [
    { min:  1, max: 12, description: () => "" },
    { min: 13, max: 15, description: () => "A fire breaks out in your building. It’s just a minor fire that costs you [[10*1d2]] points of **Goods**." },
    { exact: 16,        description: () => "A fire breaks out in your building. It’s a major fire and becomes a significant danger. Unless you use magic to suppress it, you lose [[10*2d6]] points of **Goods** or **Labour** (splitting this cost up however you wish) and your building gains the **broken** condition." },
  ];

  private static readonly events: Record<Business.BusinessType, Business.PickableTableWithDescription[]> = {
    "none": [
      { min:  1, max:   2, name: "Good Fortune"     , description: () => "You have a run of good luck. For 7 days, this building gains a +4 bonus on its first check to generate **Capital** each day. In addition, the next time you roll a building event, you can roll twice and take either result." },
      { min:  3, max:   8, name: "Day of rest"      , description: () => "It’s an unusually relaxing day. Nothing bad happens, and minor events seem to conspire to make all the little things work out perfectly. People are well rested and in good spirits. You gain [[10*1d3]] points of **Labor**." },
      { min:  9, max:  12, name: "Good weather"     , description: () => "The beautiful weather boosts morale and business. The building gets a +10 bonus on its next check to generate capital." },
      { min: 13, max:  15, name: "Famous visitor"   , description: () => "Someone famous visits the settlement. This could be a beloved actress, a vaunted hero, a celebrated noble, or the like. Attempt a **DC 18** Social Etiquette / Streetwise / Charisma (as appropriate) check. On a success, the famous visitor visits your building, and you gain [[10*1d2]] points of **Influence**. Otherwise you’re snubbed and lose [[10*1d2]] points of **Influence**." },
      { min: 16, max:  65, special: (_, specificTable, skipReroll) => Business.rollEvent(specificTable, null, skipReroll) },
      { min: 66, max:  73, name: "Rumourmongering"  , description: () => "People are talking about you. Attempt a **DC 18** Charisma / Persuasion check. On a success, word spreads far that your presence in the region is valuable and welcomed, and you gain [[10*1d4]] points of **Influence**. On a failure, the rumours are not so complimentary (and perhaps even insulting), and you lose [[10*1d3]] points of **Influence**." },
      { min: 74, max:  77, name: "Bad weather"      , description: () => `A particularly bad patch of weather plagues the area. Attempt a **DC 18** Wilderness Survival check. If you succeed, you’ve anticipated the weather and your building is unaffected. If you fail, the bad weather damages some of your supplies, and you lose [[10*1d4]] points of **Goods**. ${Business.pickEventDetail(Business.eventBadWeather, 10)}` },
      { min: 78, max:  80, name: "Fire"             , description: () => `A fire breaks out in your building. It"s ${Business.pickEventDetail(Business.eventFire, 4)}.` },
      { min: 81, max:  82, name: "Deadly accident"  , description: () => `Someone has a dreadful accident in or near your building. The victim is a ${Business.pickEventDetail(Business.eventDeadlyAccident, 3)}. The GM determines the type of accident. The victim is hurt badly and is dying. a successful **DC 14** First Aid check or the application of any magical healing prevents death. If the person dies, you lose [[10*1d3]] points of **Influence**.` },
      { min: 83, max:  84, name: "Infestation"      , description: () => "You have uninvited guests — spiders in the cellar, stirges in the attic, rats in the walls, or something similarly unpleasant. As long as your building is infested, it takes a -10 penalty on checks to generate capital. Each day the infestation continues, you lose 10 points of **Goods** or **Labour** (chosen randomly, reroll if it’s a type of **Capital** you don’t have). To end an infestation, you must succeed at a **DC 18** Wilderness Survival / Monster Lore check; the DC increases by 1 for each day the infestation persists (maximum **DC 30**). Alternatively, the GM may allow you to resolve the infestation with a combat encounter." },
      { min: 85, max:  88, name: "Rivalry"          , description: () => "A rival starts to work against you. At the start of each Income phase, you must succeed at a **DC 18** skill check (with a skill that makes sense for the type of building) or either lose [[10*1d2]] points of **Influence** or give the building a –5 penalty on its checks to generate currency for [[1d10]] days (50% chance of either penalty). You may attempt a **DC 20** Intimidate / Persuasion / Business check once per day to end the rivalry. Success means the rivalry ends (as does any ongoing penalty from this event). Failure means the rivalry continues. The rivalry ends automatically the next time you roll this event (this doesn’t replace the old rivalry with a new one)." },
      { min: 89, max:  90, name: "Sickness"         , description: () => "Your employees have become sick, and any earnings from this building today are halved. Attempt a **DC 14** First Aid check at the end of each day—on a success, your employees get well enough to work. If you fail, the sickness persists to the next day. Each day sickness persists, you have a 20% chance of losing [[10*1d2]] points of Labour." },
      { min: 91, max:  94, name: "Taxes"            , description: () => "You must pay some unexpected taxes. You can either pay the tax amount (1% of the total **Coin** value of your building) or attempt a **DC 18** Deceit / Business check to talk your way out of the taxes. If you succeed, you don’t have to pay these taxes. If you fail, the tax owed doubles and you can’t talk your way out of it." },
      { min: 95, max:  98, name: "Criminal activity", description: () => "The building is targeted by petty criminals. You can spend [[10*2d4]] points of **Influence** to cause them to leave you alone, negating this event. Otherwise, attempt a **DC 18** Intimidate check. If you succeed, the criminals are caught and you gain 10 points of **Influence**. Otherwise, the criminals rob your building, and you lose [[10*1d8]] points of **Goods**." },
      { min: 99, max: 100, special: (initialTable, specificTable, skipReroll) => skipReroll ? Business.nullEvent : Business.rollEvent(initialTable, specificTable, true) },
    ],
    "alchemist": [
      { min:  1, max:  10, name: "Discovery"              , description: () => "The introduction of a new material makes your alchemical recipes more potent, leading to booming sales. For [[1d6]] days, the business gains a +10 bonus on its first check to generate capital each day." },
      { min: 11, max:  30, name: "Cold Remedy"            , description: () => "Your create a treatment for a minor illness currently making the rounds in the settlement. You gain 10 points of **Influence**, and the building gains a +5 bonus on its next check to generate capital." },
      { min: 31, max:  40, name: "Healing herbs demand"   , description: () => "Local temples have a healing herb shortage and ask you to help pick up the slack with alchemical remedies. Attempt a DC 18 Alchemy check. If you succeed, the healers praise you and you gain 10 points of **Influence**. Otherwise, the healers badmouth your incompetence or unwillingness to help, and you lose [[10*1d2]] points of **Influence**." },
      { min: 41, max:  45, name: "Embarrassing affliction", description: () => "A wealthy merchant, noble, or other person of note privately asks for help with a personal problem, such as halitosis or bedroom performance problems. If you succeed at a DC 18 Alchemy check, you discreetly deal with the problem and gain [[10*1d4]] points of **Influence**; there’s a 10% chance the customer recommends you to someone with a similar problem and the building gains a +10 bonus on its next check to generate capital. If you fail, there is no effect, but this doesn’t reflect poorly on you because the customer wishes to keep the problem private." },
      { min: 46, max:  55, name: "Cosmetic problem"       , description: () => "A batch of bad ingredients causes side effects such as abnormal hair growth or loss, skin discoloration, warts, or unusual body odor. You lose [[10*1d3]] points of **Influence**." },
      { min: 56, max:  70, name: "Accidental poisoning"   , description: () => `An inept employee accidentally poisons one of your customers—enough to debilitate the customer for a few days, but not enough to cause a fatality. You lose 10 points of **Influence**. ${Business.pickEventDetail(Business.eventAccidentalPoisoning, 4)}` },
      { min: 71, max:  80, name: "Contamination"          , description: () => "Rat poison, laxative, or some other dangerous product spills into the rest of your wares, forcing you to throw out the contaminated inventory. You lose [[10*1d6]] for [[1d6]] days **Goods** or **Influence**, divided as you see fit. Alternatively, you may continue to sell the tainted product, treating this event as an **Accidental Poisoning**(01–50), **Cosmetic Problem**(51–90), or **Outbreak**(91–100)." },
      { min: 81, max:  85, name: "Unstable mutation"      , description: () => "An alchemical mishap causes one employee to fall temporarily into a frenzy. Either you hide the employee in your business, losing [[10*1d2]] points of **Goods** per day for [[1d3]] days as the employee accidentally breaks merchandise, or you send the employee home and the building takes a –5 penalty on its next [[1d3]] checks to generate capital since people know about this incident." },
      { min: 86, max:  95, name: "Explosion"              , description: () => `Crafting goes awry or dangerous reagents are spilled, causing an explosion. You lose [[10*1d2]] points of **Goods** and must attempt a DC 18 Wilderness Survival check. If you fail, your building catches fire. It is ${Business.pickEventDetail(Business.eventExplosion, 2)}`},
      { min: 96, max: 100, name: "Outbreak"               , description: () => "Something in your shop is making people sick—perhaps a bad reaction created poisonous gas, a monstrous ingredient carries a lingering disease, or a rival alchemist planted something dangerous. Attempt a DC 25 Alchemy check. If you succeed, you remedy the problem before it causes any permanent harm. Otherwise, treating and compensating the victims costs you [[10*1d3]] points of **Goods** and [[10*1d4]] points of **Influence**." },
    ],
    "herbalist": [
      { min:  1, max:  10, name: "Dangerous discovery"  , description: () => "While experimenting with a recipe, you accidentally create a dose of poison. Randomly select one Alchemical Item that costs 60 crowns or less (on pg 87) per dose. You can keep this dose for your own use or sell it at the usual value. Note that selling poison might be illegal in the settlement." },
      { min: 11, max:  35, special: (_, __, skipReroll) => Business.rollEvent("alchemist", null, skipReroll) },
      { min: 36, max:  55, name: "Snake oil"            , description: () => "You’ve created an invigorating tonic that makes people feel better, though whether or not it has any actual curative effect is dubious. If you spend 10 points of **Influence**, you can attempt a **DC 20** Deceit check to convince the locals to try your cure-all. If you succeed, the building gains a +15 bonus on its next check to generate capital. You can attempt this check every day after you roll this event, but the DC increases by 2 with each attempt. If you fail the check, the event ends, and you can no longer attempt these daily checks (at least, not until you roll this event again)." },
      { min: 56, max:  65, name: "Exhausting concoction", description: () => "Accidental exposure to a stimulating herbal treatment has given your workers insomnia, allowing them to increase their output. For [[1d6]] days, each day you can spend 10 points of **Influence** to push the workers, giving the building a +10 bonus on its first check that day to generate **Capital**." },
      { min: 66, max:  80, name: "New intoxicant"       , description: () => "You discover a natural substance—perhaps a rare herb or a refined form of a common beverage—that creates a pleasant, intoxicating sensation. If you spend [[10*1d4]] points of **Influence** and succeed at a **DC 18** Deceit / Persuasion / Intimidate check, you convince the local authorities to allow you to sell it, and for [[2d6]] days the building gains a +10 bonus on its first check to generate capital each day. If you fail or don’t attempt the check, the substance is declared illegal, a threat to society, or immoral. If the substance is banned, you can sell it illegally for only a short while before the risk grows too great; for [[2d4]] days, the building gains a +5 bonus on its first check to generate capital each day. There is a 10% chance than an unscrupulous employee may continue selling this intoxicating substance on the side without your permission or knowledge (which may lead to complications with local authorities)." },
      { min: 81, max: 100, name: "Noxious fumes"        , description: () => "The horrible stink created by one of your latest concoctions makes the workers ill. Attempt a **DC 20** Alchemy check to create a counteragent before anyone has to take days off to recover. If you succeed, you end the event with no penalties. If you fail, you lose [[10*2d4]] points of Labour." },
    ],
    "shop": [
      { min:  1, max:  30, name: "Busy day"         , description: () => "For whatever reason, your Shop is particularly busy today. If you spend the day at the Shop helping customers, the building gains a +10 bonus on its next check to generate capital." },
      { min: 31, max:  45, name: "Slow day"         , description: () => "For some reason, no one’s coming to the Shop today. If you don’t spend the day at the Shop, it earns no capital for the day." },
      { min: 46, max:  60, name: "Shoplifter"       , description: () => "A customer tries to walk out of your Shop with a valuable item. Attempt a **DC 18** Perception check. If you fail, you lose [[10*1d3]] points of **Goods**." },
      { min: 61, max:  75, name: "Embezzler"        , description: () => "One of your employees is skimming your profits. You can attempt a **DC 20** Awareness or Human Perception check to catch the employee in the act. If you catch and fire the employee, you lose 10 points of **Labour**. If you don’t catch the employee, you lose 10 points of **Influence** and the building’s next check to generate capital takes a –10 penalty. The dishonest employee waits [[1d6]] days before acting again. You can attempt a new Awareness or Human Perception check each time the embezzler acts, with the DC decreasing by 2 each time until you catch the employee as he becomes more brazen. If for some reason you catch the employee and don’t fire him, he waits [[2d6]] days to embezzle again unless you somehow force him to stop." },
      { min: 76, max:  90, name: "Burglary"         , description: () => "Thieves have attempted to break into your Shop to steal your items. You can immediately spend [[10*1d6]] points of **Influence** to negate this attempt. Otherwise, attempt a **DC 20** Intimidate or Awareness check. On a success, your building’s defenses work, the thieves are caught, and you gain [[10*1d2]] points of **Influence**. On a failure, you lose [[10*1d4]] points of **Goods**. The GM may allow you to pursue or track down the thieves as an adventure hook." },
      { min: 91, max:  95, name: "Protection racket", description: () => "Thugs attempt to extort money from your Shop for “protection.” You can pay their demand (an amount equal to the building’s maximum possible **Coin** earned in a day) or attempt to scare them off with a **DC 20** Intimidate check. If you fail to run them off, they steal an amount of merchandise and cash equal to twice their initial demand plus [[10*1d4]] points of **Goods**." },
      { min: 96, max: 100, name: "Robbery"          , description: () => `Someone has targeted your store or employees for a quick robbery. ${Business.pickEventDetail(Business.eventRobbery, 4)}.` },
    ],
    "smithy": [
      { min:  1, max:  15, name: "Special request"      , description: () => "A famous hero, noble, military commander, or similar notable comes to your Smithy with a special request for an unusual or masterwork item—perhaps manacles, a cage, exotic barding, or a replacement piece for an iron golem. For [[1d4]] days, as payments come in for the request, your building gains a +20 bonus on its first check to generate capital each day. At the end of this period, attempt a **DC 30** Crafting check. On a success, your Smithy has done so well on the request that the customer spreads the word of your skill and you gain [[10*1d6]] points of **Influence**." },
      { min: 16, max:  20, name: "Unforeseen masterwork", description: () => "Normally, it takes focus, time, and skill to forge a masterwork object, but by chance one of your workers manages to produce one accidentally. You gain [[100*1d10]] **Coin** or [[10*1d10]] points of **Goods** (your choice) for the sale of this item." },
      { min: 21, max:  25, name: "Exotic metal"         , description: () => "A supplier offers to sell you a small amount of Dark Steel, Dimeritium, or Mahakaman Steel (up to 1,000 Crowns list price worth) at a 20% discount. You may spend **Goods**, or **Coin** to pay for this metal." },
      { min: 26, max:  30, name: "Valuable ore"         , description: () => "Your suppliers send a particularly fine shipment of ore or ingots. You gain [[10*1d4]] points of **Goods**. There’s a 5% chance that the supplier also included precious metals or gemstones worth 5d20 gp by mistake. If you give these back to the supplier instead of keeping them, you gain 1d6 points of Influence." },
      { min: 31, max:  35, special: (_, __, skipReroll) => Business.rollEvent("shop", null, skipReroll) },
      { min: 36, max:  50, name: "Forge waste"          , description: () => "An employee ruins some equipment or refined metal. Attempt a **DC 30** Crafting check. If you succeed, you are able to salvage much of the metal and only lose 10 points of **Goods**. If you fail, you lose [[10*1d3]] points of **Goods**." },
      { min: 51, max:  65, name: "Supply problems"      , description: () => "Your suppliers have a problem—a road is washed out, bandits are thick in the wilds, or an important caravan has been attacked by a monster. In any event, your necessary supplies are running low. You lose [[10*1d3]] points of **Goods**, and for [[1d4]] days this building takes a –5 penalty on its checks to generates capital." },
      { min: 66, max:  80, name: "Forced commission"    , description: () => "A government official requires a specific commission, but refuses to pay for the service, claiming it is your duty to support the government. If you comply with this demand, completing the work takes [[1d4]] days, and the building generates no income for that period of time. Alternatively, you can resist by spending [[10*1d6]] points of **Influence** and the official goes elsewhere." },
      { min: 81, max: 100, name: "Deadly accident"      , description: () => `Someone has a dreadful accident in or near your building. The victim is a ${Business.pickEventDetail(Business.eventDeadlyAccident, 3)}. The GM determines the type of accident. The victim is hurt badly and is dying. a successful **DC 14** First Aid check or the application of any magical healing prevents death. If the person dies, you lose [[10*1d3]] points of **Influence**.${Business.pickEventDetail(Business.eventDeadlyAccidentFire, 16)}` },
    ]
  };
}

registerMod(Business);
