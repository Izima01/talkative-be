export interface SocketData {
    userId: string;
    username: string;
    picture: string;
    isOnline?: boolean;
}

export interface ServerToClientEvents {
    connection: () => void;
    newMessage: (message: Record<string, any>) => void;
    messageRecieved: (message: Record<string, any>) => void;
    typing: (username: string) => void;
    stopTyping: () => void;
    error: (msg: string) => void;
    addedToGroup: (chat: Record<string, any>) => void;
    removedFromGroup: (chat: Record<string, any>) => void;
}

export interface ClientToServerEvents {
    hello: () => void;
    setup: (data: SocketData) => void;
    error: (dat: string) => void;
    joinChat: (chatId: string) => void;
    newMessage: (message: Record<string, any>) => void;
    newUser: () => void;
    typing: (room: string, username: string) => void;
    stopTyping: (room: string) => void;
    disconnect: (user: SocketData) => void;
    newGroup: (chat: Record<string, any>) => void;
}

interface InterServerEvents {
  ping: () => void;
}
