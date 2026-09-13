/*
 * Kaki Cube — Copyright (C) 2026 Louis Presti
 * Licensed under AGPL-3.0. See LICENSE file or
 * https://www.gnu.org/licenses/agpl-3.0.html
 */


import { Resend } from "resend";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const config = useRuntimeConfig(event);

  const { pseudo, mail, message, type } = body;
  const resend = new Resend(config.resendApiKey);

  try {
    resend.emails.send({
      from: `KakiCube <${config.mailUser}>`,
      to: [config.mailUser],
      subject: `Un retour ${type} a été envoyé par ${pseudo.length > 0 ? pseudo : "un anonyme"} !`,
      text:  `${message} \n ${mail.length > 0 ? "Adresse mail de réponse: " + mail : "sans mail renseigné"}`,
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
