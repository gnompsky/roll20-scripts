// Ported from work by u/The_Real_Empty_Dingo at https://www.reddit.com/r/WitcherTRPG/comments/sygiu0/the_ofieri_bazaar_an_encounter_mod_for_the/
class OfieriBazaar implements Mod {
  public initialise(): void {}
  public registerEventHandlers(): void {
    on("chat:message", _.bind(this.handleChatMessage, this)); 
  }
  
  // !bazaar
  private handleChatMessage(m: OneOfMessage) {
    if(messageIsApiCommand(m, "bazaar", false)) {
      const msg = m as ApiMessage;
      const args = msg.content.split(" ");

      const forceBazaar = args.length >= 2 && (""+args[1]).toLowerCase() === 'force';

      // 10% chance of any merchants
      if (!forceBazaar && randomInteger(10) > 1) {
        sendChat(msg.who, `/w gm &{template:default} {{name=Ofieri Bazaar
}} {{Description=No Merchants here
}}`);
        return;
      }

      // Between 1 and 12 merchants
      let numMerchants = randomInteger(6);
      if (numMerchants == 6) numMerchants += randomInteger(6);

      for (let i = 0; i < numMerchants; i++) {
        this.handleMerchant(msg);
      }
    }
  }

  private handleMerchant({ who }: ApiMessage) {
    const merchantLevel = pickFromTable(OfieriBazaar.merchantLevels, 11).description();
    const item = pickFromTable(OfieriBazaar.merchantItems, 36);

    const message = `/w gm &{template:default} {{name=Ofieri Bazaar
}} {{Merchant=${merchantLevel} (or 1x lowest available)
}} {{Selling=${item.name}
}} {{Description=${item.description()}
}}`;
    sendChat(who, message);
  }

  private static readonly merchantLevels = [
    { min:  1, max:  1, name: '', description: () => 'Novice / Everywhere' },
    { min:  2, max:  3, name: '', description: () => 'Novice / Common' },
    { min:  4, max:  5, name: '', description: () => 'Journeyman / Common' },
    { min:  6, max:  7, name: '', description: () => 'Journeyman / Poor' },
    { min:  8, max:  9, name: '', description: () => 'Master / Poor' },
    { min: 10, max: 10, name: '', description: () => 'Master / Rare' },
    { min: 11, max: 11, name: '', description: () => 'Grandmaster / Rare' },
  ];

  private static readonly mageSpells = [
    { min:  1, max:  2, name: '', description: () => 'Air' },
    { min:  3, max:  4, name: '', description: () => 'Earth' },
    { min:  5, max:  5, name: '', description: () => 'Mixed' },
    { min:  6, max:  7, name: '', description: () => 'Water' },
    { min:  8, max:  9, name: '', description: () => 'Fire' },
  ];

  private static readonly merchantItems = [
    { min:  1, max:  1, name: 'Alchemical Formulae'        , description: () => 'As per p.146-7 of the Corebook.' },
    { min:  2, max:  3, name: 'Alchemical Items'           , description: () => 'As per p.87-8 of the Corebook. They may also sell Mundane Potions as per Rodolf’s Wagon #4.' },
    { min:  4, max:  5, name: 'Alchemical Substances'      , description: () => 'As per p.143-5 of the Corebook. These substances will be in their raw form, but the Merchant can prepare them for use for a small fee (5cr per dose).' },
    { min:  6, max:  6, name: 'Alchemical Treatments'      , description: () => 'As per p.129 of the Corebook. Roll the Foraging Quantity to determine how much the Merchant has on hand for sale.' },
    { min:  7, max:  7, name: 'Armour Enhancements'        , description: () => 'As per p.90 of the Corebook.' },
    { min:  8, max:  9, name: 'Clothing'                   , description: () => 'As per p.93 of the Corebook.' },
    { min: 10, max: 10, name: 'Crafting Component Diagrams', description: () => 'As per p.130 of the Corebook.' },
    { min: 11, max: 11, name: 'Crafting Materials'         , description: () => 'As per p.128 of the Corebook.' },
    { min: 12, max: 12, name: 'Crossbow Upgrades'          , description: () => 'As per Rodolf’s Wagon #3' },
    { min: 13, max: 13, name: 'Elderfolk Armour'           , description: () => 'As per p.84 of the Corebook.' },
    { min: 14, max: 14, name: 'Elderfolk Armour Diagrams'  , description: () => 'As per p.138 of the Corebook.' },
    { min: 15, max: 15, name: 'Elderfolk Weapons'          , description: () => 'As per p.83-4 of the Corebook.' },
    { min: 16, max: 16, name: 'Elderfolk Weapon Diagrams'  , description: () => 'As per p.136 of the Corebook.' },
    { min: 17, max: 18, name: 'General Gear'               , description: () => 'As per p.93 of the Corebook and Rodolf’s Wagon #1.' },
    { min: 19, max: 19, name: 'Hides & Animal Bits'        , description: () => 'As per p.128 of the Corebook.' },
    { min: 20, max: 20, name: 'Ingots & Minerals'          , description: () => 'As per p.129 of the Corebook.' },
    { min: 21, max: 21, name: 'Mage Spells'                , description: () => `**Novice ${pickFromTable(OfieriBazaar.mageSpells, 9).description()}** spells as listed on p.101 of the Corebook. These grimoires are readable only by those who have had magical education (Mages & Scholars perhaps), and each grimoire will contain one novice level spell. The merchant will have [[1d10+1]] grimoires for sale. The sale price of each grimoire is the STA cost of the spell it contains x100 Crowns.` },
    { min: 22, max: 22, name: 'Mount Outfits'              , description: () => 'As per p.91 of the Corebook.' },
    { min: 23, max: 23, name: 'Nilfgaard Armour'           , description: () => 'As per p.79-80 of the Corebook.' },
    { min: 24, max: 24, name: 'Nilfgaard Armour Diagrams'  , description: () => 'As per p.134-5 of the Corebook.' },
    { min: 25, max: 25, name: 'Nilfgaard Weapons'          , description: () => 'As per p.73-4 of the Corebook. If using Toussainti weapons from Book of Tales, these would be included with or replace Nilfgaard weapons at the GM’s discretion.' },
    { min: 26, max: 26, name: 'Nilfgaard Weapon Diagrams'  , description: () => 'As per p.131-3 of the Corebook. If using Toussainti weapon diagrams from Roldolf’s Wagon #5, these would be included with or replace Nilfgaard weapon diagrams at the GM’s discretion.' },
    { min: 27, max: 27, name: 'Northern Armour'            , description: () => 'As per p.79-80 of the Corebook.' },
    { min: 28, max: 28, name: 'Northern Armour Diagrams'   , description: () => 'As per p.134-5 of the Corebook.' },
    { min: 29, max: 29, name: 'Northern Weapons'           , description: () => 'As per p.73-4 of the Corebook.' },
    { min: 30, max: 30, name: 'Northern Weapon Diagrams'   , description: () => 'As per p.131-3 of the Corebook.' },
    { min: 31, max: 31, name: 'Ofieri Armour'              , description: () => 'As per p.5-6 of the Ofieri Bazaar book.' },
    { min: 32, max: 32, name: 'Ofieri Armour Diagrams'     , description: () => 'As per p.5-6 of the Ofieri Bazaar book.' },
    { min: 33, max: 33, name: 'Ofieri Weapons'             , description: () => 'As per p.7-10 of the Ofieri Bazaar book.' },
    { min: 34, max: 34, name: 'Ofieri Weapon Diagrams'     , description: () => 'As per p.7-10 of the Ofieri Bazaar book.' },
    { min: 35, max: 35, name: 'Runes & Glyphs'             , description: () => 'As per p.256 of the Corebook. They will have 1d6-2 of each type in stock. If a number less than 1 is rolled, then the Merchant does not have that Rune or Glyph.' },
    { min: 36, max: 36, name: 'Tool Kits'                  , description: () => 'As per p.92 of the Corebook.' },
  ];
}

registerMod(OfieriBazaar);
