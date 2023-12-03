module AnimationStudio {
  export type State = {
    animations: Record<AnimationKey, AnimationDefinition>;
  }

  export type AnimationKey = `${ObjectId}.${string}`;
  
  export type AnimationDefinition = {
    fps: number;
    loop: boolean;
    frames: KeyFrame[];
  }
  
  export type KeyFrame = {
    objectProperties: Record<ObjectId, Partial<GraphicObjectProperties>>;
  }
}

class AnimationStudio implements Mod<AnimationStudio.State> {
  private readonly _playing: Record<AnimationStudio.AnimationKey, NodeJS.Timeout | null> = {};
  private _inProduction: { key: AnimationStudio.AnimationKey, definition: AnimationStudio.AnimationDefinition } | null = null;
  
  public initialise(): void {
    const state = this.getState();
    if (!state.animations) state.animations = {};

    logger(AnimationStudio, "Stored animations: " + Object.keys(state.animations).length);
  }

  public registerEventHandlers(): void {
    on("chat:message", _.bind(this.handleChatMessage, this));
  }
  
  private handleChatMessage(m: OneOfMessage): void {
    if (!messageIsApiCommand(m, "animation", false)) return;
    const msg = <ApiMessage>m;
    if (!playerIsGM(msg.playerid)) return;
    
    // Skip !animate and subcommand
    const args = msg.content.split(" ");
    if (args.length < 2) return this.handleRenderMenu(msg);
    
    const command = args[1].toLowerCase();
    const commandArgs = _.rest(args, 2);
    
    switch (true) {
      case (command === "list"): return this.handleListCommand(msg, commandArgs.length >= 1 ? commandArgs[0] : undefined);
      case (command === "record" && commandArgs.length >= 3): 
        return this.handleRecordCommand(
          msg, 
          parseInt(commandArgs[0], 10), 
          commandArgs[1].toLowerCase() === "true",
          commandArgs.slice(2).join(" "),
        );
      case (command === "addframe" && !!this._inProduction): return this.handleAddFrame(msg);
      case (command === "deleteframe" && !!this._inProduction): return this.handleDeleteFrame(msg);
      case (command === "save" && !!this._inProduction): return this.handleSaveAnimation(msg);
      case (command === "setfps" && commandArgs.length >= 2): return this.handleSetFps(
        msg,
        parseInt(commandArgs[0], 10),
        commandArgs.slice(1).join(" ")
      );
      case (command === "setloop" && commandArgs.length >= 2): return this.handleSetLoop(
        msg,
        commandArgs[0].toLowerCase() === "true",
        commandArgs.slice(1).join(" ")
      );
      case (command === "play" && commandArgs.length >= 1): return this.handlePlayCommand(msg, commandArgs.join(" "));
      case (command === "stop" && commandArgs.length >= 1): return this.handleStopCommand(msg, commandArgs.join(" "));
      case (command === "delete" && commandArgs.length >= 1): return this.handleDeleteCommand(msg, commandArgs.join(" "));
      default: return logger(AnimationStudio, `ERROR: Unknown subcommand '${args[1]}'`);
    }
  }

  private handleRenderMenu(msg: ApiMessage): void {
    const animations = this.getAnimationKeysForThisPage(msg, false);
    let animationList = animations.map((key) => {
      const name = key.split(".")[1];
      return `${name},${name}`;
    }).join("|");

    // If there's only one animation we need to add an empty option at the end or the menu will be broken
    animationList += animations.length > 1 ? "" : "|";
    
    let message = `/w gm &{template:default} {{name=Animation Studio
}} {{[List (this page)](!animation list)=[List (all pages)](!animation list all)
}} {{[New](!animation record ?{FPS|1} ?{Loop?|No,false|Yes,true} ?{Animation name})=[Delete (from this page)](!animation delete ?{Animation|${animationList}})
}} {{[Set FPS](!animation setfps ?{FPS|1} ?{Animation|${animationList}})=[Set Loop](!animation setloop ?{Loop?|No,false|Yes,true} ?{Animation|${animationList}})
}} {{[Play](!animation play ?{Animation|${animationList}})=[Stop](!animation stop ?{Animation|${animationList}})
}}`;
    
    sendChat(msg.who, message);
  }
  
  private handleListCommand(msg: ApiMessage, all?: string): void {
    const animations = this.getAnimationKeysForThisPage(msg, all === "all");

    let message = `/w gm &{template:default} {{name=Stored animations
`;
    _.forEach(animations, (key) => {
      const [pageId, animationName] = key.split(".");
      const pageName = this.getPage(pageId).get("name");
      
      message += `}} {{${animationName}=(${pageName})
`;
    });
    
    message += "}}";
    
    sendChat(msg.who, message);
  }
  
  private handleRecordCommand(msg: ApiMessage, fps: number, loop: boolean, animationName: string): void {
      const pageId = this.getPageId(msg);
      const page = this.getPage(pageId);
      
      this._inProduction = {
        key: `${pageId}.${animationName}`,
        definition: {
          fps,
          loop,
          frames: []
        }
      };
      
      sendChat(msg.who, `/w gm Recording animation '${animationName}' (${fps} FPS) on page '${page.get("name")}'`);
      this.renderRecordMenu(msg);
  }
  
  private handleAddFrame(msg: ApiMessage): void {
    const anim = this._inProduction?.definition;
    if (!anim) return;
    
    const newFrame: AnimationStudio.KeyFrame = {
      objectProperties: {}
    };
    msg.selected?.forEach((s) => {
      if (s._type !== "graphic") return;
      const graphic = getObj("graphic", s._id)!;
      if (graphic.get("_subtype") !== "token") return;
      
      const newProperties: Partial<GraphicObjectProperties> = {};
      _.forEach(AnimationStudio.graphicProperties, (prop) => {
        // @ts-ignore - TS doesn't know that we've explicitly ignored the readonly props in this list
        newProperties[prop] = graphic.get(prop);
      });
      
      newFrame.objectProperties[graphic.id] = newProperties;
    });
    
    anim.frames.push(newFrame);

    sendChat(msg.who, `/w gm Frame ${anim.frames.length} recorded`);
    this.renderRecordMenu(msg);
  }
  
  private handleDeleteFrame(msg: ApiMessage): void {
    const anim = this._inProduction?.definition;
    if (!anim) return;

    if (anim.frames.length === 0) return sendChat(msg.who, "/w gm No frames to delete");
    
    anim.frames.pop();
    sendChat(msg.who, `/w gm Frame ${anim.frames.length + 1} deleted`);
    this.renderRecordMenu(msg);
  }
  
  private handleSaveAnimation(msg: ApiMessage): void {
    if (!this._inProduction) return;
    
    const state = this.getState();
    const { key, definition } = this._inProduction;
    
    state.animations[key] = Object.assign({}, definition);
    this._inProduction = null;
    
    sendChat(msg.who, `/w gm Animation '${key.split(".")[1]}' saved`);
    this.handleRenderMenu(msg);
  }
  
  private handleSetFps(msg: ApiMessage, fps: number, animationName: string): void {
    const state = this.getState();
    const key: AnimationStudio.AnimationKey = `${this.getPageId(msg)}.${animationName}`;
    const animation = state.animations[key];
    if (!animation) return sendChat(msg.who, `/w gm Animation '${animationName}' not found`);
    
    animation.fps = fps;
  }
  
  private handleSetLoop(msg: ApiMessage, loop: boolean, animationName: string): void {
    const state = this.getState();
    const key: AnimationStudio.AnimationKey = `${this.getPageId(msg)}.${animationName}`;
    const animation = state.animations[key];
    if (!animation) return sendChat(msg.who, `/w gm Animation '${animationName}' not found`);
    
    animation.loop = loop;
  }
  
  private handlePlayCommand(msg: ApiMessage, animationName: string): void {
    const state = this.getState();
    const key: AnimationStudio.AnimationKey = `${this.getPageId(msg)}.${animationName}`;
    const animation = state.animations[key];
    if (!animation) return sendChat(msg.who, `/w gm Animation '${animationName}' not found`);

    this.playAnimation(key, animation);
  }
  
  private handleStopCommand(msg: ApiMessage, animationName: string): void {
    const key: AnimationStudio.AnimationKey = `${this.getPageId(msg)}.${animationName}`;
    this.stopAnimation(key);
  }
  
  private handleDeleteCommand(msg: ApiMessage, animationName: string): void {
    const state = this.getState();
    const key: AnimationStudio.AnimationKey = `${this.getPageId(msg)}.${animationName}`;

    if (!state.animations[key]) return sendChat(msg.who, `/w gm Animation '${animationName}' not found`);
    
    this.stopAnimation(key);
    delete state.animations[key];
    delete this._playing[key];
    sendChat(msg.who, `/w gm Animation '${animationName}' deleted`);
    this.handleRenderMenu(msg);
  }
  
  private renderRecordMenu(msg: ApiMessage): void {
    const animation = this._inProduction?.definition;
    if (!animation) return;
    
    const message = `/w gm &{template:default} {{name=Recording animation
}} {{Current frame=${animation.frames.length + 1}
}} {{[Add frame](!animation addframe)=[Delete frame](!animation deleteframe)
}} {{[Save](!animation save)=
}}`;
    
    sendChat(msg.who, message);
  }
  
  private playAnimation(key: AnimationStudio.AnimationKey, animation: AnimationStudio.AnimationDefinition) {
    // Capture the stop function so we don't have to pass a context around
    const stopThisAnimation = _.bind(() => this.stopAnimation(key), this);
    stopThisAnimation();
    
    const frameTime = Math.floor(1000 / animation.fps);
    logger(AnimationStudio, `Playing a frame of ${key} every ${frameTime}ms`);

    let currentFrame = 0;
    this._playing[key] = setInterval(
      // Run the next frame of the animation...
      function() {
        if (currentFrame >= animation.frames.length) {
          if (animation.loop) currentFrame = 0;
          else return stopThisAnimation();
        }

        const frame = animation.frames[currentFrame];
        logger(AnimationStudio, `Playing frame ${currentFrame} of ${key}`);
        _.forEach(frame.objectProperties, (props, id) => {
          const graphic = getObj("graphic", id)!;
          logger(AnimationStudio, `Setting props of ${graphic.id}`);

          if (graphic.get("_subtype") !== "token") return;

          graphic.set(props);
        });
        currentFrame++;
      },
      // ...at the animation's FPS
      frameTime
    );
  }
  private stopAnimation(key: AnimationStudio.AnimationKey) {
    const interval = this._playing[key];
    if (interval) clearInterval(interval);
    this._playing[key] = null;
  }

  private getAnimationKeysForThisPage(msg: ApiMessage, allPages: boolean): AnimationStudio.AnimationKey[] {
    let animations = Object.keys(this.getState().animations) as AnimationStudio.AnimationKey[];
    if (!allPages) {
      const pageId = this.getPageId(msg);
      animations = animations.filter((key) => key.startsWith(`${pageId}.`));
    }
    return animations;
  }
  private getPageId(msg: OneOfMessage): ObjectId {
    return getObj("player", msg.playerid)!.get("_lastpage");
  }
  private getPage(pageId: ObjectId): PageObject {
    return getObj("page", pageId)!;
  }
  private getState(): AnimationStudio.State {
    return getState<AnimationStudio, AnimationStudio.State>(this);
  }
  
  private static readonly graphicProperties: (keyof GraphicObjectProperties)[] = [
    "left",
    "top",
    "width",
    "height",
    "rotation",
    "layer",
    "flipv",
    "fliph",
    "name",
    "bar1_value",
    "bar2_value",
    "bar3_value",
    "bar1_max",
    "bar2_max",
    "bar3_max",
    "aura1_radius",
    "aura2_radius",
    "aura1_color",
    "aura2_color",
    "aura1_square",
    "aura2_square",
    "tint_color",
    "statusmarkers",
    "token_markers",
    "showname",
    "showplayers_name",
    "showplayers_bar1",
    "showplayers_bar2",
    "showplayers_bar3",
    "showplayers_aura1",
    "showplayers_aura2",
    "playersedit_name",
    "playersedit_bar1",
    "playersedit_bar2",
    "playersedit_bar3",
    "playersedit_aura1",
    "playersedit_aura2",
    "light_radius",
    "light_dimradius",
    "light_otherplayers",
    "light_hassight",
    "light_angle",
    "light_losangle",
    "light_multiplier",
    "adv_fow_view_distance",
    "light_sensitivity_multiplier",
    "night_vision_effect",
    "bar_location",
    "compact_bar"
  ];
}

registerMod(AnimationStudio);