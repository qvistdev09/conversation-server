import { ActionsMap } from "./actions";
import { StoreModel } from "./interfaces";

export class Store {
  private state: StoreModel;
  private reducers: Reducers = {};
  private subscribers: {
    action: Action;
    callback: (state: StoreModel, data: Effect) => void;
  }[];

  constructor(initialState: StoreModel) {
    this.state = initialState;
    this.subscribers = [];
  }

  public subscribe<T extends Action>(
    action: T,
    callback: (state: StoreModel, data: Effect<T>) => void
  ) {
    this.subscribers.push({ action, callback });
  }

  public addReducers(reducers: Reducers) {
    this.reducers = { ...this.reducers, ...reducers };
    return this;
  }

  public dispatch<T extends Action>(action: Action, payload: Payload<T>) {
    const reducer = this.reducers[action] as Reducers[T] | undefined;
    if (reducer) {
      const { state, effect } = reducer(this.state, payload);
      this.state = state;
      this.emit(action, effect);
    }
  }

  private emit<T extends Action>(action: T, effect: Effect<T>) {
    for (const subscriber of this.subscribers) {
      if (subscriber.action === action) {
        subscriber.callback(this.state, effect);
      }
    }
  }
}

export type Reducers = Partial<{
  [Property in keyof ActionsMap]: (
    state: StoreModel,
    payload: ActionsMap[Property]["trigger"]
  ) => { state: StoreModel; effect: ActionsMap[Property]["effect"] };
}>;

export type Action = keyof ActionsMap;

export type Payload<T extends Action> = ActionsMap[T]["trigger"];

export type Effect<T extends Action = Action> = ActionsMap[T]["effect"];
