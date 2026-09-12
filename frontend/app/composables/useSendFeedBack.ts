/*
 * Kaki Cube — Copyright (C) 2026 Louis Presti
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * See the LICENSE file at the root of this repository for full terms.
 */

export const useSendFeedBack = async (pseudo : string,mail: string,text : string,type: string) : Promise<any[]> => {

    try {
        await $fetch('/api/feedback', {
            method : 'POST',
            body: {
                message : text,
                mail : mail.trim().length === 0 ? '' : mail,
                pseudo :  pseudo.trim().length === 0 ? '' : pseudo,
                type: type
            }
        })
    } catch (e : any) {
       return [false,e.data.message]
    } 
    return [true,'Votre retour a bien été pris en compte.']
}