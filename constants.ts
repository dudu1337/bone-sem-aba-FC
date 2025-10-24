

import { Player, Match, Series, RatingHistory } from './types';

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
  isTie?: boolean;
}

// Interface para os dados brutos de cada série
interface RawSeriesData {
  title: string;
  matches: RawMatchData[];
}

// Dados de rating históricos para simulação
const originalOveralls: { [key: string]: number } = {
    Mad: 88, Mestre40: 79, Pereira: 79, MIRZERA: 85, oBruxo: 69, moreno: 91,
    RAFARINHA: 92, HnRq: 84, Mateuus: 85, heroo: 70, Pedrones: 92, Lucas: 78,
    vice: 82, Bernabe: 72, VDD: 82, Hiagod: 78, "Ratão": 73, Pimentel: 74,
    a1: 76, "ROB erio": 77, BTR: 70, luquinhas: 78, Edu: 78, zkzin: 78, Chico: 78
};

const overalls1510: { [key: string]: number } = {
    Mad: 89, Mestre40: 78, Pereira: 84, MIRZERA: 87, oBruxo: 68, moreno: 88,
    RAFARINHA: 89, HnRq: 84, Mateuus: 86, heroo: 68, Bernabe: 65, Chico: 78
};

const overalls1610: { [key: string]: number } = {
    Mad: 90, 
    Mestre40: 78, 
    Pereira: 88, 
    MIRZERA: 88, 
    oBruxo: 68,
    moreno: 88,
    RAFARINHA: 89, 
    HnRq: 84, 
    Mateuus: 87, 
    heroo: 67, 
    Bernabe: 64,
    Pimentel: 74,
    Chico: 78
};

const overalls1810: { [key: string]: number } = {
    moreno: 89,
    MIRZERA: 86,
    luquinhas: 78,
    Mestre40: 78,
    "ROB erio": 77,
    Pereira: 91,
    VDD: 82,
    Edu: 78,
    Lucas: 79,
    oBruxo: 67,
    Chico: 78
};

// Ratings de 20/10 (estado antes da atualização de 21/10)
const overalls2010: { [key: string]: number } = {
    Mad: 92, Mestre40: 75, Pereira: 92, MIRZERA: 85, oBruxo: 69, moreno: 88,
    RAFARINHA: 90, HnRq: 84, Mateuus: 86, heroo: 66, Pedrones: 91, Lucas: 83,
    vice: 81, Bernabe: 63, VDD: 80, Hiagod: 78, "Ratão": 73, Pimentel: 74,
    a1: 76, "ROB erio": 78, BTR: 69, luquinhas: 82, Edu: 80, Chico: 78
};

// Novos ratings após a rodada de 21/10
const overalls2110: { [key: string]: number } = {
    Mateuus: 88,
    Pereira: 93,
    a1: 79,
    "ROB erio": 81,
    oBruxo: 70,
    MIRZERA: 84,
    VDD: 78,
    Edu: 79,
    luquinhas: 80,
    Mestre40: 75,
    Chico: 78
};

// Novos ratings após a rodada de 22/10
const overalls2210: { [key: string]: number } = {
    Hiagod: 85,
    Pereira: 94,
    zkz1n: 80,
    Chico: 80,
    "Ratão": 76,
    Mestre40: 74,
    Mateuus: 87,
    moreno: 87,
    oBruxo: 68,
    Lucas: 81,
};

// Novos ratings após a rodada de 23/10
const overalls2310: { [key: string]: number } = {
    VDD: 84,
    zkz1n: 85,
    Chico: 84,
    Pereira: 95,
    Lucas: 82,
    moreno: 86,
    MIRZERA: 83,
    HnRq: 82,
    Mestre40: 72,
    oBruxo: 66,
};

const overalls2410: { [key: string]: number } = {
    RAFARINHA: 92,
    moreno: 87,
    Mestre40: 71,
    HnRq: 82, // no change
    Mateuus: 86,
    Pereira: 94,
    MIRZERA: 82,
    // Base ratings for new players
    Vitorin: 75,
    ccc: 75,
    revolteD: 75,
};


// Helper para criar um jogador completo a partir do seu histórico de séries
const createPlayerFromSeriesHistory = (
    baseData: Omit<Player, 'price' | 'lastMatchPoints' | 'seriesHistory' | 'totalKills' | 'totalDeaths' | 'totalAssists' | 'avgHeadshotPercentage' | 'winRate' | 'kdRatio' | 'winRateByMap' | 'ratingHistory'>,
    seriesData: RawSeriesData[]
): Player => {
    // Ordena as séries por data (assumindo que o título contém a data no formato DD/MM/AA)
    const sortedSeriesData = [...seriesData].sort((a, b) => {
        const dateA = a.title.split(' - ').pop()?.split('/').reverse().join('');
        const dateB = b.title.split(' - ').pop()?.split('/').reverse().join('');
        return (dateA || '').localeCompare(dateB || '');
    });

    const allRawMatches = sortedSeriesData.flatMap(s => s.matches);

    const totalKills = allRawMatches.reduce((sum, m) => sum + m.kills, 0);
    const totalDeaths = allRawMatches.reduce((sum, m) => sum + m.deaths, 0);
    const totalAssists = allRawMatches.reduce((sum, m) => sum + m.assists, 0);
    const totalHs = allRawMatches.reduce((sum, m) => sum + m.hs * m.kills / 100, 0);

    const matchesForWinRate = allRawMatches.filter(m => !m.isTie);
    const wins = matchesForWinRate.filter(m => m.won).length;

    const avgHeadshotPercentage = totalKills > 0 ? Math.round((totalHs / totalKills) * 100) : 0;
    const winRate = matchesForWinRate.length > 0 ? Math.round((wins / matchesForWinRate.length) * 100) : 0;
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
                won: m.won,
                isTie: !!m.isTie
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

    // Cálculo de win rate por mapa
    const winRateByMap: { [mapName: string]: number } = {};
    const mapGames: { [mapName: string]: { played: number; won: number } } = {};
    allRawMatches.forEach(m => {
        if (!mapGames[m.map]) {
            mapGames[m.map] = { played: 0, won: 0 };
        }
        if(!m.isTie) {
          mapGames[m.map].played++;
          if (m.won) {
              mapGames[m.map].won++;
          }
        }
    });
    for (const map in mapGames) {
        winRateByMap[map] = mapGames[map].played > 0 ? Math.round((mapGames[map].won / mapGames[map].played) * 100) : 0;
    }


    // Cálculo de preço dinâmico
    const basePrice = 4.0;
    const overallBonus = Math.max(0, baseData.overall - 75) * 0.25;
    const recentPerformanceBonus = lastMatchPoints * 0.2;
    const kdBonus = (kdRatio - 1.0) * 1.5;
    let price = basePrice + overallBonus + recentPerformanceBonus + kdBonus;
    price = Math.max(5.0, Math.min(20.0, price)); // Garante que o preço fique entre 5.0 e 20.0
    
    // Geração do histórico de ratings
    const ratingHistory: RatingHistory[] = [];
    const pushIfChanged = (date: string, overall: number | undefined) => {
        if (overall !== undefined && (ratingHistory.length === 0 || ratingHistory[ratingHistory.length - 1].overall !== overall)) {
            ratingHistory.push({ date, overall });
        }
    };
    
    pushIfChanged('Original', originalOveralls[baseData.name]);
    pushIfChanged('15/10', overalls1510[baseData.name]);
    pushIfChanged('16/10', overalls1610[baseData.name]);
    pushIfChanged('18/10', overalls1810[baseData.name]);
    pushIfChanged('20/10', overalls2010[baseData.name]);
    pushIfChanged('21/10', overalls2110[baseData.name]);
    pushIfChanged('22/10', overalls2210[baseData.name]);
    pushIfChanged('23/10', overalls2310[baseData.name]);
    pushIfChanged('24/10', overalls2410[baseData.name]);


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
        winRateByMap,
        ratingHistory,
    };
};


// Dados brutos das séries
const playersRawData: { [key: string]: RawSeriesData[] } = {
    Mad: [
        { title: 'Serie 1 - TIM1 0 X 2 BAINheira - 15/10/25', matches: [
            { map: 'Mirage', kills: 16, deaths: 6, assists: 5, hs: 12, won: true, teamScore: 13, enemyScore: 4 },
            { map: 'Inferno', kills: 11, deaths: 11, assists: 9, hs: 63, won: true, teamScore: 13, enemyScore: 4 }
        ]},
        { title: 'Serie 2 - TIME HENRIQUE 1 X 1 TIME MIR - 15/10/25', matches: [
            { map: 'Dust II', kills: 14, deaths: 19, assists: 7, hs: 28, won: true, teamScore: 13, enemyScore: 11 },
            { map: 'Overpass', kills: 27, deaths: 15, assists: 9, hs: 37, won: false, teamScore: 9, enemyScore: 13 }
        ]},
        { title: 'Serie 3 - TEAM MAD 2 X 1 TEAM MORENO - 16/10/25', matches: [
            { map: 'Mirage', kills: 22, deaths: 7, assists: 0, hs: 63, won: true, teamScore: 13, enemyScore: 3 },
            { map: 'Train', kills: 21, deaths: 14, assists: 6, hs: 61, won: false, teamScore: 11, enemyScore: 13 },
            { map: 'Overpass', kills: 26, deaths: 10, assists: 8, hs: 48, won: true, teamScore: 13, enemyScore: 7 }
        ]}
    ],
    Mestre40: [
        { title: 'COMPETITIVO TRAIN - 24/10/25', matches: [
            { map: 'Train', kills: 12, deaths: 16, assists: 3, hs: 66, won: true, teamScore: 13, enemyScore: 9 }
        ]},
        { title: 'Serie Antiga - TEAM HNRQ 2 X 1 TEAM MATEUS - 14/10/25', matches: [
            { map: 'Mirage', kills: 9, deaths: 25, assists: 5, hs: 55, won: false, teamScore: 13, enemyScore: 16 },
            { map: 'Overpass', kills: 16, deaths: 13, assists: 5, hs: 50, won: true, teamScore: 13, enemyScore: 7 },
            { map: 'Inferno', kills: 6, deaths: 15, assists: 3, hs: 33, won: false, teamScore: 3, enemyScore: 13 }
        ]},
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
        ]},
        { title: 'Serie 3 - TEAM MAD 2 X 1 TEAM MORENO - 16/10/25', matches: [
            { map: 'Mirage', kills: 6, deaths: 16, assists: 1, hs: 66, won: false, teamScore: 3, enemyScore: 13 },
            { map: 'Train', kills: 14, deaths: 16, assists: 6, hs: 78, won: true, teamScore: 13, enemyScore: 11 },
            { map: 'Overpass', kills: 13, deaths: 14, assists: 0, hs: 46, won: false, teamScore: 7, enemyScore: 13 },
        ]},
        { title: 'Serie 5 - Especial de Feriado - 18/10/25', matches: [
            { map: 'Train', kills: 19, deaths: 18, assists: 1, hs: 42, won: false, teamScore: 15, enemyScore: 15, isTie: true },
            { map: 'Inferno', kills: 7, deaths: 18, assists: 7, hs: 71, won: false, teamScore: 9, enemyScore: 13 }
        ]},
        { title: 'Série de 21/10 - Mix Abençoado - 21/10/25', matches: [
            { map: 'Nuke', kills: 8, deaths: 18, assists: 2, hs: 60, won: false, teamScore: 8, enemyScore: 13 },
            { map: 'Dust II', kills: 15, deaths: 15, assists: 3, hs: 83, won: false, teamScore: 3, enemyScore: 13 },
        ]},
        { title: "Série de 22/10 - Hiagod Destruidor - 22/10/25", matches: [
            { map: 'Mirage', kills: 19, deaths: 16, assists: 5, hs: 52, won: true, teamScore: 13, enemyScore: 9 },
            { map: 'Train', kills: 8, deaths: 18, assists: 4, hs: 62, won: false, teamScore: 6, enemyScore: 13 },
        ]},
        { title: "Série de 23/10 - Mix Mirage & Cache - 23/10/25", matches: [
            { map: 'Mirage', kills: 7, deaths: 16, assists: 2, hs: 50, won: false, teamScore: 5, enemyScore: 13 },
            { map: 'Cache', kills: 7, deaths: 17, assists: 6, hs: 71, won: false, teamScore: 6, enemyScore: 13 }
        ]}
    ],
    Pereira: [
        { title: 'COMPETITIVO TRAIN - 24/10/25', matches: [
            { map: 'Train', kills: 16, deaths: 17, assists: 1, hs: 18, won: false, teamScore: 9, enemyScore: 13 }
        ]},
        { title: 'Serie Antiga - TEAM HNRQ 2 X 1 TEAM MATEUS - 14/10/25', matches: [
            { map: 'Mirage', kills: 33, deaths: 16, assists: 4, hs: 33, won: true, teamScore: 16, enemyScore: 13 },
            { map: 'Overpass', kills: 15, deaths: 16, assists: 4, hs: 20, won: false, teamScore: 7, enemyScore: 13 },
            { map: 'Inferno', kills: 15, deaths: 6, assists: 3, hs: 40, won: true, teamScore: 13, enemyScore: 3 }
        ]},
         { title: 'TIME PEREIRA 8 X 13 TIME LUCAS - 05/10/25', matches: [
            { map: 'Overpass', kills: 21, deaths: 16, assists: 7, hs: 33, won: false, teamScore: 8, enemyScore: 13 },
        ]},
        { title: 'G12 ANINHOS 2 X 1 BIg FESTINHA - 13/10/25', matches: [
            { map: 'Train', kills: 15, deaths: 7, assists: 1, hs: 60, won: true, teamScore: 13, enemyScore: 3 },
        ]},
        { title: 'Serie 1 - TIM1 0 X 2 BAINheira - 15/10/25', matches: [
            { map: 'Mirage', kills: 18, deaths: 16, assists: 3, hs: 38, won: false, teamScore: 4, enemyScore: 13 },
            { map: 'Inferno', kills: 16, deaths: 14, assists: 1, hs: 37, won: false, teamScore: 4, enemyScore: 13 }
        ]},
        { title: 'Serie 2 - TIME HENRIQUE 1 X 1 TIME MIR - 15/10/25', matches: [
            { map: 'Dust II', kills: 22, deaths: 17, assists: 2, hs: 36, won: true, teamScore: 13, enemyScore: 11 },
            { map: 'Overpass', kills: 12, deaths: 15, assists: 3, hs: 50, won: false, teamScore: 9, enemyScore: 13 }
        ]},
        { title: 'Serie 3 - TEAM MAD 2 X 1 TEAM MORENO - 16/10/25', matches: [
            { map: 'Mirage', kills: 14, deaths: 9, assists: 3, hs: 71, won: true, teamScore: 13, enemyScore: 3 },
            { map: 'Train', kills: 23, deaths: 17, assists: 4, hs: 43, won: false, teamScore: 11, enemyScore: 13 },
            { map: 'Overpass', kills: 22, deaths: 11, assists: 4, hs: 31, won: true, teamScore: 13, enemyScore: 7 },
        ]},
        { title: 'Serie 4 - TEAM PEREIRA 1 X 0 TEAM MORENO - 17/10/25', matches: [
            { map: 'Mirage', kills: 33, deaths: 21, assists: 7, hs: 24, won: true, teamScore: 16, enemyScore: 14 }
        ]},
        { title: 'Serie 5 - Especial de Feriado - 18/10/25', matches: [
            { map: 'Train', kills: 29, deaths: 18, assists: 6, hs: 20, won: false, teamScore: 15, enemyScore: 15, isTie: true },
            { map: 'Inferno', kills: 22, deaths: 15, assists: 7, hs: 54, won: true, teamScore: 13, enemyScore: 9 }
        ]},
        { title: 'Série de 21/10 - Mix Abençoado - 21/10/25', matches: [
            { map: 'Nuke', kills: 21, deaths: 11, assists: 4, hs: 33, won: true, teamScore: 13, enemyScore: 8 },
            { map: 'Dust II', kills: 11, deaths: 8, assists: 9, hs: 45, won: true, teamScore: 13, enemyScore: 3 },
        ]},
        { title: "Série de 22/10 - Hiagod Destruidor - 22/10/25", matches: [
            { map: 'Mirage', kills: 17, deaths: 17, assists: 6, hs: 38, won: false, teamScore: 9, enemyScore: 13 },
            { map: 'Train', kills: 16, deaths: 11, assists: 4, hs: 41, won: true, teamScore: 13, enemyScore: 6 },
        ]},
        { title: "Série de 23/10 - Mix Mirage & Cache - 23/10/25", matches: [
             { map: 'Mirage', kills: 21, deaths: 8, assists: 2, hs: 28, won: true, teamScore: 13, enemyScore: 5 },
             { map: 'Cache', kills: 16, deaths: 10, assists: 2, hs: 30, won: true, teamScore: 13, enemyScore: 6 }
        ]}
    ],
    MIRZERA: [
        { title: 'COMPETITIVO TRAIN - 24/10/25', matches: [
            { map: 'Train', kills: 14, deaths: 16, assists: 7, hs: 35, won: false, teamScore: 9, enemyScore: 13 }
        ]},
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
        ]},
        { title: 'Serie 3 - TEAM MAD 2 X 1 TEAM MORENO - 16/10/25', matches: [
            { map: 'Mirage', kills: 13, deaths: 7, assists: 2, hs: 53, won: true, teamScore: 13, enemyScore: 3 },
            { map: 'Train', kills: 16, deaths: 18, assists: 5, hs: 37, won: false, teamScore: 11, enemyScore: 13 },
            { map: 'Overpass', kills: 17, deaths: 12, assists: 3, hs: 41, won: true, teamScore: 13, enemyScore: 7 },
        ]},
        { title: 'Serie 4 - TEAM PEREIRA 1 X 0 TEAM MORENO - 17/10/25', matches: [
            { map: 'Mirage', kills: 10, deaths: 22, assists: 4, hs: 60, won: false, teamScore: 14, enemyScore: 16 }
        ]},
        { title: 'Serie 5 - Especial de Feriado - 18/10/25', matches: [
            { map: 'Train', kills: 18, deaths: 18, assists: 5, hs: 18, won: false, teamScore: 15, enemyScore: 15, isTie: true },
            { map: 'Inferno', kills: 19, deaths: 16, assists: 3, hs: 21, won: false, teamScore: 9, enemyScore: 13 }
        ]},
        { title: 'Série de 21/10 - Mix Abençoado - 21/10/25', matches: [
            { map: 'Nuke', kills: 21, deaths: 17, assists: 2, hs: 42, won: false, teamScore: 8, enemyScore: 13 },
            { map: 'Dust II', kills: 9, deaths: 15, assists: 1, hs: 77, won: false, teamScore: 3, enemyScore: 13 },
        ]},
        { title: "Série de 23/10 - Mix Mirage & Cache - 23/10/25", matches: [
            { map: 'Mirage', kills: 7, deaths: 14, assists: 3, hs: 71, won: false, teamScore: 5, enemyScore: 13 },
            { map: 'Cache', kills: 16, deaths: 16, assists: 0, hs: 37, won: false, teamScore: 6, enemyScore: 13 }
        ]}
    ],
    oBruxo: [
        { title: 'Serie Antiga - TEAM HNRQ 2 X 1 TEAM MATEUS - 14/10/25', matches: [
            { map: 'Mirage', kills: 14, deaths: 23, assists: 3, hs: 42, won: true, teamScore: 16, enemyScore: 13 },
            { map: 'Overpass', kills: 4, deaths: 19, assists: 5, hs: 50, won: false, teamScore: 7, enemyScore: 13 },
            { map: 'Inferno', kills: 10, deaths: 10, assists: 4, hs: 10, won: true, teamScore: 13, enemyScore: 3 }
        ]},
        { title: 'TIME PEREIRA 8 X 13 TIME LUCAS - 05/10/25', matches: [
            { map: 'Overpass', kills: 10, deaths: 17, assists: 4, hs: 10, won: false, teamScore: 8, enemyScore: 13 },
        ]},
        { title: 'G12 ANINHOS 2 X 1 BIg FESTINHA - 13/10/25', matches: [
            { map: 'Train', kills: 4, deaths: 14, assists: 1, hs: 100, won: false, teamScore: 3, enemyScore: 13 },
            { map: 'Overpass', kills: 19, deaths: 16, assists: 4, hs: 32, won: true, teamScore: 13, enemyScore: 9 },
            { map: 'Mirage', kills: 12, deaths: 13, assists: 4, hs: 33, won: true, teamScore: 13, enemyScore: 5 },
        ]},
        { title: 'Serie 1 - TIM1 0 X 2 BAINheira - 15/10/25', matches: [
            { map: 'Mirage', kills: 4, deaths: 17, assists: 4, hs: 50, won: false, teamScore: 4, enemyScore: 13 },
            { map: 'Inferno', kills: 7, deaths: 16, assists: 5, hs: 42, won: false, teamScore: 4, enemyScore: 13 }
        ]},
        { title: 'Serie 2 - TIME HENRIQUE 1 X 1 TIME MIR - 15/10/25', matches: [
            { map: 'Dust II', kills: 8, deaths: 22, assists: 8, hs: 37, won: true, teamScore: 13, enemyScore: 11 },
            { map: 'Overpass', kills: 6, deaths: 18, assists: 5, hs: 50, won: false, teamScore: 9, enemyScore: 13 }
        ]},
        { title: 'Serie 4 - TEAM PEREIRA 1 X 0 TEAM MORENO - 17/10/25', matches: [
            { map: 'Mirage', kills: 9, deaths: 21, assists: 3, hs: 11, won: true, teamScore: 16, enemyScore: 14 }
        ]},
        { title: 'Serie 5 - Especial de Feriado - 18/10/25', matches: [
            { map: 'Train', kills: 13, deaths: 21, assists: 7, hs: 30, won: false, teamScore: 15, enemyScore: 15, isTie: true },
            { map: 'Inferno', kills: 14, deaths: 14, assists: 3, hs: 50, won: true, teamScore: 13, enemyScore: 9 }
        ]},
        { title: 'Série de 21/10 - Mix Abençoado - 21/10/25', matches: [
            { map: 'Nuke', kills: 7, deaths: 7, assists: 15, hs: 14, won: true, teamScore: 13, enemyScore: 8 },
            { map: 'Dust II', kills: 13, deaths: 10, assists: 1, hs: 23, won: true, teamScore: 13, enemyScore: 3 },
        ]},
        { title: "Série de 22/10 - Hiagod Destruidor - 22/10/25", matches: [
            { map: 'Mirage', kills: 12, deaths: 15, assists: 2, hs: 33, won: true, teamScore: 13, enemyScore: 9 },
            { map: 'Train', kills: 2, deaths: 19, assists: 2, hs: 50, won: false, teamScore: 6, enemyScore: 13 },
        ]},
        { title: "Série de 23/10 - Mix Mirage & Cache - 23/10/25", matches: [
            { map: 'Mirage', kills: 6, deaths: 16, assists: 4, hs: 83, won: false, teamScore: 5, enemyScore: 13 },
            { map: 'Cache', kills: 5, deaths: 16, assists: 5, hs: 40, won: false, teamScore: 6, enemyScore: 13 }
        ]}
    ],
    moreno: [
        { title: 'COMPETITIVO TRAIN - 24/10/25', matches: [
            { map: 'Train', kills: 19, deaths: 16, assists: 5, hs: 68, won: true, teamScore: 13, enemyScore: 9 }
        ]},
        { title: 'Serie Antiga - TEAM HNRQ 2 X 1 TEAM MATEUS - 14/10/25', matches: [
            { map: 'Mirage', kills: 21, deaths: 23, assists: 2, hs: 33, won: false, teamScore: 13, enemyScore: 16 },
            { map: 'Overpass', kills: 20, deaths: 14, assists: 3, hs: 50, won: true, teamScore: 13, enemyScore: 7 },
            { map: 'Inferno', kills: 14, deaths: 14, assists: 3, hs: 50, won: false, teamScore: 3, enemyScore: 13 }
        ]},
        { title: 'G12 ANINHOS 2 X 1 BIg FESTINHA - 13/10/25', matches: [
            { map: 'Train', kills: 21, deaths: 6, assists: 5, hs: 52, won: true, teamScore: 13, enemyScore: 3 },
            { map: 'Overpass', kills: 19, deaths: 18, assists: 5, hs: 37, won: false, teamScore: 9, enemyScore: 13 },
            { map: 'Mirage', kills: 14, deaths: 11, assists: 6, hs: 50, won: true, teamScore: 13, enemyScore: 5 },
        ]},
        { title: 'Serie 1 - TIM1 0 X 2 BAINheira - 15/10/25', matches: [
            { map: 'Mirage', kills: 18, deaths: 14, assists: 7, hs: 60, won: false, teamScore: 4, enemyScore: 13 },
            { map: 'Inferno', kills: 15, deaths: 17, assists: 2, hs: 60, won: false, teamScore: 4, enemyScore: 13 }
        ]},
        { title: 'Serie 2 - TIME HENRIQUE 1 X 1 TIME MIR - 15/10/25', matches: [
            { map: 'Dust II', kills: 33, deaths: 18, assists: 7, hs: 39, won: false, teamScore: 11, enemyScore: 13 },
            { map: 'Overpass', kills: 22, deaths: 15, assists: 2, hs: 68, won: true, teamScore: 13, enemyScore: 9 }
        ]},
        { title: 'Serie 3 - TEAM MAD 2 X 1 TEAM MORENO - 16/10/25', matches: [
            { map: 'Mirage', kills: 9, deaths: 16, assists: 0, hs: 66, won: false, teamScore: 3, enemyScore: 13 },
            { map: 'Train', kills: 28, deaths: 18, assists: 5, hs: 32, won: true, teamScore: 13, enemyScore: 11 },
            { map: 'Overpass', kills: 13, deaths: 18, assists: 4, hs: 38, won: false, teamScore: 7, enemyScore: 13 },
        ]},
        { title: 'Serie 4 - TEAM PEREIRA 1 X 0 TEAM MORENO - 17/10/25', matches: [
            { map: 'Mirage', kills: 32, deaths: 20, assists: 10, hs: 46, won: false, teamScore: 14, enemyScore: 16 }
        ]},
        { title: 'Serie 5 - Especial de Feriado - 18/10/25', matches: [
            { map: 'Train', kills: 28, deaths: 23, assists: 6, hs: 48, won: false, teamScore: 15, enemyScore: 15, isTie: true },
            { map: 'Inferno', kills: 11, deaths: 18, assists: 2, hs: 54, won: false, teamScore: 9, enemyScore: 13 }
        ]},
        { title: "Série de 22/10 - Hiagod Destruidor - 22/10/25", matches: [
            { map: 'Mirage', kills: 14, deaths: 16, assists: 3, hs: 48, won: true, teamScore: 13, enemyScore: 9 },
            { map: 'Train', kills: 18, deaths: 17, assists: 4, hs: 50, won: false, teamScore: 6, enemyScore: 13 },
        ]},
        { title: "Série de 23/10 - Mix Mirage & Cache - 23/10/25", matches: [
            { map: 'Mirage', kills: 14, deaths: 18, assists: 4, hs: 50, won: false, teamScore: 5, enemyScore: 13 },
            { map: 'Cache', kills: 15, deaths: 15, assists: 2, hs: 46, won: false, teamScore: 6, enemyScore: 13 }
        ]}
    ],
    RAFARINHA: [
        { title: 'COMPETITIVO TRAIN - 24/10/25', matches: [
            { map: 'Train', kills: 26, deaths: 16, assists: 5, hs: 61, won: true, teamScore: 13, enemyScore: 9 }
        ]},
        { title: 'Serie Antiga - TEAM HNRQ 2 X 1 TEAM MATEUS - 14/10/25', matches: [
            { map: 'Mirage', kills: 28, deaths: 23, assists: 3, hs: 57, won: false, teamScore: 13, enemyScore: 16 },
            { map: 'Overpass', kills: 21, deaths: 15, assists: 5, hs: 47, won: true, teamScore: 13, enemyScore: 7 },
            { map: 'Inferno', kills: 6, deaths: 15, assists: 1, hs: 33, won: false, teamScore: 3, enemyScore: 13 }
        ]},
        { title: 'TIME PEREIRA 8 X 13 TIME LUCAS - 05/10/25', matches: [
            { map: 'Overpass', kills: 18, deaths: 16, assists: 5, hs: 28, won: true, teamScore: 13, enemyScore: 8 },
        ]},
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
        ]},
        { title: 'Serie 3 - TEAM MAD 2 X 1 TEAM MORENO - 16/10/25', matches: [ // Played as 'Anão do Amassa'
            { map: 'Mirage', kills: 7, deaths: 16, assists: 3, hs: 42, won: false, teamScore: 3, enemyScore: 13 },
            { map: 'Train', kills: 19, deaths: 15, assists: 4, hs: 78, won: true, teamScore: 13, enemyScore: 11 },
            { map: 'Overpass', kills: 16, deaths: 15, assists: 5, hs: 37, won: false, teamScore: 7, enemyScore: 13 },
        ]},
        { title: 'Serie 4 - TEAM PEREIRA 1 X 0 TEAM MORENO - 17/10/25', matches: [
            { map: 'Mirage', kills: 30, deaths: 22, assists: 6, hs: 53, won: true, teamScore: 16, enemyScore: 14 }
        ]}
    ],
    HnRq: [
        { title: 'COMPETITIVO TRAIN - 24/10/25', matches: [
            { map: 'Train', kills: 20, deaths: 18, assists: 5, hs: 55, won: false, teamScore: 9, enemyScore: 13 }
        ]},
        { title: 'Serie Antiga - TEAM HNRQ 2 X 1 TEAM MATEUS - 14/10/25', matches: [
            { map: 'Mirage', kills: 38, deaths: 17, assists: 0, hs: 60, won: true, teamScore: 16, enemyScore: 13 },
            { map: 'Overpass', kills: 10, deaths: 13, assists: 3, hs: 60, won: false, teamScore: 7, enemyScore: 13 },
            { map: 'Inferno', kills: 18, deaths: 7, assists: 4, hs: 72, won: true, teamScore: 13, enemyScore: 3 }
        ]},
        { title: 'G12 ANINHOS 2 X 1 BIg FESTINHA - 13/10/25', matches: [
            { map: 'Train', kills: 12, deaths: 15, assists: 2, hs: 83, won: false, teamScore: 3, enemyScore: 13 },
            { map: 'Overpass', kills: 19, deaths: 14, assists: 5, hs: 53, won: true, teamScore: 13, enemyScore: 9 },
            { map: 'Mirage', kills: 18, deaths: 12, assists: 4, hs: 78, won: false, teamScore: 5, enemyScore: 13 },
        ]},
        { title: 'Serie 1 - TIM1 0 X 2 BAINheira - 15/10/25', matches: [
            { map: 'Mirage', kills: 7, deaths: 15, assists: 1, hs: 85, won: false, teamScore: 4, enemyScore: 13 },
            { map: 'Inferno', kills: 7, deaths: 14, assists: 3, hs: 85, won: false, teamScore: 4, enemyScore: 13 }
        ]},
        { title: 'Serie 2 - TIME HENRIQUE 1 X 1 TIME MIR - 15/10/25', matches: [
            { map: 'Dust II', kills: 16, deaths: 18, assists: 4, hs: 62, won: false, teamScore: 11, enemyScore: 13 },
            { map: 'Overpass', kills: 16, deaths: 12, assists: 2, hs: 68, won: true, teamScore: 13, enemyScore: 9 }
        ]},
        { title: 'Serie 4 - TEAM PEREIRA 1 X 0 TEAM MORENO - 17/10/25', matches: [
            { map: 'Mirage', kills: 23, deaths: 23, assists: 5, hs: 69, won: false, teamScore: 14, enemyScore: 16 }
        ]},
        { title: "Série de 23/10 - Mix Mirage & Cache - 23/10/25", matches: [
            { map: 'Mirage', kills: 8, deaths: 16, assists: 2, hs: 77, won: false, teamScore: 5, enemyScore: 13 },
            { map: 'Cache', kills: 11, deaths: 16, assists: 0, hs: 72, won: false, teamScore: 6, enemyScore: 13 }
        ]}
    ],
    Mateuus: [
        { title: 'COMPETITIVO TRAIN - 24/10/25', matches: [
            { map: 'Train', kills: 14, deaths: 19, assists: 8, hs: 42, won: false, teamScore: 9, enemyScore: 13 }
        ]},
        { title: 'Serie Antiga - TEAM HNRQ 2 X 1 TEAM MATEUS - 14/10/25', matches: [
            { map: 'Mirage', kills: 34, deaths: 20, assists: 3, hs: 38, won: false, teamScore: 13, enemyScore: 16 },
            { map: 'Overpass', kills: 13, deaths: 10, assists: 7, hs: 23, won: true, teamScore: 13, enemyScore: 7 },
            { map: 'Inferno', kills: 7, deaths: 14, assists: 5, hs: 100, won: false, teamScore: 3, enemyScore: 13 }
        ]},
         { title: 'TIME PEREIRA 8 X 13 TIME LUCAS - 05/10/25', matches: [
            { map: 'Overpass', kills: 17, deaths: 16, assists: 3, hs: 53, won: true, teamScore: 13, enemyScore: 8 },
        ]},
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
        ]},
        { title: 'Serie 3 - TEAM MAD 2 X 1 TEAM MORENO - 16/10/25', matches: [
            { map: 'Mirage', kills: 22, deaths: 10, assists: 3, hs: 59, won: true, teamScore: 13, enemyScore: 3 },
            { map: 'Train', kills: 16, deaths: 21, assists: 4, hs: 62, won: false, teamScore: 11, enemyScore: 13 },
            { map: 'Overpass', kills: 12, deaths: 16, assists: 8, hs: 66, won: true, teamScore: 13, enemyScore: 7 },
        ]},
        { title: 'Serie 4 - TEAM PEREIRA 1 X 0 TEAM MORENO - 17/10/25', matches: [
            { map: 'Mirage', kills: 25, deaths: 24, assists: 3, hs: 44, won: false, teamScore: 14, enemyScore: 16 }
        ]},
        { title: 'Série de 21/10 - Mix Abençoado - 21/10/25', matches: [
            { map: 'Nuke', kills: 25, deaths: 17, assists: 4, hs: 48, won: true, teamScore: 13, enemyScore: 8 },
            { map: 'Dust II', kills: 14, deaths: 9, assists: 4, hs: 64, won: true, teamScore: 13, enemyScore: 3 },
        ]},
        { title: "Série de 22/10 - Hiagod Destruidor - 22/10/25", matches: [
            { map: 'Mirage', kills: 22, deaths: 13, assists: 8, hs: 45, won: true, teamScore: 13, enemyScore: 9 },
            { map: 'Train', kills: 12, deaths: 16, assists: 2, hs: 66, won: false, teamScore: 6, enemyScore: 13 },
        ]}
    ],
    heroo: [
        { title: 'Serie Antiga - TEAM HNRQ 2 X 1 TEAM MATEUS - 14/10/25', matches: [
            { map: 'Mirage', kills: 10, deaths: 22, assists: 2, hs: 40, won: true, teamScore: 16, enemyScore: 13 },
            { map: 'Overpass', kills: 17, deaths: 17, assists: 3, hs: 52, won: false, teamScore: 7, enemyScore: 13 },
            { map: 'Inferno', kills: 9, deaths: 7, assists: 1, hs: 77, won: true, teamScore: 13, enemyScore: 3 }
        ]},
        { title: 'G12 ANINHOS 2 X 1 BIg FESTINHA - 13/10/25', matches: [
            { map: 'Train', kills: 12, deaths: 9, assists: 2, hs: 67, won: true, teamScore: 13, enemyScore: 3 },
            { map: 'Overpass', kills: 8, deaths: 19, assists: 2, hs: 63, won: false, teamScore: 9, enemyScore: 13 },
            { map: 'Mirage', kills: 9, deaths: 15, assists: 5, hs: 56, won: false, teamScore: 5, enemyScore: 13 },
        ]},
        { title: 'Serie 1 - TIM1 0 X 2 BAINheira - 15/10/25', matches: [
            { map: 'Mirage', kills: 6, deaths: 17, assists: 2, hs: 66, won: false, teamScore: 4, enemyScore: 13 },
            { map: 'Inferno', kills: 5, deaths: 16, assists: 3, hs: 0, won: false, teamScore: 4, enemyScore: 13 }
        ]},
        { title: 'Serie 2 - TIME HENRIQUE 1 X 1 TIME MIR - 15/10/25', matches: [
            { map: 'Dust II', kills: 8, deaths: 18, assists: 4, hs: 50, won: false, teamScore: 11, enemyScore: 13 },
            { map: 'Overpass', kills: 13, deaths: 14, assists: 3, hs: 53, won: true, teamScore: 13, enemyScore: 9 }
        ]},
        { title: 'Serie 3 - TEAM MAD 2 X 1 TEAM MORENO - 16/10/25', matches: [
            { map: 'Mirage', kills: 3, deaths: 10, assists: 5, hs: 100, won: true, teamScore: 13, enemyScore: 3 },
            { map: 'Train', kills: 10, deaths: 17, assists: 6, hs: 60, won: false, teamScore: 11, enemyScore: 13 },
            { map: 'Overpass', kills: 5, deaths: 13, assists: 1, hs: 40, won: true, teamScore: 13, enemyScore: 7 },
        ]}
    ],
    Pedrones: [
         { title: 'G12 ANINHOS 2 X 1 BIg FESTINHA - 13/10/25', matches: [
            { map: 'Overpass', kills: 18, deaths: 16, assists: 3, hs: 61, won: false, teamScore: 9, enemyScore: 13 },
            { map: 'Mirage', kills: 24, deaths: 11, assists: 4, hs: 58, won: true, teamScore: 13, enemyScore: 5 },
        ]}
    ],
    Lucas: [
        { title: 'TIME PEREIRA 8 X 13 TIME LUCAS - 05/10/25', matches: [
            { map: 'Overpass', kills: 18, deaths: 15, assists: 7, hs: 56, won: true, teamScore: 13, enemyScore: 8 },
        ]},
        { title: 'G12 ANINHOS 2 X 1 BIg FESTINHA - 13/10/25', matches: [
            { map: 'Train', kills: 15, deaths: 13, assists: 2, hs: 47, won: false, teamScore: 3, enemyScore: 13 },
            { map: 'Overpass', kills: 16, deaths: 19, assists: 5, hs: 56, won: true, teamScore: 13, enemyScore: 9 },
            { map: 'Mirage', kills: 12, deaths: 16, assists: 8, hs: 75, won: false, teamScore: 5, enemyScore: 13 },
        ]},
        { title: 'Serie 4 - TEAM PEREIRA 1 X 0 TEAM MORENO - 17/10/25', matches: [
            { map: 'Mirage', kills: 27, deaths: 19, assists: 3, hs: 44, won: true, teamScore: 16, enemyScore: 14 }
        ]},
        { title: 'Serie 5 - Especial de Feriado - 18/10/25', matches: [
            { map: 'Train', kills: 22, deaths: 23, assists: 2, hs: 54, won: false, teamScore: 15, enemyScore: 15, isTie: true },
            { map: 'Inferno', kills: 27, deaths: 16, assists: 3, hs: 62, won: true, teamScore: 13, enemyScore: 9 }
        ]},
        { title: "Série de 22/10 - Hiagod Destruidor - 22/10/25", matches: [
            { map: 'Mirage', kills: 11, deaths: 18, assists: 4, hs: 63, won: true, teamScore: 13, enemyScore: 9 },
            { map: 'Train', kills: 10, deaths: 16, assists: 3, hs: 60, won: false, teamScore: 6, enemyScore: 13 },
        ]},
        { title: "Série de 23/10 - Mix Mirage & Cache - 23/10/25", matches: [
            { map: 'Mirage', kills: 7, deaths: 10, assists: 3, hs: 42, won: true, teamScore: 13, enemyScore: 5 },
            { map: 'Cache', kills: 8, deaths: 12, assists: 6, hs: 25, won: true, teamScore: 13, enemyScore: 6 }
        ]}
    ],
    vice: [
        { title: 'G12 ANINHOS 2 X 1 BIg FESTINHA - 13/10/25', matches: [
             { map: 'Mirage', kills: 16, deaths: 14, assists: 9, hs: 75, won: true, teamScore: 13, enemyScore: 5 },
        ]}
    ],
    Bernabe: [
        { title: 'Serie Antiga - TEAM HNRQ 2 X 1 TEAM MATEUS - 14/10/25', matches: [
            { map: 'Mirage', kills: 8, deaths: 22, assists: 1, hs: 12, won: false, teamScore: 13, enemyScore: 16 },
            { map: 'Overpass', kills: 11, deaths: 13, assists: 5, hs: 18, won: true, teamScore: 13, enemyScore: 7 },
            { map: 'Inferno', kills: 6, deaths: 14, assists: 1, hs: 33, won: false, teamScore: 3, enemyScore: 13 }
        ]},
         { title: 'G12 ANINHOS 2 X 1 BIg FESTINHA - 13/10/25', matches: [
            { map: 'Train', kills: 2, deaths: 14, assists: 2, hs: 50, won: false, teamScore: 3, enemyScore: 13 },
            { map: 'Overpass', kills: 17, deaths: 15, assists: 8, hs: 29, won: true, teamScore: 13, enemyScore: 9 },
            { map: 'Mirage', kills: 3, deaths: 14, assists: 1, hs: 67, won: false, teamScore: 5, enemyScore: 13 },
        ]},
        { title: 'Serie 3 - TEAM MAD 2 X 1 TEAM MORENO - 16/10/25', matches: [
            { map: 'Mirage', kills: 6, deaths: 15, assists: 2, hs: 66, won: false, teamScore: 3, enemyScore: 13 },
            { map: 'Train', kills: 12, deaths: 17, assists: 5, hs: 50, won: true, teamScore: 13, enemyScore: 11 },
            { map: 'Overpass', kills: 5, deaths: 18, assists: 1, hs: 80, won: false, teamScore: 7, enemyScore: 13 },
        ]}
    ],
    VDD: [
        { title: 'Serie Antiga - TEAM HNRQ 2 X 1 TEAM MATEUS - 14/10/25', matches: [
            { map: 'Mirage', kills: 17, deaths: 22, assists: 8, hs: 17, won: true, teamScore: 16, enemyScore: 13 },
            { map: 'Overpass', kills: 19, deaths: 16, assists: 2, hs: 21, won: false, teamScore: 7, enemyScore: 13 },
            { map: 'Inferno', kills: 18, deaths: 9, assists: 10, hs: 33, won: true, teamScore: 13, enemyScore: 3 }
        ]},
        { title: 'TIME PEREIRA 8 X 13 TIME LUCAS - 05/10/25', matches: [
            { map: 'Overpass', kills: 18, deaths: 16, assists: 5, hs: 28, won: true, teamScore: 13, enemyScore: 8 },
        ]},
        { title: 'Serie 5 - Especial de Feriado - 18/10/25', matches: [
            { map: 'Train', kills: 19, deaths: 23, assists: 6, hs: 42, won: false, teamScore: 15, enemyScore: 15, isTie: true },
            { map: 'Inferno', kills: 9, deaths: 15, assists: 7, hs: 11, won: true, teamScore: 13, enemyScore: 9 }
        ]},
        { title: 'Série de 21/10 - Mix Abençoado - 21/10/25', matches: [
            { map: 'Nuke', kills: 15, deaths: 13, assists: 4, hs: 73, won: false, teamScore: 8, enemyScore: 13 },
            { map: 'Dust II', kills: 7, deaths: 14, assists: 1, hs: 57, won: false, teamScore: 3, enemyScore: 13 },
        ]},
        { title: "Série de 23/10 - Mix Mirage & Cache - 23/10/25", matches: [
            { map: 'Mirage', kills: 19, deaths: 8, assists: 4, hs: 47, won: true, teamScore: 13, enemyScore: 5 },
            { map: 'Cache', kills: 23, deaths: 10, assists: 6, hs: 30, won: true, teamScore: 13, enemyScore: 6 }
        ]}
    ],
    Hiagod: [
         { title: 'TIME PEREIRA 8 X 13 TIME LUCAS - 05/10/25', matches: [
            { map: 'Overpass', kills: 17, deaths: 15, assists: 6, hs: 65, won: false, teamScore: 8, enemyScore: 13 },
        ]},
        { title: "Série de 22/10 - Hiagod Destruidor - 22/10/25", matches: [
            { map: 'Mirage', kills: 25, deaths: 15, assists: 5, hs: 44, won: false, teamScore: 9, enemyScore: 13 },
            { map: 'Train', kills: 30, deaths: 8, assists: 4, hs: 46, won: true, teamScore: 13, enemyScore: 6 },
        ]}
    ],
    "Ratão": [
         { title: 'TIME PEREIRA 8 X 13 TIME LUCAS - 05/10/25', matches: [
            { map: 'Overpass', kills: 9, deaths: 14, assists: 2, hs: 56, won: true, teamScore: 13, enemyScore: 8 },
        ]},
        { title: "Série de 22/10 - Hiagod Destruidor - 22/10/25", matches: [
            { map: 'Mirage', kills: 10, deaths: 16, assists: 1, hs: 35, won: false, teamScore: 9, enemyScore: 13 },
            { map: 'Train', kills: 17, deaths: 13, assists: 4, hs: 31, won: true, teamScore: 13, enemyScore: 6 },
        ]}
    ],
    a1: [
         { title: 'TIME PEREIRA 8 X 13 TIME LUCAS - 05/10/25', matches: [
            { map: 'Overpass', kills: 15, deaths: 16, assists: 2, hs: 57, won: false, teamScore: 8, enemyScore: 13 },
        ]},
        { title: 'Série de 21/10 - Mix Abençoado - 21/10/25', matches: [
            { map: 'Nuke', kills: 16, deaths: 16, assists: 2, hs: 68, won: true, teamScore: 13, enemyScore: 8 },
            { map: 'Dust II', kills: 16, deaths: 8, assists: 11, hs: 75, won: true, teamScore: 13, enemyScore: 3 },
        ]}
    ],
    "ROB erio": [
         { title: 'TIME PEREIRA 8 X 13 TIME LUCAS - 05/10/25', matches: [
            { map: 'Overpass', kills: 14, deaths: 16, assists: 7, hs: 57, won: false, teamScore: 8, enemyScore: 13 },
        ]},
        { title: 'Serie 4 - TEAM PEREIRA 1 X 0 TEAM MORENO - 17/10/25', matches: [
            { map: 'Mirage', kills: 13, deaths: 19, assists: 5, hs: 30, won: true, teamScore: 16, enemyScore: 14 }
        ]},
        { title: 'Serie 5 - Especial de Feriado - 18/10/25', matches: [
            { map: 'Train', kills: 19, deaths: 21, assists: 8, hs: 63, won: false, teamScore: 15, enemyScore: 15, isTie: true },
            { map: 'Inferno', kills: 16, deaths: 18, assists: 6, hs: 62, won: false, teamScore: 9, enemyScore: 13 }
        ]},
        { title: 'Série de 21/10 - Mix Abençoado - 21/10/25', matches: [
            { map: 'Nuke', kills: 14, deaths: 4, assists: 10, hs: 71, won: true, teamScore: 13, enemyScore: 8 },
            { map: 'Dust II', kills: 20, deaths: 6, assists: 2, hs: 65, won: true, teamScore: 13, enemyScore: 3 },
        ]}
    ],
    Pimentel: [
         { title: 'Serie 3 - TEAM MAD 2 X 1 TEAM MORENO - 16/10/25', matches: [
            { map: 'Mirage', kills: 14, deaths: 14, assists: 3, hs: 28, won: false, teamScore: 3, enemyScore: 13 },
            { map: 'Train', kills: 12, deaths: 22, assists: 7, hs: 50, won: true, teamScore: 13, enemyScore: 11 },
            { map: 'Overpass', kills: 12, deaths: 16, assists: 7, hs: 41, won: false, teamScore: 7, enemyScore: 13 },
        ]}
    ],
    BTR: [
        { title: 'Serie 4 - TEAM PEREIRA 1 X 0 TEAM MORENO - 17/10/25', matches: [
            { map: 'Mirage', kills: 10, deaths: 24, assists: 6, hs: 60, won: false, teamScore: 14, enemyScore: 16 }
        ]}
    ],
    luquinhas: [
        { title: 'Serie 5 - Especial de Feriado - 18/10/25', matches: [
            { map: 'Train', kills: 19, deaths: 22, assists: 9, hs: 73, won: false, teamScore: 15, enemyScore: 15, isTie: true },
            { map: 'Inferno', kills: 21, deaths: 20, assists: 8, hs: 47, won: false, teamScore: 9, enemyScore: 13 }
        ]},
        { title: 'Série de 21/10 - Mix Abençoado - 21/10/25', matches: [
            { map: 'Nuke', kills: 14, deaths: 19, assists: 7, hs: 71, won: false, teamScore: 8, enemyScore: 13 },
            { map: 'Dust II', kills: 6, deaths: 16, assists: 5, hs: 83, won: false, teamScore: 3, enemyScore: 13 },
        ]}
    ],
    Edu: [
        { title: 'Serie 5 - Especial de Feriado - 18/10/25', matches: [
            { map: 'Train', kills: 19, deaths: 20, assists: 2, hs: 52, won: false, teamScore: 15, enemyScore: 15, isTie: true },
            { map: 'Inferno', kills: 14, deaths: 14, assists: 8, hs: 54, won: true, teamScore: 13, enemyScore: 9 }
        ]},
        { title: 'Série de 21/10 - Mix Abençoado - 21/10/25', matches: [
            { map: 'Nuke', kills: 11, deaths: 16, assists: 5, hs: 54, won: false, teamScore: 8, enemyScore: 13 },
            { map: 'Dust II', kills: 13, deaths: 14, assists: 1, hs: 46, won: false, teamScore: 3, enemyScore: 13 },
        ]}
    ],
    zkzin: [
        { title: "Série de 22/10 - Hiagod Destruidor - 22/10/25", matches: [
            { map: 'Mirage', kills: 14, deaths: 17, assists: 8, hs: 50, won: false, teamScore: 9, enemyScore: 13 },
            { map: 'Train', kills: 10, deaths: 10, assists: 6, hs: 30, won: true, teamScore: 13, enemyScore: 6 },
        ]},
        { title: "Série de 23/10 - Mix Mirage & Cache - 23/10/25", matches: [
            { map: 'Mirage', kills: 16, deaths: 8, assists: 8, hs: 37, won: true, teamScore: 13, enemyScore: 5 },
            { map: 'Cache', kills: 20, deaths: 11, assists: 9, hs: 40, won: true, teamScore: 13, enemyScore: 6 }
        ]}
    ],
    Chico: [
        { title: "Série de 22/10 - Hiagod Destruidor - 22/10/25", matches: [
            { map: 'Mirage', kills: 12, deaths: 15, assists: 8, hs: 45, won: false, teamScore: 9, enemyScore: 13 },
            { map: 'Train', kills: 11, deaths: 11, assists: 8, hs: 64, won: true, teamScore: 13, enemyScore: 6 },
        ]},
        { title: "Série de 23/10 - Mix Mirage & Cache - 23/10/25", matches: [
            { map: 'Mirage', kills: 14, deaths: 9, assists: 5, hs: 35, won: true, teamScore: 13, enemyScore: 5 }
        ]}
    ],
    Vitorin: [
        { title: 'COMPETITIVO TRAIN - 24/10/25', matches: [
            { map: 'Train', kills: 11, deaths: 15, assists: 4, hs: 27, won: true, teamScore: 13, enemyScore: 9 }
        ]}
    ],
    ccc: [
        { title: 'COMPETITIVO TRAIN - 24/10/25', matches: [
            { map: 'Train', kills: 18, deaths: 17, assists: 6, hs: 50, won: true, teamScore: 13, enemyScore: 9 }
        ]}
    ],
    revolteD: [
        { title: 'COMPETITIVO TRAIN - 24/10/25', matches: [
            { map: 'Train', kills: 13, deaths: 16, assists: 5, hs: 30, won: false, teamScore: 9, enemyScore: 13 }
        ]}
    ]
};

export const PLAYERS_DATA: Player[] = [
    createPlayerFromSeriesHistory({ id: 4, name: "Mad", photoUrl: `https://i.imgur.com/1VvakVK.png`, team: "Time A", overall: 92 }, playersRawData.Mad),
    createPlayerFromSeriesHistory({ id: 2, name: "Mestre40", photoUrl: `https://i.imgur.com/q3w7MPO.png`, team: "Time A", overall: 71 }, playersRawData.Mestre40),
    createPlayerFromSeriesHistory({ id: 1, name: "Pereira", photoUrl: `https://i.imgur.com/a1Peapx.png`, team: "Time A", overall: 94 }, playersRawData.Pereira),
    createPlayerFromSeriesHistory({ id: 3, name: "MIRZERA", photoUrl: `https://i.imgur.com/Pi935ZY.png`, team: "Time A", overall: 82 }, playersRawData.MIRZERA),
    createPlayerFromSeriesHistory({ id: 5, name: "oBruxo", photoUrl: `https://i.imgur.com/tWnZ7hw.png`, team: "Time A", overall: 66 }, playersRawData.oBruxo),
    createPlayerFromSeriesHistory({ id: 6, name: "moreno", photoUrl: `https://i.imgur.com/aCyjHMk.png`, team: "Time B", overall: 87 }, playersRawData.moreno),
    createPlayerFromSeriesHistory({ id: 7, name: "RAFARINHA", photoUrl: `https://i.imgur.com/8A4gjDE.png`, team: "Time B", overall: 92 }, playersRawData.RAFARINHA),
    createPlayerFromSeriesHistory({ id: 8, name: "HnRq", photoUrl: `https://i.imgur.com/toZ71Ty.png`, team: "Time B", overall: 82 }, playersRawData.HnRq),
    createPlayerFromSeriesHistory({ id: 9, name: "Mateuus", photoUrl: `https://i.imgur.com/Bzbl7Al.png`, team: "Time B", overall: 86 }, playersRawData.Mateuus),
    createPlayerFromSeriesHistory({ id: 10, name: "heroo", photoUrl: `https://i.imgur.com/UMzPIGi.png`, team: "Time B", overall: 66 }, playersRawData.heroo),
    createPlayerFromSeriesHistory({ id: 12, name: "Pedrones", photoUrl: `https://i.imgur.com/JotZTU7.png`, team: "Time B", overall: 91, status: 'banned' }, playersRawData.Pedrones),
    createPlayerFromSeriesHistory({ id: 13, name: "Lucas", photoUrl: `https://i.imgur.com/xE5pMH6.png`, team: "Time A", overall: 82 }, playersRawData.Lucas),
    createPlayerFromSeriesHistory({ id: 14, name: "vice", photoUrl: `https://i.imgur.com/yxwreiV.png`, team: "Time B", overall: 81 }, playersRawData.vice),
    createPlayerFromSeriesHistory({ id: 15, name: "Bernabe", photoUrl: `https://i.imgur.com/H2ahLwW.png`, team: "Time A", overall: 63 }, playersRawData.Bernabe),
    // Regular Players
    createPlayerFromSeriesHistory({ id: 17, name: "VDD", photoUrl: `https://i.imgur.com/c3eN5qe.png`, team: "Time C", overall: 84 }, playersRawData.VDD),
    createPlayerFromSeriesHistory({ id: 18, name: "Hiagod", photoUrl: `https://i.imgur.com/ZarH4ch.png`, team: "Time C", overall: 85 }, playersRawData.Hiagod),
    createPlayerFromSeriesHistory({ id: 19, name: "Ratão", photoUrl: `https://i.imgur.com/Vag7gaK.png`, team: "Time C", overall: 76 }, playersRawData["Ratão"]),
    createPlayerFromSeriesHistory({ id: 21, name: "ROB erio", photoUrl: `https://i.imgur.com/t4ThjAm.png`, team: "Time D", overall: 81, status: 'active' }, playersRawData["ROB erio"]),
    createPlayerFromSeriesHistory({ id: 23, name: "Pimentel", photoUrl: `https://i.imgur.com/pgl60w5.png`, team: "Time C", overall: 74 }, playersRawData.Pimentel),
    createPlayerFromSeriesHistory({ id: 24, name: "BTR", photoUrl: 'https://i.imgur.com/Vb1r7V1.png', team: "Time C", overall: 69 }, playersRawData.BTR),
    createPlayerFromSeriesHistory({ id: 25, name: "luquinhas", photoUrl: 'https://i.imgur.com/gLlXqy9.png', team: "Time D", overall: 80 }, playersRawData.luquinhas),
    createPlayerFromSeriesHistory({ id: 26, name: "Edu", photoUrl: 'https://i.imgur.com/5Prc40h.png', team: "Time D", overall: 79 }, playersRawData.Edu),
    createPlayerFromSeriesHistory({ id: 20, name: "a1", photoUrl: `https://i.imgur.com/eanbEVn.png`, team: "Time D", overall: 79, status: 'active' }, playersRawData.a1),
    createPlayerFromSeriesHistory({ id: 27, name: "zkzin", photoUrl: 'https://i.imgur.com/TBy0Xp4.png', team: "Time D", overall: 85, status: 'active' }, playersRawData.zkzin),
    createPlayerFromSeriesHistory({ id: 28, name: "Chico", photoUrl: 'https://i.imgur.com/X2CVoEO.png', team: "Time D", overall: 84, status: 'active' }, playersRawData.Chico),
    // New players from 24/10 match
    createPlayerFromSeriesHistory({ id: 29, name: "Vitorin", photoUrl: `https://i.imgur.com/lA2zzNl.png`, team: "Time E", overall: 75, status: 'active' }, playersRawData.Vitorin),
    createPlayerFromSeriesHistory({ id: 30, name: "ccc", photoUrl: `https://i.imgur.com/L8EM5gE.png`, team: "Time E", overall: 75, status: 'stand-in' }, playersRawData.ccc),
    createPlayerFromSeriesHistory({ id: 31, name: "revolteD", photoUrl: `https://i.imgur.com/uGZmZ1j.png`, team: "Time E", overall: 75, status: 'stand-in' }, playersRawData.revolteD),
].sort((a, b) => (a.status === 'banned' ? 1 : -1) - (b.status === 'banned' ? 1 : -1) || b.price - a.price);

// Fix: Export MAP_POOL for use in other components.
export const MAP_POOL = ['Mirage', 'Ancient', 'Dust II', 'Overpass', 'Nuke', 'Inferno', 'Train', 'Cache'];

export const MAP_IMAGES: { [key: string]: string } = {
    'Mirage': 'https://static.wikia.nocookie.net/cswikia/images/9/96/Set_mirage.png/revision/latest/scale-to-width-down/1000?cb=20230901185633',
    'Overpass': 'https://static.wikia.nocookie.net/cswikia/images/d/d9/Set_overpass.png/revision/latest?cb=20210928184321',
    'Nuke': 'https://static.wikia.nocookie.net/cswikia/images/e/ef/Set_nuke_2.png/revision/latest/scale-to-width-down/1000?cb=20230901185652',
    'Inferno': 'https://static.wikia.nocookie.net/cswikia/images/9/99/Set_inferno_2.png/revision/latest?cb=20211022202818',
    'Ancient': 'https://static.wikia.nocookie.net/cswikia/images/7/7c/Map_icon_de_ancient.png/revision/latest/scale-to-width-down/1000?cb=20230901185140',
    'Train': 'https://static.wikia.nocookie.net/cswikia/images/d/d3/CS2_Train_logo.png/revision/latest?cb=20241114093558',
    'Dust II': 'https://static.wikia.nocookie.net/cswikia/images/d/db/Map_icon_de_dust2.png/revision/latest?cb=20230901185539',
    'Cache': 'https://static.wikia.nocookie.net/cswikia/images/5/53/Cs2_cache_logo.png/revision/latest?cb=20241029094055'
};

export const SIDE_LOGOS = {
    CT: 'https://static.wikia.nocookie.net/cswikia/images/b/ba/Ct-patch-small.png/revision/latest?cb=20220130164507',
    TR: 'https://static.wikia.nocookie.net/cswikia/images/e/e0/Icon-t-patch-small.png/revision/latest?cb=20220130164538'
};