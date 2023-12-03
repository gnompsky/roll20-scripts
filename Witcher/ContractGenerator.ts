class ContractGenerator implements Mod {
  public initialise(): void {}
  public registerEventHandlers(): void {
    on("chat:message", _.bind(this.handleChatMessage, this));
  }

  private handleChatMessage(msg: OneOfMessage): void {
    if(!messageIsApiCommand(msg, "contract", false)) return;
    
    this.generateContract();
  }

  private generateContract(): void {
    const locationIndex = randomInteger(ContractGenerator.locations.length) - 1;
    const location = ContractGenerator.locations[locationIndex];

    const preyType = pickFromList(Object.keys(ContractGenerator.preyLists))!;
    const specificPreyList = ContractGenerator.preyLists[preyType][locationIndex];
    const specificPrey = specificPreyList.length > 0
      ? `${pickFromList(specificPreyList)} (${preyType})`
      : preyType;
    const difficulty = pickFromList(ContractGenerator.difficulties);
    const twist = pickFromTable(ContractGenerator.twists, 30).name;

    const message = `/w gm &{template:default} {{name=Contract
}} {{Prey Type=${specificPrey}
}} {{Location=${location}
}} {{Difficulty=${difficulty}
}} {{Twist=${twist}
}}`;

    sendChat("System", message);
  }

  private static readonly locations = ['Forest', "Building", "Abandoned Building", "Coast", "Mountains", "City", "Graveyard", "Hamlet", "River", "Cave"];
  private static readonly preyLists: Record<string, string[][]> = {
    'Spectre': [
      /* Forest */   [],
      /* Building */ [],
      /* Abandoned Building */ ["Wraith", "Noonwraith"],
      /* Coast */ [],
      /* Mountains */ [],
      /* City */ [],
      /* Graveyard */ ["Wraith"],
      /* Hamlet */ ["Noonwraith"],
      /* River */ [],
      /* Cave */ [],
    ],
    'Cursed One': [
      /* Forest */   ["Werewolf"],
      /* Building */ [],
      /* Abandoned Building */ [],
      /* Coast */ [],
      /* Mountains */ [],
      /* City */ ["Werewolf"],
      /* Graveyard */ [],
      /* Hamlet */ [],
      /* River */ [],
      /* Cave */ [],
    ],
    'Hybrid': [
      /* Forest */   ["Griffin"],
      /* Building */ [],
      /* Abandoned Building */ [],
      /* Coast */ ["Sirens"],
      /* Mountains */ ["Griffin"],
      /* City */ [],
      /* Graveyard */ [],
      /* Hamlet */ [],
      /* River */ ["Sirens"],
      /* Cave */ [],
    ],
    'Insectoid': [
      /* Forest */   ["Endrega", "Arachasae"],
      /* Building */ [],
      /* Abandoned Building */ [],
      /* Coast */ [],
      /* Mountains */ [],
      /* City */ [],
      /* Graveyard */ [],
      /* Hamlet */ [],
      /* River */ ["Endrega", "Arachasae"],
      /* Cave */ [],
    ],
    'Elementa': [
      /* Forest */   [],
      /* Building */ ["Golems"],
      /* Abandoned Building */ ["Golems"],
      /* Coast */ [],
      /* Mountains */ [],
      /* City */ [],
      /* Graveyard */ [],
      /* Hamlet */ [],
      /* River */ [],
      /* Cave */ [],
    ],
    'Relict': [
      /* Forest */   ["Fiend"],
      /* Building */ [],
      /* Abandoned Building */ [],
      /* Coast */ [],
      /* Mountains */ ["Fiend"],
      /* City */ [],
      /* Graveyard */ [],
      /* Hamlet */ [],
      /* River */ [],
      /* Cave */ [],
    ],
    'Ogroid': [
      /* Forest */   ["Nekker"],
      /* Building */ [],
      /* Abandoned Building */ [],
      /* Coast */ [],
      /* Mountains */ ["Rock Troll"],
      /* City */ [],
      /* Graveyard */ [],
      /* Hamlet */ [],
      /* River */ ["Rock Troll"],
      /* Cave */ ["Nekker"],
    ],
    'Draconid': [
      /* Forest */   [],
      /* Building */ [],
      /* Abandoned Building */ [],
      /* Coast */ [],
      /* Mountains */ ["Wyvern"],
      /* City */ [],
      /* Graveyard */ [],
      /* Hamlet */ [],
      /* River */ ["Wyvern"],
      /* Cave */ [],
    ],
    'Necrophage': [
      /* Forest */   [],
      /* Building */ [],
      /* Abandoned Building */ [],
      /* Coast */ ["Drowner"],
      /* Mountains */ [],
      /* City */ [],
      /* Graveyard */ ["Ghoul", "Grave Hag"],
      /* Hamlet */ ["Ghoul"],
      /* River */ ["Drowner"],
      /* Cave */ ["Grave Hag"],
    ],
    'Vampire': [
      /* Forest */   [],
      /* Building */ [],
      /* Abandoned Building */ ["Katakan"],
      /* Coast */ [],
      /* Mountains */ [],
      /* City */ ["Katakan"],
      /* Graveyard */ [],
      /* Hamlet */ [],
      /* River */ [],
      /* Cave */ ["Katakan"],
    ],
  };
  private static readonly difficulties = ['None', 'Refuse to Pay', 'Paid in Trade', 'Surprisingly Tough', 'Surprisingly Easy'];
  private static readonly twists: (PickableTable & { name: string })[] = [
    { exact:  1, name: 'Monster was a fake' },
    { exact:  2, name: 'It was all a curse' },
    { exact:  3, name: 'Monster already dead' },
    { exact:  4, name: 'Wasn\'t what you thought' },
    { exact:  5, name: 'Employer wanted it caught' },
    { exact:  6, name: 'Employer is to blame' },
    { exact:  7, name: 'Monster is harmless' },
    { exact:  8, name: 'It\'s a trap for you' },
    { exact:  9, name: 'More monsters than you were told' },
    { exact: 10, name: 'A mage was to blame' },
    { min: 11, max: 30, name: 'None' },
  ];
}

registerMod(ContractGenerator);
