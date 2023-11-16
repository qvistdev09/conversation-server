import { ActionsMap } from "./actions";
import { StoreModel } from "./interfaces";
import { Reducers } from "./store";

export const reducers: Reducers<ActionsMap, StoreModel> = {
  CONNECT_USER: (state, payload) => {
    return { state, effect: { user: "" } };
  },
};
