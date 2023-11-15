import { Socket } from "socket.io";

export type ActionsMap = {
  CONNECT_USER: {
    trigger: { socket: Socket };
    response: { id: string };
  };
};

export type ActionType = keyof ActionsMap;

export class ConnectUser {
  constructor(public socket: Socket) {}
}

export type Action = ConnectUser;
