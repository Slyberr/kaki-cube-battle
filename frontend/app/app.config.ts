/*
 * Kaki Cube — Copyright (C) 2026 Louis Presti
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * See the LICENSE file at the root of this repository for full terms.
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
