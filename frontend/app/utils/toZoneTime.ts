/**
 * Convert a timestamp to a client locale time.
 * @param time 
 * @returns 
 */
export const toZoneTime = (time : number) => {
    return new Date(time).toLocaleTimeString();
}