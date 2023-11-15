import crypto from "crypto";
import { Action, ConnectUser } from "./actions";
import { StoreModel } from "./interfaces";

export class Store {
  private state: StoreModel;
  private subscribers: {
    action: abstract new (...args: any) => Action;
    callback: (state: StoreModel, action: Action) => void;
  }[];

  constructor(initialState: StoreModel) {
    this.state = initialState;
    this.subscribers = [];
  }

  public subscribe<T extends abstract new (...args: any) => Action>(
    action: T,
    callback: (state: StoreModel, payload: InstanceType<T>) => void
  ) {
    this.subscribers.push({ action, callback: callback as any });
  }

  public dispatch(action: Action) {
    if (action instanceof ConnectUser) {
      this.state.users = [
        ...this.state.users,
        {
          id: crypto.randomUUID(),
          displayName: "random",
          color: "random",
          icon: "random",
          isTyping: false,
          activeRoom: "main",
          socket: action.socket,
        },
      ];
    }
    this.emit(action);
  }

  private emit(payload: Action) {
    for (const subscriber of this.subscribers) {
      if (payload instanceof subscriber.action) {
        subscriber.callback(this.state, payload);
      }
    }
  }
}
