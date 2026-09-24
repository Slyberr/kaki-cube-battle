export const allAudiosInspection = new Map<string,[string,string,HTMLAudioElement?,HTMLAudioElement?]> (
    [
        ['rien',['rien','Rien']],

        ['8-12',
            [
                '8-12',
                '8/12',
                new Audio('/audio/8-louis.wav'),
                new Audio('/audio/12-louis.wav')
            ]
        ],

        ['8-12-sec',
            [
                '8-12-sec',
                '8/12 secondes',
                new Audio('/audio/8-sec-louis.wav'),
                new Audio('/audio/12-sec-louis.wav')
            ]
        ],
        ['8-12-sec-pol-peuneuj',
            [
                '8-12-sec-pol-peuneuj',
                '8/12 secondes Polonais by Le Peuneuj Roux',
                new Audio('/audio/8-peuneuj.wav'),
                new Audio('/audio/12-peuneuj.wav')
            ]
        ],
        ['simples-ping', 
            [
                'simples-ping',
                'Simples pings',
                new Audio('/audio/8-simple-ping.wav'),
                new Audio('/audio/12-simple-ping.wav')
            ]
        ],
        ['simple-triple-ping',
            [
                'simple-triple-ping',
                'Simple/Triple ping',
                new Audio('/audio/8-simple-ping.wav'),
                new Audio('/audio/12-triple-ping.wav')
            ]
        ]

    ]
)