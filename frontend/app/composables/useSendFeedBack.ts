/*
 * Kaki Cube — Copyright (C) 2026 Louis Presti
 * Licensed under AGPL-3.0. See LICENSE file or
 * https://www.gnu.org/licenses/agpl-3.0.html
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