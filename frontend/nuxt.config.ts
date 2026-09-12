/*
 * Kaki Cube — Copyright (C) 2026 Louis Presti
 * Licensed under AGPL-3.0. See LICENSE file or
 * https://www.gnu.org/licenses/agpl-3.0.html
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