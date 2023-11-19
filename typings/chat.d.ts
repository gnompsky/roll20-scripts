declare type GeneralMessage = Message;
declare type RollResultMessage = Message & {
  readonly origRoll: string;
}
declare type GmRollResultsMessage = RollResultMessage;
declare type EmoteMessage = Message;
declare type WhisperMessage = Message & {
  readonly target: ObjectId | "gm";
  readonly target_name: string;
};
declare type DescMessage = Message;
declare type ApiMessage = Message & {
  readonly selected: OneOfRoll20Object[];
};
declare type Message = {
  readonly type: "general" | "rollresult" | "gmrollresult" | "emote" | "whisper" | "desc" | "api";
  readonly who: string;
  readonly playerid: ObjectId;
  readonly content: "";
  readonly inlinerolls?: NotImplemented[];
  readonly rolltemplate?: string;
}
declare type OneOfMessage = GeneralMessage | RollResultMessage | GmRollResultsMessage | EmoteMessage | WhisperMessage | DescMessage | ApiMessage;

declare function sendChat(
  speakingAs: string | `${"character" | "player"}|${string})`,
  input: string,
  callback?: (ops: OneOfMessage[]) => void | null,
  options?: {
    noarchive?: boolean;
    use3d?: boolean;
  }
): void;