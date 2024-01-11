export interface ServerToClientEvents {
    noArg: () => void;
    basicemit: (a: string, b?: Record<string, any>) => void;
    withAck: (d: string, callback: (e:number) => void) => void;
}

export interface SocketData {
    userId: string;
    username: string;
    picture: string;
    isOnline?: boolean;
}

export interface ClientToServerEvents {
    hello: () => void;
    connection: () => void;
    setup: (data: SocketData) => void;
    error: (dat: string) => void;
    joinChat: (chatId: string) => void;
    newMessage: (message: Record<string, any>) => void;
    typing: () => void;
}

interface InterServerEvents {
  ping: () => void;
}