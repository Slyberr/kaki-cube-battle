export type PlayerState = 
'READY' 
| 'INSPECTING'
| 'SOLVING' 
| 'CONFIRMATION' 
| 'SCORED';

export type ClientPlayer = {
  socketId: string;
  pseudo: string;
  owner: boolean;
  state: PlayerState;
}



