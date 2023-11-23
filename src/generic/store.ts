export class Store<StateModel, StoreActionsMap extends GenericActionsMap = {}> {
  private state: StateModel;
  private reducers: Reducers<StoreActionsMap, StateModel> = {};
  private subscribers: {
    action: Action<StoreActionsMap>;
    callback: (state: StateModel, data: Effect<StoreActionsMap>) => void;
  }[];

  constructor(initialState: StateModel) {
    this.state = initialState;
    this.subscribers = [];
  }

  public subscribe<SubscriptionInterest extends Action<StoreActionsMap>>(
    action: SubscriptionInterest,
    callback: (state: StateModel, data: Effect<StoreActionsMap, SubscriptionInterest>) => void
  ) {
    this.subscribers.push({ action, callback });
  }

  public addReducers(reducers: Reducers<StoreActionsMap, StateModel>) {
    this.reducers = { ...this.reducers, ...reducers };
    return this;
  }

  public dispatch<DispatchAction extends Action<StoreActionsMap>>(
    action: DispatchAction,
    payload: Payload<StoreActionsMap, DispatchAction>
  ) {
    const reducer = this.reducers[action] as Reducers<StoreActionsMap, StateModel>[DispatchAction];
    if (reducer) {
      const { state, effect } = reducer(this.state, payload);
      this.state = state;
      this.emit(action, effect);
    }
  }

  private emit<EmitAction extends Action<StoreActionsMap>>(
    action: EmitAction,
    effect: Effect<StoreActionsMap, EmitAction>
  ) {
    for (const subscriber of this.subscribers) {
      if (subscriber.action === action) {
        subscriber.callback(this.state, effect);
      }
    }
  }
}

export type Reducers<ActionsMap extends GenericActionsMap, StateModel> = Partial<{
  [Property in keyof ActionsMap]: <State extends StateModel>(
    state: State,
    payload: ActionsMap[Property]["trigger"]
  ) => { state: StateModel; effect: ActionsMap[Property]["effect"] };
}>;

export type Action<ActionsMap extends GenericActionsMap> = keyof ActionsMap;

export type Payload<
  ActionsMap extends GenericActionsMap,
  SpecificAction extends Action<ActionsMap>
> = ActionsMap[SpecificAction]["trigger"];

export type Effect<
  ActionsMap extends GenericActionsMap,
  SpecificAction extends Action<ActionsMap> = Action<ActionsMap>
> = ActionsMap[SpecificAction]["effect"];

type GenericActionsMap = {
  [key: string]: {
    trigger: any;
    effect: any;
  };
};
