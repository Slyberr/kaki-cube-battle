
/**
 * 
 * @param timestamp 
 * @param expiration time in minute of sessionID ne to be expired.
 */
export const isValid = (timestamp : number,expiration : number) => {
    const msExpiration = expiration * 60 * 100;

    const actualTime = Date.now();
    const diff = actualTime - timestamp;
    if (diff > msExpiration) {
        return false;
    } else {
        return true;
    }
};