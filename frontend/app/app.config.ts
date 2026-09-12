/*
 * Kaki Cube — Copyright (C) 2026 Louis Presti
 * Licensed under AGPL-3.0. See LICENSE file or
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

export default defineAppConfig({
  ui: {
    table: {
      slots: {
        td: "border-r border-b text-center",
        th: "text-center whitespace-pre-line",
      },
      variants: {
        sticky: {
          true: {
            thead: "bg-gray-900",
          },
        },
      },
    },
    tooltip: {
      slots: {
        content: "h-20 justify-center text-sm",
      },
    },
    modal: {
      variants: {
        fullscreen: {
          false: {
            content: "max-w-4xl",
          },
        },
      },
    },
  },
});
