import { Socket } from "socket.io";
import { User } from "./interfaces";

export type ActionsMap = {
  CONNECT_USER: {
    trigger: { socket: Socket };
    effect: { user: string };
  };
  DELETE_USER: {
    trigger: { id: string };
    effect: { user: User };
  };
};
