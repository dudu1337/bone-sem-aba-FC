import React, { useMemo, useState } from 'react';
import { PLAYERS_DATA, MAP_IMAGES } from '../constants';
import { HistorySeries, MatchPlayerPerformance } from '../types';
import ChevronDownIcon from './icons/ChevronDownIcon';
import StarIcon from './icons/StarIcon';

// New component for displaying a single team's performance
interface TeamPerformanceCardProps {
    title: string;
    players: MatchPlayerPerformance[];
    teamColor: 'green' | 'red';
}

const TeamPerformanceCard: React.FC<TeamPerformanceCardProps> = ({ title, players, teamColor }) => {
    const titleColor = teamColor === 'green' ? 'text-green-400' : 'text-red-400';
    const borderColor = teamColor === 'green' ? 'border-green-500/30' : 'border-red-500/30';

    return (
        <div className={`bg-gray-900/50 rounded-lg p-3 border ${borderColor}`}>
            <h4 className={`text-lg font-semibold mb-3 text-center ${titleColor}`}>{title}</h4>
            <div className="space-y-1">
                {/* Header */}
                <div className="grid grid-cols-12 gap-2 text-xs text-gray-400 px-2">
                    <span className="col-span-6">Jogador</span>
                    <span className="col-span-2 text-center">KDA</span>
                    <span className="col-span-4 text-right">Pontos</span>
                </div>
                {/* Player List */}
                {players.map(player => (
                    <div 
                        key={player.playerName}
                        className={`grid grid-cols-12 gap-2 items-center p-2 rounded-md transition-colors ${player.isMvp ? 'bg-orange-500/20' : 'bg-gray-800/60'}`}
                    >
                        <div className="col-span-6 flex items-center whitespace-nowrap overflow-hidden">
                            <img src={player.photoUrl} alt={player.playerName} className="w-7 h-7 rounded-full object-cover mr-2 flex-shrink-0" />
                            <span className="font-medium text-sm text-ellipsis overflow-hidden">{player.playerName}</span>
                        </div>
                        <div className="col-span-2 text-center text-xs text-gray-300">
                           {`${player.kills}/${player.deaths}/${player.assists}`}
                        </div>
                        <div className="col-span-4 text-right font-bold text-lg flex items-center justify-end">
                            {player.isMvp && <StarIcon className="w-4 h-4 text-yellow-400 mr-1.5" />}
                            <span className="text-orange-400">{player.points.toFixed(2)}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};


const MatchHistory: React.FC = () => {
    const [expandedSeriesTitle, setExpandedSeriesTitle] = useState<string | null>(null);

    const processedHistory = useMemo((): HistorySeries[] => {
        const seriesMap = new Map<string, HistorySeries>();

        // Step 1: Aggregate all match data from all players
        for (const player of PLAYERS_DATA) {
            for (const series of player.seriesHistory) {
                if (!seriesMap.has(series.title)) {
                    seriesMap.set(series.title, {
                        title: series.title,
                        matches: [],
                    });
                }
                const historySeries = seriesMap.get(series.title)!;

                for (const match of series.matches) {
                    const winningScore = Math.max(match.team1Score, match.team2Score);
                    const losingScore = Math.min(match.team1Score, match.team2Score);
                    
                    let historyMatch = historySeries.matches.find(hm => 
                        hm.map === match.map && 
                        hm.winningScore === winningScore && 
                        hm.losingScore === losingScore
                    );

                    if (!historyMatch) {
                        historyMatch = {
                            id: match.id,
                            map: match.map,
                            winningScore: winningScore,
                            losingScore: losingScore,
                            winningTeamPlayers: [],
                            losingTeamPlayers: [],
                        };
                        historySeries.matches.push(historyMatch);
                    }

                    const performanceData: MatchPlayerPerformance = {
                        playerName: player.name,
                        photoUrl: player.photoUrl,
                        kills: match.kills,
                        deaths: match.deaths,
                        assists: match.assists,
                        points: match.points,
                    };
                    
                    const teamList = match.won ? historyMatch.winningTeamPlayers : historyMatch.losingTeamPlayers;
                    if (!teamList.some(p => p.playerName === player.name)) {
                        teamList.push(performanceData);
                    }
                }
            }
        }
        
        // Step 2: Post-process to sort players and find MVP for each match
        seriesMap.forEach(series => {
            series.matches.forEach(match => {
                match.winningTeamPlayers.sort((a, b) => b.points - a.points);
                match.losingTeamPlayers.sort((a, b) => b.points - a.points);

                const allPlayersInMatch = [...match.winningTeamPlayers, ...match.losingTeamPlayers];
                if (allPlayersInMatch.length > 0) {
                    const mvp = allPlayersInMatch.reduce((max, p) => p.points > max.points ? p : max, allPlayersInMatch[0]);
                    
                    const playerToMark = allPlayersInMatch.find(p => p.playerName === mvp.playerName);
                    if (playerToMark) {
                        playerToMark.isMvp = true;
                    }
                }
            });
        });

        const result = Array.from(seriesMap.values());

        // Step 3: Sort series by date (most recent first)
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
        
        result.forEach(series => {
            series.matches.sort((a,b) => a.map.localeCompare(b.map));
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
                                    <div key={`${series.title}-${match.map}`} className="bg-gray-800 rounded-lg overflow-hidden shadow-lg">
                                         <div className="bg-gray-700/50 flex items-center justify-between p-3">
                                            <div className="flex items-center gap-3">
                                                <img 
                                                    src={MAP_IMAGES[match.map]} 
                                                    alt={match.map}
                                                    className="w-10 h-10 object-cover rounded-md"
                                                />
                                                <p className="font-bold text-xl text-white uppercase tracking-wider">
                                                    {match.map}
                                                </p>
                                            </div>
                                            <p className="font-black text-2xl">
                                                <span className="text-green-400">{match.winningScore}</span>
                                                <span className="text-gray-500 mx-2">-</span>
                                                <span className="text-red-400">{match.losingScore}</span>
                                            </p>
                                        </div>
                                        
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
                                            <TeamPerformanceCard title="Vitória" players={match.winningTeamPlayers} teamColor="green" />
                                            <TeamPerformanceCard title="Derrota" players={match.losingTeamPlayers} teamColor="red" />
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