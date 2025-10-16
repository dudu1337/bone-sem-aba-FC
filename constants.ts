import { Player, Match, Series } from './types';

export const INITIAL_BUDGET = 50.0;

// Função para calcular os pontos de uma única partida
const calculatePoints = (kills: number, deaths: number, assists: number, hsPercentage: number, winBonus: number): number => {
  const hsKills = Math.round(kills * (hsPercentage / 100));
  const normalKills = kills - hsKills;

  const killPoints = (normalKills * 2) + (hsKills * 2 * 1.3);
  const deathPoints = deaths * -1;
  const assistPoints = assists * 0.5;

  const total = killPoints + deathPoints + assistPoints + winBonus;
  return parseFloat(total.toFixed(2));
};

// Interface para os dados brutos de cada partida
interface RawMatchData {
  map: string;
  kills: number;
  deaths: number;
  assists: number;
  hs: number;
  won: boolean;
  teamScore: number;
  enemyScore: number;
}

// Interface para os dados brutos de cada série
interface RawSeriesData {
  title: string;
  matches: RawMatchData[];
}

// Helper para criar um jogador completo a partir do seu histórico de séries
const createPlayerFromSeriesHistory = (
    baseData: Omit<Player, 'price' | 'lastMatchPoints' | 'seriesHistory' | 'totalKills' | 'totalDeaths' | 'totalAssists' | 'avgHeadshotPercentage' | 'winRate' | 'kdRatio'>,
    seriesData: RawSeriesData[]
): Player => {
    // Ordena as séries por data (assumindo que o título contém a data no formato DD/MM/AA)
    const sortedSeriesData = [...seriesData].sort((a, b) => {
        const dateA = a.title.split(' - ').pop()?.split('/').reverse().join('');
        const dateB = b.title.split(' - ').pop()?.split('/').reverse().join('');
        return (dateA || '').localeCompare(dateB || '');
    });

    const allMatches = sortedSeriesData.flatMap(s => s.matches);

    const totalKills = allMatches.reduce((sum, m) => sum + m.kills, 0);
    const totalDeaths = allMatches.reduce((sum, m) => sum + m.deaths, 0);
    const totalAssists = allMatches.reduce((sum, m) => sum + m.assists, 0);
    const totalHs = allMatches.reduce((sum, m) => sum + m.hs * m.kills / 100, 0); // Pondera HS pela quantidade de kills
    const wins = allMatches.filter(m => m.won).length;

    const avgHeadshotPercentage = totalKills > 0 ? Math.round((totalHs / totalKills) * 100) : 0;
    const winRate = allMatches.length > 0 ? Math.round((wins / allMatches.length) * 100) : 0;
    const kdRatio = totalDeaths > 0 ? parseFloat((totalKills / totalDeaths).toFixed(2)) : totalKills;

    const seriesHistory: Series[] = sortedSeriesData.map((series, seriesIndex) => {
        const matches: Match[] = series.matches.map((m, matchIndex) => {
            const winBonus = m.won ? Math.abs(m.teamScore - m.enemyScore) * 1.5 : 0;
            const points = calculatePoints(m.kills, m.deaths, m.assists, m.hs, winBonus);
            return {
                id: `s${seriesIndex}-m${matchIndex}`,
                map: m.map,
                team1Score: m.teamScore,
                team2Score: m.enemyScore,
                kills: m.kills,
                deaths: m.deaths,
                assists: m.assists,
                headshotPercentage: m.hs,
                points,
                won: m.won
            };
        });
        return {
            id: `series${seriesIndex}`,
            title: series.title,
            matches: matches.reverse(), // Mostra a partida mais recente da série primeiro
        };
    });
    
    // Calcula a média de pontos da última série
    const lastSeries = seriesHistory.length > 0 ? seriesHistory[seriesHistory.length - 1] : null;
    let lastMatchPoints = 0;
    if(lastSeries) {
      const totalSeriesPoints = lastSeries.matches.reduce((sum, match) => sum + match.points, 0);
      lastMatchPoints = lastSeries.matches.length > 0 
          ? parseFloat((totalSeriesPoints / lastSeries.matches.length).toFixed(2)) 
                    : 0;
    }

    // Cálculo de preço dinâmico
    const basePrice = 4.0;
    const overallBonus = Math.max(0, baseData.overall - 75) * 0.25;
    const recentPerformanceBonus = lastMatchPoints * 0.2;
    const kdBonus = (kdRatio - 1.0) * 1.5;
    let price = basePrice + overallBonus + recentPerformanceBonus + kdBonus;
    price = Math.max(5.0, Math.min(20.0, price)); // Garante que o preço fique entre 5.0 e 20.0

    return {
        ...baseData,
        status: baseData.status || 'active',
        price: parseFloat(price.toFixed(2)),
        totalKills,
        totalDeaths,
        totalAssists,
        avgHeadshotPercentage,
        winRate,
        kdRatio,
        lastMatchPoints,
        seriesHistory: seriesHistory.reverse(), // Mostra a série mais recente primeiro
    };
};


// Dados brutos das séries
const playersRawData = {
    Mad: [
        { title: 'Serie 1 - TIM1 0 X 2 BAINheira - 15/10/25', matches: [
            { map: 'Mirage', kills: 16, deaths: 6, assists: 5, hs: 12, won: true, teamScore: 13, enemyScore: 4 },
            { map: 'Inferno', kills: 11, deaths: 11, assists: 9, hs: 63, won: true, teamScore: 13, enemyScore: 4 }
        ]},
        { title: 'Serie 2 - TIME HENRIQUE 1 X 1 TIME MIR - 15/10/25', matches: [
            { map: 'Dust II', kills: 14, deaths: 19, assists: 7, hs: 28, won: true, teamScore: 13, enemyScore: 11 },
            { map: 'Overpass', kills: 27, deaths: 15, assists: 9, hs: 37, won: false, teamScore: 9, enemyScore: 13 }
        ]}
    ],
    Mestre40: [
         { title: 'G12 ANINHOS 2 X 1 BIg FESTINHA - 13/10/25', matches: [
            { map: 'Train', kills: 4, deaths: 9, assists: 4, hs: 25, won: true, teamScore: 13, enemyScore: 3 },
            { map: 'Overpass', kills: 14, deaths: 17, assists: 5, hs: 64, won: false, teamScore: 9, enemyScore: 13 },
        ]},
        { title: 'Serie 1 - TIM1 0 X 2 BAINheira - 15/10/25', matches: [
            { map: 'Mirage', kills: 15, deaths: 13, assists: 2, hs: 53, won: true, teamScore: 13, enemyScore: 4 },
            { map: 'Inferno', kills: 17, deaths: 8, assists: 7, hs: 70, won: true, teamScore: 13, enemyScore: 4 }
        ]},
        { title: 'Serie 2 - TIME HENRIQUE 1 X 1 TIME MIR - 15/10/25', matches: [
            { map: 'Dust II', kills: 11, deaths: 19, assists: 11, hs: 54, won: true, teamScore: 13, enemyScore: 11 },
            { map: 'Overpass', kills: 14, deaths: 20, assists: 9, hs: 42, won: false, teamScore: 9, enemyScore: 13 }
        ]}
    ],
    Pereira: [
        { title: 'Serie 1 - TIM1 0 X 2 BAINheira - 15/10/25', matches: [
            { map: 'Mirage', kills: 18, deaths: 16, assists: 3, hs: 38, won: false, teamScore: 4, enemyScore: 13 },
            { map: 'Inferno', kills: 16, deaths: 14, assists: 1, hs: 37, won: false, teamScore: 4, enemyScore: 13 }
        ]},
        { title: 'Serie 2 - TIME HENRIQUE 1 X 1 TIME MIR - 15/10/25', matches: [
            { map: 'Dust II', kills: 22, deaths: 17, assists: 2, hs: 36, won: true, teamScore: 13, enemyScore: 11 },
            { map: 'Overpass', kills: 12, deaths: 15, assists: 3, hs: 50, won: false, teamScore: 9, enemyScore: 13 }
        ]}
    ],
    MIRZERA: [
        { title: 'G12 ANINHOS 2 X 1 BIg FESTINHA - 13/10/25', matches: [
            { map: 'Mirage', kills: 7, deaths: 7, assists: 3, hs: 43, won: true, teamScore: 13, enemyScore: 5 },
        ]},
        { title: 'Serie 1 - TIM1 0 X 2 BAINheira - 15/10/25', matches: [
            { map: 'Mirage', kills: 13, deaths: 9, assists: 5, hs: 63, won: true, teamScore: 13, enemyScore: 4 },
            { map: 'Inferno', kills: 25, deaths: 8, assists: 1, hs: 28, won: true, teamScore: 13, enemyScore: 4 }
        ]},
        { title: 'Serie 2 - TIME HENRIQUE 1 X 1 TIME MIR - 15/10/25', matches: [
            { map: 'Dust II', kills: 20, deaths: 16, assists: 4, hs: 30, won: true, teamScore: 13, enemyScore: 11 },
            { map: 'Overpass', kills: 13, deaths: 17, assists: 5, hs: 15, won: false, teamScore: 9, enemyScore: 13 }
        ]}
    ],
    oBruxo: [
        { title: 'G12 ANINHOS 2 X 1 BIg FESTINHA - 13/10/25', matches: [
            { map: 'Train', kills: 4, deaths: 14, assists: 1, hs: 100, won: false, teamScore: 3, enemyScore: 13 },
            { map: 'Overpass', kills: 19, deaths: 16, assists: 4, hs: 32, won: true, teamScore: 13, enemyScore: 9 },
            { map: 'Mirage', kills: 12, deaths: 13, assists: 4, hs: 33, won: true, teamScore: 13, enemyScore: 5 },
        ]},
        { title: 'Serie 1 - TIM1 0 X 2 BAINheira - 15/10/25', matches: [
            { map: 'Mirage', kills: 4, deaths: 17, assists: 4, hs: 50, won: false, teamScore: 4, enemyScore: 13 },
            { map: 'Inferno', kills: 7, deaths: 18, assists: 5, hs: 42, won: false, teamScore: 4, enemyScore: 13 }
        ]},
        { title: 'Serie 2 - TIME HENRIQUE 1 X 1 TIME MIR - 15/10/25', matches: [
            { map: 'Dust II', kills: 8, deaths: 22, assists: 8, hs: 37, won: true, teamScore: 13, enemyScore: 11 },
            { map: 'Overpass', kills: 6, deaths: 18, assists: 5, hs: 50, won: false, teamScore: 9, enemyScore: 13 }
        ]}
    ],
    moreno: [
        { title: 'G12 ANINHOS 2 X 1 BIg FESTINHA - 13/10/25', matches: [
            { map: 'Train', kills: 21, deaths: 6, assists: 5, hs: 52, won: true, teamScore: 13, enemyScore: 3 },
            { map: 'Overpass', kills: 19, deaths: 18, assists: 5, hs: 37, won: false, teamScore: 9, enemyScore: 13 },
            { map: 'Mirage', kills: 14, deaths: 11, assists: 6, hs: 50, won: true, teamScore: 13, enemyScore: 5 },
        ]},
        { title: 'Serie 1 - TIM1 0 X 2 BAINheira - 15/10/25', matches: [
            { map: 'Mirage', kills: 18, deaths: 14, assists: 7, hs: 60, won: false, teamScore: 4, enemyScore: 13 },
            { map: 'Inferno', kills: 13, deaths: 15, assists: 2, hs: 60, won: false, teamScore: 4, enemyScore: 13 }
        ]},
        { title: 'Serie 2 - TIME HENRIQUE 1 X 1 TIME MIR - 15/10/25', matches: [
            { map: 'Dust II', kills: 33, deaths: 18, assists: 7, hs: 39, won: false, teamScore: 11, enemyScore: 13 },
            { map: 'Overpass', kills: 22, deaths: 15, assists: 2, hs: 68, won: true, teamScore: 13, enemyScore: 9 }
        ]}
    ],
    RAFARINHA: [
        { title: 'G12 ANINHOS 2 X 1 BIg FESTINHA - 13/10/25', matches: [
            { map: 'Train', kills: 18, deaths: 11, assists: 3, hs: 61, won: true, teamScore: 13, enemyScore: 3 },
            { map: 'Overpass', kills: 18, deaths: 18, assists: 2, hs: 50, won: false, teamScore: 9, enemyScore: 13 },
        ]},
        { title: 'Serie 1 - TIM1 0 X 2 BAINheira - 15/10/25', matches: [
            { map: 'Mirage', kills: 20, deaths: 14, assists: 6, hs: 75, won: true, teamScore: 13, enemyScore: 4 },
            { map: 'Inferno', kills: 10, deaths: 12, assists: 6, hs: 60, won: true, teamScore: 13, enemyScore: 4 }
        ]},
        { title: 'Serie 2 - TIME HENRIQUE 1 X 1 TIME MIR - 15/10/25', matches: [
            { map: 'Dust II', kills: 22, deaths: 18, assists: 5, hs: 45, won: false, teamScore: 11, enemyScore: 13 },
            { map: 'Overpass', kills: 17, deaths: 15, assists: 8, hs: 52, won: true, teamScore: 13, enemyScore: 9 }
        ]}
    ],
    HnRq: [
        { title: 'G12 ANINHOS 2 X 1 BIg FESTINHA - 13/10/25', matches: [
            { map: 'Train', kills: 12, deaths: 15, assists: 2, hs: 83, won: false, teamScore: 3, enemyScore: 13 },
            { map: 'Overpass', kills: 19, deaths: 14, assists: 5, hs: 53, won: true, teamScore: 13, enemyScore: 9 },
            { map: 'Mirage', kills: 18, deaths: 12, assists: 4, hs: 78, won: false, teamScore: 5, enemyScore: 13 },
        ]},
        { title: 'Serie 1 - TIM1 0 X 2 BAINheira - 15/10/25', matches: [
            { map: 'Mirage', kills: 7, deaths: 15, assists: 1, hs: 85, won: false, teamScore: 4, enemyScore: 13 },
            { map: 'Inferno', kills: 14, deaths: 14, assists: 3, hs: 85, won: false, teamScore: 4, enemyScore: 13 }
        ]},
        { title: 'Serie 2 - TIME HENRIQUE 1 X 1 TIME MIR - 15/10/25', matches: [
            { map: 'Dust II', kills: 16, deaths: 18, assists: 4, hs: 62, won: false, teamScore: 11, enemyScore: 13 },
            { map: 'Overpass', kills: 16, deaths: 12, assists: 2, hs: 68, won: true, teamScore: 13, enemyScore: 9 }
        ]}
    ],
    Mateuus: [
         { title: 'G12 ANINHOS 2 X 1 BIg FESTINHA - 13/10/25', matches: [
            { map: 'Train', kills: 9, deaths: 14, assists: 1, hs: 33, won: false, teamScore: 3, enemyScore: 13 },
            { map: 'Overpass', kills: 16, deaths: 14, assists: 11, hs: 31, won: true, teamScore: 13, enemyScore: 9 },
            { map: 'Mirage', kills: 14, deaths: 16, assists: 3, hs: 50, won: false, teamScore: 5, enemyScore: 13 },
        ]},
         { title: 'Serie 1 - TIM1 0 X 2 BAINheira - 15/10/25', matches: [
            { map: 'Mirage', kills: 13, deaths: 11, assists: 8, hs: 38, won: true, teamScore: 13, enemyScore: 4 },
            { map: 'Inferno', kills: 13, deaths: 12, assists: 3, hs: 46, won: true, teamScore: 13, enemyScore: 4 }
        ]},
        { title: 'Serie 2 - TIME HENRIQUE 1 X 1 TIME MIR - 15/10/25', matches: [
            { map: 'Dust II', kills: 14, deaths: 8, assists: 3, hs: 64, won: false, teamScore: 11, enemyScore: 13 },
            { map: 'Overpass', kills: 16, deaths: 16, assists: 2, hs: 43, won: true, teamScore: 13, enemyScore: 9 }
        ]}
    ],
    heroo: [
        { title: 'G12 ANINHOS 2 X 1 BIg FESTINHA - 13/10/25', matches: [
            { map: 'Train', kills: 12, deaths: 9, assists: 2, hs: 67, won: true, teamScore: 13, enemyScore: 3 },
            { map: 'Overpass', kills: 8, deaths: 19, assists: 2, hs: 63, won: false, teamScore: 9, enemyScore: 13 },
            { map: 'Mirage', kills: 9, deaths: 15, assists: 5, hs: 56, won: false, teamScore: 5, enemyScore: 13 },
        ]},
        { title: 'Serie 1 - TIM1 0 X 2 BAINheira - 15/10/25', matches: [
            { map: 'Mirage', kills: 6, deaths: 17, assists: 2, hs: 66, won: false, teamScore: 4, enemyScore: 13 },
            { map: 'Inferno', kills: 6, deaths: 16, assists: 3, hs: 0, won: false, teamScore: 4, enemyScore: 13 }
        ]},
        { title: 'Serie 2 - TIME HENRIQUE 1 X 1 TIME MIR - 15/10/25', matches: [
            { map: 'Dust II', kills: 8, deaths: 18, assists: 4, hs: 50, won: false, teamScore: 11, enemyScore: 13 },
            { map: 'Overpass', kills: 13, deaths: 14, assists: 3, hs: 53, won: true, teamScore: 13, enemyScore: 9 }
        ]}
    ],
    Pedrones: [
         { title: 'G12 ANINHOS 2 X 1 BIg FESTINHA - 13/10/25', matches: [
            { map: 'Train', kills: 15, deaths: 7, assists: 1, hs: 60, won: true, teamScore: 13, enemyScore: 3 },
            { map: 'Overpass', kills: 18, deaths: 16, assists: 3, hs: 61, won: false, teamScore: 9, enemyScore: 13 },
            { map: 'Mirage', kills: 24, deaths: 11, assists: 4, hs: 58, won: true, teamScore: 13, enemyScore: 5 },
        ]}
    ],
    Lucas: [
        { title: 'G12 ANINHOS 2 X 1 BIg FESTINHA - 13/10/25', matches: [
            { map: 'Train', kills: 15, deaths: 13, assists: 2, hs: 47, won: false, teamScore: 3, enemyScore: 13 },
            { map: 'Overpass', kills: 16, deaths: 19, assists: 5, hs: 56, won: true, teamScore: 13, enemyScore: 9 },
            { map: 'Mirage', kills: 12, deaths: 16, assists: 8, hs: 75, won: false, teamScore: 5, enemyScore: 13 },
        ]}
    ],
    vice: [
        { title: 'G12 ANINHOS 2 X 1 BIg FESTINHA - 13/10/25', matches: [
             { map: 'Mirage', kills: 16, deaths: 14, assists: 9, hs: 75, won: true, teamScore: 13, enemyScore: 5 },
        ]}
    ],
    Bernabe: [
         { title: 'G12 ANINHOS 2 X 1 BIg FESTINHA - 13/10/25', matches: [
            { map: 'Train', kills: 2, deaths: 14, assists: 2, hs: 50, won: false, teamScore: 3, enemyScore: 13 },
            { map: 'Overpass', kills: 17, deaths: 15, assists: 8, hs: 29, won: true, teamScore: 13, enemyScore: 9 },
            { map: 'Mirage', kills: 3, deaths: 14, assists: 1, hs: 67, won: false, teamScore: 5, enemyScore: 13 },
        ]}
    ]
};

export const PLAYERS_DATA: Player[] = [
    createPlayerFromSeriesHistory({ id: 4, name: "Mad", photoUrl: `https://i.imgur.com/1VvakVK.png`, team: "Time A", overall: 88 }, playersRawData.Mad),
    createPlayerFromSeriesHistory({ id: 2, name: "Mestre40", photoUrl: `https://i.imgur.com/0LUAmao.png`, team: "Time A", overall: 78 }, playersRawData.Mestre40),
    createPlayerFromSeriesHistory({ id: 1, name: "Pereira", photoUrl: `https://i.imgur.com/Zt3H0I2.png`, team: "Time A", overall: 79 }, playersRawData.Pereira),
    createPlayerFromSeriesHistory({ id: 3, name: "MIRZERA", photoUrl: `https://i.imgur.com/Pi935ZY.png`, team: "Time A", overall: 85 }, playersRawData.MIRZERA),
    createPlayerFromSeriesHistory({ id: 5, name: "oBruxo", photoUrl: `https://i.imgur.com/UsUpz6M.png`, team: "Time A", overall: 68 }, playersRawData.oBruxo),
    createPlayerFromSeriesHistory({ id: 6, name: "moreno", photoUrl: `https://i.imgur.com/aCyjHMk.png`, team: "Time B", overall: 91 }, playersRawData.moreno),
    createPlayerFromSeriesHistory({ id: 7, name: "RAFARINHA", photoUrl: `https://i.imgur.com/8A4gjDE.png`, team: "Time B", overall: 92 }, playersRawData.RAFARINHA),
    createPlayerFromSeriesHistory({ id: 8, name: "HnRq", photoUrl: `https://i.imgur.com/toZ71Ty.png`, team: "Time B", overall: 84 }, playersRawData.HnRq),
    createPlayerFromSeriesHistory({ id: 9, name: "Mateuus", photoUrl: `https://i.imgur.com/MrNIDHI.png`, team: "Time B", overall: 85 }, playersRawData.Mateuus),
    createPlayerFromSeriesHistory({ id: 10, name: "heroo", photoUrl: `https://i.imgur.com/xPVVrf8.png`, team: "Time B", overall: 70 }, playersRawData.heroo),
    createPlayerFromSeriesHistory({ id: 12, name: "Pedrones", photoUrl: `https://i.imgur.com/JotZTU7.png`, team: "Time B", overall: 92, status: 'banned' }, playersRawData.Pedrones),
    createPlayerFromSeriesHistory({ id: 13, name: "Lucas", photoUrl: `https://i.imgur.com/xE5pMH6.png`, team: "Time A", overall: 78 }, playersRawData.Lucas),
    createPlayerFromSeriesHistory({ id: 14, name: "vice", photoUrl: `https://i.imgur.com/yxwreiV.png`, team: "Time B", overall: 82 }, playersRawData.vice),
    createPlayerFromSeriesHistory({ id: 15, name: "Bernabe", photoUrl: `https://i.imgur.com/H2ahLwW.png`, team: "Time A", overall: 72 }, playersRawData.Bernabe),

].sort((a, b) => (a.status === 'banned' ? 1 : -1) - (b.status === 'banned' ? 1 : -1) || b.price - a.price);