export type PlayerStats = {
  id: string;
  mean: string;
  ao5: string;
  ao12: string;
  ao50: string | null;
  ao100: string | null;
  ao200: string | null;
  wins: number;
};

export type TimerInfo = {
  realTime: number;
  beginTimeStamp: number;
  timeDisplayed: string;
  state:
    | 'BEGIN_STATE'
    | 'INSPECTION'
    | 'READY_TO-SOLVE'
    | 'RUNNING'
    | 'CONFIRM'
    | 'WAITING_OTHER';
  color: string;
  border: string;
};

