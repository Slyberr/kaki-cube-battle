export type PlayerState =
  | 'READY'
  | 'INSPECTING'
  | 'SOLVING'
  | 'CONFIRMATION'
  | 'SCORED';

export type Player = {
  id: string;
  pseudo: string;
  owner: boolean;
  state: PlayerState;
};

export type Solve = {
  solveId: number | any;
  [idUser: string]:
    | { time: number; finalPenality: 'DNF' | '+2' | '+4' | 'OK' }
    | any;
};

export type EventID =
  | '222'
  | '333'
  | '333oh'
  | '333bf'
  | '333fm'
  | '444'
  | '444bf'
  | '555'
  | '555bf'
  | '666'
  | '777'
  | 'fto'
  | 'pyram'
  | 'skewb'
  | 'clock'
  | 'minx'
  | 'sq1';

export type Room = {
  roomname : string;
  password?: string;
  isPrivate: boolean;
  players: Player[];
  currentSolve: Solve;
  allSolves: Solve[];
  actualSolveId: number;
  actualScramble: string;
  event: EventID;
};

export type Message = {
  pseudo: string;
  data: string | number;
  date: string;
};

export type Penality = 'NONE' | 'PLUS_2' | 'DNF';
