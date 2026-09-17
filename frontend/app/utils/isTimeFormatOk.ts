/*
 * Kaki Cube — Copyright (C) 2026 Louis Presti
 * Licensed under AGPL-3.0. See LICENSE file or
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

/**
 * Forthe manual mode, check is the input is ok for sendTime().
 * @param value 
 * @returns 
 */
export const isTimeFormatOk = (value : string) : [boolean,string]  => {

    if (value.length >= 3) {
        if (value === 'DNF') {  
            return [true,'DNF'];
        //Only digit || 0123 = 01.23 (no), 012 = 0.12 = yes 
        } else if ((/^\d+$/.test(value) && value.length <= 6) && !(value[0] === '0' && value.length > 3)) {
            const formatedValue = (parseInt(value)/100).toFixed(2);
            const formatedValueForMin = (parseInt(value)/100).toFixed(2);
            if (value.length === 5) {
                return [true,formatedValueForMin.slice(0,1) + ':' + formatedValueForMin.slice(1)];
            }
            if (value.length === 6) {
                return [true,formatedValueForMin.slice(0,2) + ':' + formatedValueForMin.slice(2)];
            }
            return [true,formatedValue];
        } else {
            return [false,"?"];
        }

    } else {
        return [false,"?"];
    }
};