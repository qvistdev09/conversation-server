import { Socket } from "socket.io";

export interface StoreModel {
  rooms: Room[];
  users: User[];
  messages: Message[];
}

export interface Room {
  id: string;
  name: string;
}

export interface User {
  id: string;
  displayName: string;
  color: string;
  icon: string;
  isTyping: boolean;
  activeRoom: string;
  socket: Socket;
}

export interface Message {
  id: string;
  authorId: string;
  content: string;
}
