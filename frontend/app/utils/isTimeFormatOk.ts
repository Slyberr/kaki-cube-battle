/*
 * Kaki Cube — Copyright (C) 2026 Louis Presti
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * See the LICENSE file at the root of this repository for full terms.
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