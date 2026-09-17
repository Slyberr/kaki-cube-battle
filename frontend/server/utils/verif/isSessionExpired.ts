/**
 * Verify that session still valid.
 * @param timestamp 
 * @param expiration time in minute.
 */
export const isSessionExpired = (timestamp : number,expiration : number) => {
    const msExpiration = expiration * 60 * 1000;

    const actualTime = Date.now();
    const diff = actualTime - timestamp;
    if (diff > msExpiration) {
        return true;
    } else {
        return false;
    }
};