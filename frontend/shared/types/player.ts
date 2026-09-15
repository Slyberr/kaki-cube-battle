export type PlayerState = 
'READY' 
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

