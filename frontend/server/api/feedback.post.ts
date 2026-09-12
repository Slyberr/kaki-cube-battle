/*
 * Kaki Cube — Copyright (C) 2026 Louis Presti
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * See the LICENSE file at the root of this repository for full terms.
 */

import nodemailer from "nodemailer";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const config = useRuntimeConfig(event);

  const { pseudo, mail, message, type } = body;

  try {
    const transported = nodemailer.createTransport({
      host: "smtp.ionos.fr",
      port: 465,
      secure: true,
      auth: {
        user: config.mailUser,
        pass: config.mailPassword,
      },
    });

    await transported.sendMail({
      from: `"Kaki Cube Battle" <${config.mailUser}>`,
      to: config.mailUser,
      subject: `Un retour ${type} a été envoyé par ${pseudo.length > 0 ? pseudo : "un anonyme"} !`,
      text: `${message} \n ${mail.length > 0 ? "Adresse mail de réponse: " + mail : "sans mail renseigné"}`,
    });
  } catch (e: any) {
   
    throw createError({
      statusCode: 500,
      message:
        "Une erreur serveur est survenue lors de l'envoi du mail. Votre retour n'a pas été pris en compte (oui c'est un comble).",
    });
  }

  return { success: true };
});
