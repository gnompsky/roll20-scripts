class MythicGME implements Mod {
  public initialise(): void {}
  public registerEventHandlers(): void {
    on("chat:message", _.bind(this.handleChatMessage, this));
  }
  
  private handleChatMessage(m: OneOfMessage) {
    if (!messageIsApiCommand(m, "mythic", false)) return;
    const msg = <ApiMessage>m;
    
    const args = msg.content.split(" ");
    const command = args.length > 1 ? args[1].toLowerCase() : undefined;

    switch(true) {
      case command === undefined: return this.handleRenderMenu();
      case command === "fate" && args.length > 3: return this.handleQuestionFate(<MythicGME.ChaosRank>parseInt(args[2], 10), <MythicGME.Odds>args.slice(3).join(" "));
    }
  }
  
  private handleRenderMenu() {
    // TODO: Render main menu here
  }
  
  private handleQuestionFate(chaosRank: MythicGME.ChaosRank, chance: MythicGME.Odds) {
    const answer = this.questionFate(chaosRank, chance);

    const message = `&{template:default} {{name=Question Fate
}}{{Chance=${chance}
}}{{Chaos Rank=${chaosRank}
}}{{Roll=[[${answer.roll}]]
}}{{Result=${answer.result}
}}`;
    
    sendChat("Mythic", "/w gm " + message);
  }
  
  private questionFate(chaosRank: MythicGME.ChaosRank, chance: MythicGME.Odds): {roll: number, result: MythicGME.FateResult} {
    const roll = randomInteger(100)
    const fateRecord = MythicGME.fateChart[chance][chaosRank];
    
    switch (true) {
      case roll <= fateRecord.exceptionalYes: return {roll, result: "exceptional yes"};
      case roll <= fateRecord.yes: return {roll, result: "yes"};
      case roll >= fateRecord.exceptionalNo: return {roll, result: "exceptional no"};
      default: return {roll, result: "no"};
    }
  }
}

module MythicGME {
  export type FateResult = "exceptional yes" | "yes" | "no" | "exceptional no";
  export type Odds = "impossible" | "no way" | "very unlikely" | "unlikely" | "50/50" | "somewhat likely" | "likely" | "very likely" | "near sure thing" | "a sure thing" | "has to be";
  export type ChaosRank = 9 | 8 | 7 | 6 | 5 | 4 | 3 | 2 | 1;
  
  type FateChartRecord = {
    yes: number;
    exceptionalYes: number;
    exceptionalNo: number;
  }
  export const fateChart: Record<Odds, Record<ChaosRank, FateChartRecord>> = {
    "impossible": {
      9: { exceptionalYes: 10, yes: 50, exceptionalNo: 91 },
      8: { exceptionalYes: 5, yes: 25, exceptionalNo: 86 },
      7: { exceptionalYes: 3, yes: 15, exceptionalNo: 84},
      6: { exceptionalYes: 2, yes: 10, exceptionalNo: 83 },
      5: { exceptionalYes: 1, yes: 5, exceptionalNo: 82 },
      4: { exceptionalYes: 1, yes: 5, exceptionalNo: 82 },
      3: { exceptionalYes: 0, yes: 0, exceptionalNo: 81 },
      2: { exceptionalYes: 0, yes: 0, exceptionalNo: 81 },
      1: { exceptionalYes: 0, yes: -20, exceptionalNo: 77 },
    },
    "no way": {
      9: { exceptionalYes: 15, yes: 75, exceptionalNo: 96 },
      8: { exceptionalYes: 10, yes: 50, exceptionalNo: 91 },
      7: { exceptionalYes: 7, yes: 35, exceptionalNo: 88 },
      6: { exceptionalYes: 5, yes: 25, exceptionalNo: 86 },
      5: { exceptionalYes: 3, yes: 15, exceptionalNo: 84 },
      4: { exceptionalYes: 2, yes: 10, exceptionalNo: 83 },
      3: { exceptionalYes: 1, yes: 5, exceptionalNo: 82 },
      2: { exceptionalYes: 1, yes: 5, exceptionalNo: 82 },
      1: { exceptionalYes: 0, yes: 0, exceptionalNo: 81 },
    },
    "very unlikely": {
      9: { exceptionalYes: 16, yes: 85, exceptionalNo: 97 },
      8: { exceptionalYes: 13, yes: 65, exceptionalNo: 94 },
      7: { exceptionalYes: 10, yes: 50, exceptionalNo: 91 },
      6: { exceptionalYes: 9, yes: 45, exceptionalNo: 90 },
      5: { exceptionalYes: 5, yes: 25, exceptionalNo: 86},
      4: { exceptionalYes: 3, yes: 15, exceptionalNo: 84 },
      3: { exceptionalYes: 2, yes: 10, exceptionalNo: 83 },
      2: { exceptionalYes: 1, yes: 5, exceptionalNo: 82 },
      1: { exceptionalYes: 1, yes: 5, exceptionalNo: 82 },
    },
    "unlikely": {
      9: { exceptionalYes: 18, yes: 90, exceptionalNo: 99 },
      8: { exceptionalYes: 15, yes: 75, exceptionalNo: 96 },
      7: { exceptionalYes: 11, yes: 55, exceptionalNo: 92 },
      6: { exceptionalYes: 10, yes: 50, exceptionalNo: 91 },
      5: { exceptionalYes: 7, yes: 35, exceptionalNo: 88 },
      4: { exceptionalYes: 4, yes: 20, exceptionalNo: 85 },
      3: { exceptionalYes: 3, yes: 15, exceptionalNo: 84 },
      2: { exceptionalYes: 2, yes: 10, exceptionalNo: 83 },
      1: { exceptionalYes: 1, yes: 5, exceptionalNo: 82 },
    },
    "50/50": {
      9: { exceptionalYes: 19, yes: 95, exceptionalNo: 100 },
      8: { exceptionalYes: 16, yes: 85, exceptionalNo: 97 },
      7: { exceptionalYes: 15, yes: 75, exceptionalNo: 96 },
      6: { exceptionalYes: 13, yes: 65, exceptionalNo: 94 },
      5: { exceptionalYes: 10, yes: 50, exceptionalNo: 91 },
      4: { exceptionalYes: 7, yes: 35, exceptionalNo: 88 },
      3: { exceptionalYes: 5, yes: 25, exceptionalNo: 86 },
      2: { exceptionalYes: 3, yes: 15, exceptionalNo: 84 },
      1: { exceptionalYes: 2, yes: 10, exceptionalNo: 83 },
    },
    "somewhat likely": {
      9: { exceptionalYes: 19, yes: 95, exceptionalNo: 100 },
      8: { exceptionalYes: 18, yes: 90, exceptionalNo: 99 },
      7: { exceptionalYes: 16, yes: 85, exceptionalNo: 97 },
      6: { exceptionalYes: 16, yes: 80, exceptionalNo: 97 },
      5: { exceptionalYes: 13, yes: 65, exceptionalNo: 94 },
      4: { exceptionalYes: 10, yes: 50, exceptionalNo: 91 },
      3: { exceptionalYes: 9, yes: 45, exceptionalNo: 90 },
      2: { exceptionalYes: 5, yes: 25, exceptionalNo: 86 },
      1: { exceptionalYes: 4, yes: 20, exceptionalNo: 85 },
    },
    "likely": {
      9: { exceptionalYes: 20, yes: 100, exceptionalNo: 101 },
      8: { exceptionalYes: 19, yes: 95, exceptionalNo: 100 },
      7: { exceptionalYes: 18, yes: 90, exceptionalNo: 99 },
      6: { exceptionalYes: 16, yes: 85, exceptionalNo: 97 },
      5: { exceptionalYes: 15, yes: 75, exceptionalNo: 96 },
      4: { exceptionalYes: 11, yes: 55, exceptionalNo: 92 },
      3: { exceptionalYes: 10, yes: 50, exceptionalNo: 91 },
      2: { exceptionalYes: 7, yes: 35, exceptionalNo: 88 },
      1: { exceptionalYes: 5, yes: 25, exceptionalNo: 86 },
    },
    "very likely": {
      9: { exceptionalYes: 21, yes: 105, exceptionalNo: 101 },
      8: { exceptionalYes: 19, yes: 95, exceptionalNo: 100 },
      7: { exceptionalYes: 19, yes: 95, exceptionalNo: 100 },
      6: { exceptionalYes: 18, yes: 90, exceptionalNo: 99 },
      5: { exceptionalYes: 16, yes: 85, exceptionalNo: 97 },
      4: { exceptionalYes: 15, yes: 75, exceptionalNo: 96 },
      3: { exceptionalYes: 13, yes: 65, exceptionalNo: 94 },
      2: { exceptionalYes: 10, yes: 50, exceptionalNo: 91 },
      1: { exceptionalYes: 9, yes: 45, exceptionalNo: 90 },
    },
    "near sure thing": {
      9: { exceptionalYes: 23, yes: 115, exceptionalNo: 101 },
      8: { exceptionalYes: 20, yes: 100, exceptionalNo: 101 },
      7: { exceptionalYes: 19, yes: 95, exceptionalNo: 100 },
      6: { exceptionalYes: 19, yes: 95, exceptionalNo: 100 },
      5: { exceptionalYes: 18, yes: 90, exceptionalNo: 99 },
      4: { exceptionalYes: 16, yes: 80, exceptionalNo: 97 },
      3: { exceptionalYes: 15, yes: 75, exceptionalNo: 96 },
      2: { exceptionalYes: 11, yes: 55, exceptionalNo: 92 },
      1: { exceptionalYes: 10, yes: 50, exceptionalNo: 91 },
    },
    "a sure thing": {
      9: { exceptionalYes: 25, yes: 125, exceptionalNo: 101 },
      8: { exceptionalYes: 22, yes: 110, exceptionalNo: 101 },
      7: { exceptionalYes: 19, yes: 95, exceptionalNo: 100 },
      6: { exceptionalYes: 19, yes: 95, exceptionalNo: 100 },
      5: { exceptionalYes: 18, yes: 90, exceptionalNo: 99 },
      4: { exceptionalYes: 16, yes: 85, exceptionalNo: 97 },
      3: { exceptionalYes: 16, yes: 80, exceptionalNo: 97 },
      2: { exceptionalYes: 13, yes: 65, exceptionalNo: 94 },
      1: { exceptionalYes: 11, yes: 55, exceptionalNo: 92 },
    },
    "has to be": {
      9: { exceptionalYes: 26, yes: 145, exceptionalNo: 101 },
      8: { exceptionalYes: 26, yes: 130, exceptionalNo: 101 },
      7: { exceptionalYes: 20, yes: 100, exceptionalNo: 101 },
      6: { exceptionalYes: 20, yes: 100, exceptionalNo: 101 },
      5: { exceptionalYes: 19, yes: 95, exceptionalNo: 100 },
      4: { exceptionalYes: 19, yes: 95, exceptionalNo: 100 },
      3: { exceptionalYes: 18, yes: 90, exceptionalNo: 99 },
      2: { exceptionalYes: 16, yes: 85, exceptionalNo: 97 },
      1: { exceptionalYes: 16, yes: 80, exceptionalNo: 97 },
    }
  }
}

registerMod(MythicGME);
