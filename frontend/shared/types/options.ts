import type { Mode } from "./solve"

export type ClientOptions = {
    mode : Mode,
    holding : number,
    inspection : {
        activate : boolean,
        key : string,
    } 
}