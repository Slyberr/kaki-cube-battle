export type ServerPlayer = {
  sessionId: string;
  actualSocketId?: string;
  pseudo: string;
  owner: boolean;
  state: PlayerState;
  expiration?: number;
};

export type ServerRoom = {
  roomname : string;
  password?: string;
  isPrivate: boolean;
  players: ServerPlayer[];
  currentSolve: Solve;
  allSolves: Solve[];
  actualSolveId: number;
  actualScramble: string;
  event: EventID;
};
