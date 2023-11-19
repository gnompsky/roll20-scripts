import KeyFrame = AnimationStudio.KeyFrame;

module AnimationStudio {
  export type State = {
    animations: Record<AnimationKey, AnimationDefinition>;
    inProduction: {
      key: AnimationKey;
      definition: AnimationDefinition;
    } | null;
  }

  export type AnimationKey = `${ObjectId}.${string}`;
  
  export type AnimationDefinition = {
    fps: number;
    frames: KeyFrame[];
  }
  
  export type KeyFrame = {
    objectProperties: Record<ObjectId, Partial<GraphicObjectProperties>>;
  }
}

class AnimationStudio implements Mod<AnimationStudio.State> {
  public initialise(): void {
    const state = this.getState();
    if (!state.animations) state.animations = {};
    
    // We won't support continuing across sessions for now so just clear any previously in production animation
    state.inProduction = null;

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
      case (command === "record" && commandArgs.length >= 2): return this.handleRecordCommand(msg, commandArgs[0], parseInt(commandArgs[1], 10));
      case (command === "addframe" && !!this.getState().inProduction): return this.handleAddFrame(msg);
      case (command === "deleteframe" && !!this.getState().inProduction): return this.handleDeleteFrame(msg);
      case (command === "save" && !!this.getState().inProduction): return this.handleSaveAnimation(msg);
      case (command === "play" && commandArgs.length >= 1): return this.handlePlayCommand(msg, commandArgs[0]);
      case (command === "delete" && commandArgs.length >= 1): return this.handleDeleteCommand(msg, commandArgs[0]);
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
}} {{[New](!animation record ?{Animation name} ?{FPS|1})=[Play](!animation play ?{Animation|${animationList}})
}} {{[Delete (from this page)](!animation delete ?{Animation|${animationList}})=
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
  
  private handleRecordCommand(msg: ApiMessage, animationName: string, fps: number): void {
      const pageId = this.getPageId(msg);
      const page = this.getPage(pageId);
      
      this.getState().inProduction = {
        key: `${pageId}.${animationName}`,
        definition: {
          fps,
          frames: []
        }
      };
      
      sendChat(msg.who, `/w gm Recording animation '${animationName}' (${fps} FPS) on page '${page.get("name")}'`);
      this.renderRecordMenu(msg);
  }
  
  private handleAddFrame(msg: ApiMessage): void {
    const anim = this.getState().inProduction!.definition;
    
    const newFrame: KeyFrame = {
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
    const anim = this.getState().inProduction!.definition;
    if (anim.frames.length === 0) return sendChat(msg.who, "/w gm No frames to delete");
    
    anim.frames.pop();
    sendChat(msg.who, `/w gm Frame ${anim.frames.length + 1} deleted`);
    this.renderRecordMenu(msg);
  }
  
  private handleSaveAnimation(msg: ApiMessage): void {
    const state = this.getState();
    const { key, definition } = state.inProduction!;
    
    state.animations[key] = Object.assign({}, definition);
    state.inProduction = null;
    
    sendChat(msg.who, `/w gm Animation '${key.split(".")[1]}' saved`);
  }
  
  private handlePlayCommand(msg: ApiMessage, animationName: string): void {
    const state = this.getState();
    const key: AnimationStudio.AnimationKey = `${this.getPageId(msg)}.${animationName}`;
    const animation = state.animations[key];
    if (!animation) return sendChat(msg.who, `/w gm Animation '${animationName}' not found`);

    let currentFrame = 0;
    const interval: NodeJS.Timeout = setInterval(
      // Run the next frame of the animation...
      function() {
        if (currentFrame >= animation.frames.length) return clearInterval(interval);
        
        const frame = animation.frames[currentFrame];
        _.forEach(frame.objectProperties, (props, id) => {
          const graphic = getObj("graphic", id)!;
          if (graphic.get("_subtype") !== "token") return;
  
          graphic.set(props);
        });
        currentFrame++;
      },
      // ...at the animation's FPS
      Math.floor(1000 / animation.fps)
    );
  }
  
  private handleDeleteCommand(msg: ApiMessage, animationName: string): void {
    const state = this.getState();
    const key: AnimationStudio.AnimationKey = `${this.getPageId(msg)}.${animationName}`;

    if (!state.animations[key]) return sendChat(msg.who, `/w gm Animation '${animationName}' not found`);
    
    delete state.animations[key];
    sendChat(msg.who, `/w gm Animation '${animationName}' deleted`);
  }
  
  private renderRecordMenu(msg: ApiMessage): void {
    const animation = this.getState().inProduction!.definition;
    
    const message = `/w gm &{template:default} {{name=Recording animation
}} {{Current frame=${animation.frames.length + 1}
}} {{[Add frame](!animation addframe)=[Delete frame](!animation deleteframe)
}} {{[Save](!animation save)=
}}`;
    
    sendChat(msg.who, message);
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
  
  private static readonly graphicProperties: (keyof GraphicObjectProperties)[] = ["imgsrc", "left", "top", "width", "height", "rotation", "layer", "flipv", 
    "fliph", "name", "bar1_value", "bar2_value", "bar3_value", "bar1_max", "bar2_max", "bar3_max", "aura1_radius", "aura2_radius", "aura1_color", "aura2_color",
    "aura1_square", "aura2_square", "tint_color", "statusmarkers", "token_markers", "showname", "showplayers_name", "showplayers_bar1", "showplayers_bar2", 
    "showplayers_bar3", "showplayers_aura1", "showplayers_aura2", "playersedit_name", "playersedit_bar1", "playersedit_bar2", "playersedit_bar3", 
    "playersedit_aura1", "playersedit_aura2", "light_radius", "light_dimradius", "light_otherplayers", "light_hassight", "light_angle", "light_losangle", 
    "light_multiplier", "adv_fow_view_distance", "light_sensitivity_multiplier", "night_vision_effect", "bar_location", "compact_bar"];
}

registerMod(AnimationStudio);