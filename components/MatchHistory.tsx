import React, { useMemo, useState } from 'react';
import { PLAYERS_DATA } from '../constants';
import { HistorySeries, MatchPlayerPerformance } from '../types';
import ChevronDownIcon from './icons/ChevronDownIcon';

const PlayerStatsTable: React.FC<{ players: MatchPlayerPerformance[] }> = ({ players }) => (
    <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
            <thead className="bg-gray-700/50 text-xs text-gray-400 uppercase">
                <tr>
                    <th className="px-4 py-2">Jogador</th>
                    <th className="px-4 py-2 text-center">K</th>
                    <th className="px-4 py-2 text-center">D</th>
                    <th className="px-4 py-2 text-center">A</th>
                    <th className="px-4 py-2 text-right">Pontos</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
                {players.map(player => (
                    <tr key={player.playerName}>
                        <td className="px-4 py-2 whitespace-nowrap">
                            <div className="flex items-center">
                                <img src={player.photoUrl} alt={player.playerName} className="w-8 h-8 rounded-full object-cover mr-3" />
                                <span className="font-medium">{player.playerName}</span>
                            </div>
                        </td>
                        <td className="px-4 py-2 text-center">{player.kills}</td>
                        <td className="px-4 py-2 text-center">{player.deaths}</td>
                        <td className="px-4 py-2 text-center">{player.assists}</td>
                        <td className="px-4 py-2 text-right font-bold text-orange-400">{player.points.toFixed(2)}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);


const MatchHistory: React.FC = () => {
    const [expandedSeriesTitle, setExpandedSeriesTitle] = useState<string | null>(null);

    const processedHistory = useMemo((): HistorySeries[] => {
        const seriesMap = new Map<string, HistorySeries>();

        for (const player of PLAYERS_DATA) {
            for (const series of player.seriesHistory) {
                if (!seriesMap.has(series.title)) {
                     const uniqueMatches = new Map();
                     series.matches.forEach(m => {
                         // Use a key that uniquely identifies a match within a series title
                         const matchKey = `${m.map}-${Math.max(m.team1Score, m.team2Score)}-${Math.min(m.team1Score, m.team2Score)}`;
                         if (!uniqueMatches.has(matchKey)) {
                             uniqueMatches.set(matchKey, {
                                 id: m.id,
                                 map: m.map,
                                 winningScore: Math.max(m.team1Score, m.team2Score),
                                 losingScore: Math.min(m.team1Score, m.team2Score),
                                 winningTeamPlayers: [],
                                 losingTeamPlayers: [],
                             });
                         }
                     });

                    seriesMap.set(series.title, {
                        title: series.title,
                        matches: Array.from(uniqueMatches.values()),
                    });
                }

                const historySeries = seriesMap.get(series.title)!;

                for (const match of series.matches) {
                    const winningScore = Math.max(match.team1Score, match.team2Score);
                    const losingScore = Math.min(match.team1Score, match.team2Score);
                    const historyMatch = historySeries.matches.find(hm => hm.map === match.map && hm.winningScore === winningScore && hm.losingScore === losingScore);

                    if (historyMatch) {
                        const performanceData = {
                            playerName: player.name,
                            photoUrl: player.photoUrl,
                            kills: match.kills,
                            deaths: match.deaths,
                            assists: match.assists,
                            points: match.points,
                        };
                        
                        if (match.won) {
                            historyMatch.winningTeamPlayers.push(performanceData);
                        } else {
                            historyMatch.losingTeamPlayers.push(performanceData);
                        }

                        // Sort after every push might be inefficient but ensures order
                        historyMatch.winningTeamPlayers.sort((a, b) => b.points - a.points);
                        historyMatch.losingTeamPlayers.sort((a, b) => b.points - a.points);
                    }
                }
            }
        }
        
        const result = Array.from(seriesMap.values());

        result.sort((a, b) => {
            const dateAStr = a.title.split(' - ').pop()?.trim();
            const dateBStr = b.title.split(' - ').pop()?.trim();
            if (!dateAStr || !dateBStr) return 0;
            const [dayA, monthA, yearA] = dateAStr.split('/');
            const [dayB, monthB, yearB] = dateBStr.split('/');
            const dateA = `20${yearA}${monthA}${dayA}`;
            const dateB = `20${yearB}${monthB}${dayB}`;
            return dateB.localeCompare(dateA);
        });

        return result;
    }, []);

    const toggleSeries = (title: string) => {
        setExpandedSeriesTitle(prevTitle => (prevTitle === title ? null : title));
    };

    return (
        <main>
            <h2 className="text-2xl font-bold text-gray-300 mb-6">Histórico de Partidas</h2>
            <div className="space-y-4">
                {processedHistory.map(series => (
                    <div key={series.title} className="bg-gray-800/70 rounded-lg overflow-hidden transition-all duration-300">
                        <div
                            className="flex justify-between items-center p-4 cursor-pointer hover:bg-gray-800"
                            onClick={() => toggleSeries(series.title)}
                        >
                            <h3 className="font-bold text-lg text-orange-400 tracking-wide">{series.title}</h3>
                            <ChevronDownIcon className={`w-5 h-5 transition-transform duration-300 ${expandedSeriesTitle === series.title ? 'rotate-180' : ''}`} />
                        </div>
                        
                        {expandedSeriesTitle === series.title && (
                            <div className="p-4 bg-black/20 space-y-6">
                                {series.matches.map(match => (
                                    <div key={`${series.title}-${match.map}`} className="bg-gray-800 rounded-lg p-4">
                                        <div className="flex justify-between items-center mb-4">
                                            <p className="font-bold text-lg">{match.map}</p>
                                            <p className="font-bold text-2xl">
                                                <span className="text-green-400">{match.winningScore}</span>
                                                <span className="text-gray-500 mx-2">vs</span>
                                                <span className="text-red-400">{match.losingScore}</span>
                                            </p>
                                        </div>
                                        
                                        <div className="space-y-4">
                                            <div>
                                                <h4 className="text-md font-semibold text-green-400 mb-2">Vencedores</h4>
                                                <PlayerStatsTable players={match.winningTeamPlayers} />
                                            </div>
                                            <div>
                                                <h4 className="text-md font-semibold text-red-400 mb-2">Perdedores</h4>
                                                <PlayerStatsTable players={match.losingTeamPlayers} />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </main>
    );
};

export default MatchHistory;