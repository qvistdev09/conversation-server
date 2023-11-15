import { Reducers } from "./store";

const reducers: Reducers = {
  CONNECT_USER(state, payload) {
    return {
      state,
      effect: { user: "" as any },
    };
  },
};
