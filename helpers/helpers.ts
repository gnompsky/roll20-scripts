abstract class Mod<TState extends State = {}> {
  private readonly name: string;
  
  constructor(name: string) {
    this.name = name;
  }
  
  public initialiseState(): void {
    if (!state.hasOwnProperty(this.name) || !state[this.name]) state[this.name] = {};
  }
  
  protected getState(): TState {
    return <TState>state[this.name];
  }

  abstract initialise(): void;
  abstract registerEventHandlers(): void;
}

function registerMod<TMod extends Mod<TState>, TState extends State = {}>(
  instance: TMod
) {
  on('ready',function() {
    instance.initialise();
    instance.registerEventHandlers();
  });
}