/*
 * Kaki Cube — Copyright (C) 2026 Louis Presti
 * Licensed under AGPL-3.0. See LICENSE file or
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

export default defineAppConfig({
  ui: {
    table: {
      slots: {
        td: "border-r border-b text-center p-0 h-13",
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
        content: "h-10 justify-center text-sm",
      },
    },
    modal: {
      variants: {
        fullscreen: {
          false: {
            content: "max-w-2xl",
          },
        },
      },
    },
    header : {
      slots : {
        title : 'pointer-events-none'
      }
    },
    banner : {
      slots : {
        title: 'text-red-400/80 text-xs sm:text-sm ',
        icon : 'bg-red-400/80'
      }
      
    }
  },
});
