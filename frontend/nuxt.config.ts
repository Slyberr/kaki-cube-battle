/*
 * Kaki Cube — Copyright (C) 2026 Louis Presti
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * See the LICENSE file at the root of this repository for full terms.
 */
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: false },

  modules: ["@nuxt/ui", "@nuxt/icon", "@nuxt/image"],
  css: ["~/assets/css/main.css"],
  ssr: false,
  routeRules : {
    '/': {redirect: 'home'}
  },

  app: {
    head: {
      title: "Kaki Battle Cuber",
      link: [{ rel: "icon", type: "image/svg+xml", href: "/kbc.svg" }],
    },
  },

  runtimeConfig : {
    mailUser : '',
    mailPassword: ''
  },

  nitro: {
    experimental : {
      websocket : true
    }
  },

});