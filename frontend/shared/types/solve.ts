import type { Player } from "./player";

export type Solve = {
  solveId : number | any;
  [idUser : string] : 
  | {time: number, finalPenality : 'DNF' | '+2' | '+4' | 'OK'} 
  | any;
};


export type EventToDrawer =  
| '2x2x2' 
| '3x3x3' 
| '4x4x4' 
| '5x5x5' 
| '6x6x6' 
| 'pyraminx' 
| 'skewb' 
| 'clock' 
| 'fto' 
| 'square1' 
| 'megaminx' 
| '7x7x7';

export type EventID = 
| '222' 
| '333' 
| '333oh' 
| '333bf' 
| '444' 
| '444bf' 
| '555' 
| '555bf' 
| '666' 
| 'pyram' 
| 'skewb' 
| 'clock' 
| 'fto' 
| 'sq1' 
| 'minx' 
| '777';



export const mapEvent = new Map<string, { toDisplay: string, toDrawer: string }>([
  ['222', { toDisplay: '2x2', toDrawer: '2x2x2' }],
  ['333', { toDisplay: '3x3', toDrawer: '3x3x3' }],
  ['333oh', { toDisplay: '3x3 à une main', toDrawer: '3x3x3' }],
  ['333bf', { toDisplay: "3x3 à l'aveugle", toDrawer: '3x3x3' }],
  ['444', { toDisplay: '4x4', toDrawer: '4x4x4' }],
  ['444bf', { toDisplay: "4x4 à l'aveugle", toDrawer: '4x4x4' }],
  ['555', { toDisplay: '5x5', toDrawer: '5x5x5' }],
  ['555bf', { toDisplay: "5x5 à l'aveugle", toDrawer: "5x5x5" }],
  ['666', { toDisplay: '6x6', toDrawer: '6x6x6' }],
  ['777', { toDisplay: '7x7', toDrawer: '7x7x7' }],
  ['pyram', { toDisplay: 'Pyraminx', toDrawer: 'pyraminx' }],
  ['skewb', { toDisplay: 'Skewb', toDrawer: 'skewb' }],
  ['clock', { toDisplay: 'Clock', toDrawer: 'clock' }],
  ['fto', { toDisplay: 'FTO', toDrawer: 'fto' }],
  ['sq1', { toDisplay: 'Square-1', toDrawer: 'square1' }],
  ['minx', { toDisplay: 'Megaminx', toDrawer: 'megaminx' }]
]);


export type Penality = 'NONE' | 'PLUS_2' | 'DNF';

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
