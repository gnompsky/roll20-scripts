declare type DiceRollModDefinition = {
  /* Comparison type */
  comp: ">=" | "<=";
  /* Comparison point */
  point: number;
};
declare type DiceRollMods = {
  /* Compounding exploding (!!) */
  compounding?: DiceRollModDefinition;
  // TODO: Why can this sometimes be ""? Is this true of all mod types? Does exploding even look like the others?
  exploding?: DiceRollModDefinition | "";
  success?: DiceRollModDefinition;
};
declare type DiceRollResults = {
  v: number;
}[];

declare type RollDiceRoll = {
  dice: number;
  mods: DiceRollMods;
  results: DiceRollResults;
  sides: number;
  type: "R";
};
declare type LabelDiceRoll = {
  text: string;
  type: "L";
};
declare type GroupDiceRoll = {
  type: "G";
  rolls: DiceRoll[][];
  mods: DiceRollMods;
  resultType: "sum" | "success";
  results: DiceRollResults;
}
declare type MathExpressionDiceRoll = {
  expr: string | number;
  type: "M";
};
declare type DiceRoll = RollDiceRoll | LabelDiceRoll | GroupDiceRoll | MathExpressionDiceRoll;

declare type SumInlineRollResult = InlineRollResult & {
  resultType: "sum" | "success";
  rolls: DiceRoll[];
};
declare type MathExpressionInlineRollResult = InlineRollResult & {
  resultType: "M";
  rolls: MathExpressionDiceRoll[];
};
declare type InlineRollResult = {
  total: number,
  type: "V"
};

declare type SumInlineRoll = {
  expression: string;
  results: SumInlineRollResult;
  signature: string;
  rollid?: ObjectId;
  computed?: string;
};
declare type MathExpressionInlineRoll = {
  expression: string;
  results: MathExpressionInlineRollResult
  signature: false;
  computed?: string;
};
declare type InlineRoll = MathExpressionInlineRoll | SumInlineRoll;
