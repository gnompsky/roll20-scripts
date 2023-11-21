class QuestNotify implements Mod {
  private readonly QUEST_COMPLETE_TRACK_ID: ObjectId = '-NSN43Z6uIXbvmlgb0WE';
  private readonly QUEST_START_TRACK_ID: ObjectId = '-NSN43ZfQWcTKCW6afgO';

  public initialise(): void {
  }

  public registerEventHandlers(): void {
    on("chat:message", _.bind(this.handleChatMessage, this));
  }

  private handleChatMessage(m: OneOfMessage) {
    if (messageIsApiCommand(m, "quest-notify")) {
      const msg = <ApiMessage>m;
      const args = msg.content.split(" ");
      const state = args[1];
      const questName = args.slice(2).join(" ");

      switch (state) {
        case "complete":
          this.showQuestComplete(questName);
          break;
        case "start":
          this.showQuestStart(questName);
          break;
      }
    }
  }

  private showQuestComplete(questName: string) {
    this.playTrack(this.QUEST_COMPLETE_TRACK_ID);
    sendChat('', '/desc Quest Complete: ' + questName);

    logger(QuestNotify, "COMPLETE " + questName);
  }

  private showQuestStart(questName: string) {
    this.playTrack(this.QUEST_START_TRACK_ID);
    sendChat('', '/desc New Quest: ' + questName);

    logger(QuestNotify, "START " + questName);
  }

  private playTrack(trackId: ObjectId) {
    const track = getObj('jukeboxtrack', trackId);
    if (!track) {
      logger(QuestNotify, `ERROR: Track ${trackId} not found!`);
      return;
    }

    track.set({
      volume: 100,
      loop: false,
      softstop: false,
      playing: true,
    });
  }
}

registerMod(QuestNotify);
