export interface SocketData {
    userId: string;
    username: string;
    picture: string;
    isOnline?: boolean;
}

export interface ServerToClientEvents {
    noArg: () => void;
    basicemit: (a: string, b?: Record<string, any>) => void;
    connection: () => void;
    newMessage: (message: Record<string, any>) => void;
    withAck: (d: string, callback: (e:number) => void) => void;
    messageRecieved: (message: Record<string, any>) => void;
}

export interface ClientToServerEvents {
    hello: () => void;
    setup: (data: SocketData) => void;
    error: (dat: string) => void;
    joinChat: (chatId: string) => void;
    newMessage: (message: Record<string, any>) => void;
    typing: (room: string) => void;
    stopTyping: (room: string) => void;
    disconnect: (user: SocketData) => void;
}

interface InterServerEvents {
  ping: () => void;
}
