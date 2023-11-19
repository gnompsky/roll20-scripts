abstract class Mod<TState extends State = {}> {   
  public initialiseState(): void {
    if (!state.hasOwnProperty(this.constructor.name) || !state[this.constructor.name]) state[this.constructor.name] = {};
  }
  
  protected getState(): TState {
    return <TState>state[this.constructor.name];
  }
  
  protected log(message: any): void {
    message = typeof message === "string" ? message : JSON.stringify(message);
    log(`[MOD - ${this.constructor.name}] ${message}`);
  }

  public abstract initialise(): void;
  public abstract registerEventHandlers(): void;
}

function registerMod<TMod extends Mod<TState>, TState extends State = {}>(type: { new(): TMod} ) {
  const _log = (message: string) => {
    log(`[MOD - ${type.name}] ${message}`);
  };
  
  _log("Instantiating");
  const instance = new type();

  on('ready',function() {
    _log("initialise()");
    instance.initialise();

    _log("registerEventHandlers()");
    instance.registerEventHandlers();
  });
}