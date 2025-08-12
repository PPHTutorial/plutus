// /types/socket.d.ts
import { Server as HTTPServer } from "http";
import { Server as IOServer } from "socket.io";
import { Socket as NetSocket } from "net";

export type NextApiResponseServerIO = {
  [x: string]: any;
  socket: NetSocket & {
    server: HTTPServer & {
      io: IOServer;
    };
  };
};
