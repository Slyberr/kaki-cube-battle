export type ClientOptions = {
    mode : 'KEYBOARD' | 'MANUALLY',
    holding : number,
    inspection : {
        activate : boolean,
        key : string,
    } 
}