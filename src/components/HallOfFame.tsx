import React, { useMemo } from 'react';
import { Player, HistorySeries, MatchPlayerPerformance } from '../types';
import { PLAYERS_DATA } from '../constants';
import PlayerCard from './PlayerCard';
import StarIcon from './icons/StarIcon';
import ThumbDownIcon from './icons/ThumbDownIcon';
import PalmTreeIcon from './icons/PalmTreeIcon';
import CrosshairIcon from './icons/CrosshairIcon';

// --- Interfaces ---
interface HallOfFameProps {
    onViewDetails: (player: Player) => void;
}
interface OriginalRecord {
    title: string;
    value: string;
    player: Player;
    details?: string;
    type: 'positive' | 'negative' | 'funny';
}
interface StatRecord {
    title: string;
    value: string;
    player: Player;
    details?: string;
}
interface RatingRecord {
    title: string;
    value: string;
    player: Player;
    progress: string;
    isPositive: boolean;
}
interface DuoRecord {
    title: string;
    value: string;
    players: [Player, Player];
    details: string;
}

// --- Card Components ---

const OriginalRecordCard: React.FC<{ record: OriginalRecord; onViewDetails: (player: Player) => void }> = ({ record, onViewDetails }) => {
    const typeStyles = {
        positive: { Icon: StarIcon, bgColor: 'bg-gray-800/70', borderColor: 'border-gray-700/50', titleColor: 'text-orange-400', iconColor: 'text-yellow-400' },
        negative: { Icon: ThumbDownIcon, bgColor: 'bg-red-900/20', borderColor: 'border-red-500/20', titleColor: 'text-red-400', iconColor: 'text-red-400' },
        funny: { Icon: PalmTreeIcon, bgColor: 'bg-cyan-900/20', borderColor: 'border-cyan-500/20', titleColor: 'text-cyan-400', iconColor: 'text-cyan-400' }
    };
    if (record.title === 'Headshot Machine') typeStyles.positive.Icon = CrosshairIcon;

    const styles = typeStyles[record.type];
    return (
        <div className={`rounded-xl p-6 flex flex-col items-center gap-4 border h-full ${styles.bgColor} ${styles.borderColor}`}>
            <div className="text-center flex-grow">
                <h3 className={`text-2xl font-bold ${styles.titleColor} flex items-center justify-center gap-2`}>
                    <styles.Icon className={`w-6 h-6 ${styles.iconColor}`} />
                    {record.title}
                </h3>
                <p className="text-5xl font-black text-white my-2">{record.value}</p>
                {record.details && <p className="text-sm text-gray-400">{record.details}</p>}
            </div>
            <div className="w-full max-w-xs mt-2">
                <PlayerCard player={record.player} onSelect={() => {}} onViewDetails={onViewDetails} isSelected={false} isDisabled={true} hideActions={true} />
            </div>
        </div>
    );
};

const StatRecordCard: React.FC<{ record: StatRecord; onViewDetails: (player: Player) => void }> = ({ record, onViewDetails }) => (
    <div className="bg-gray-800/70 rounded-xl p-6 flex flex-col items-center gap-4 border border-gray-700/50 h-full">
        <div className="text-center flex-grow">
            <h3 className="text-2xl font-bold text-orange-400">{record.title}</h3>
            <p className="text-5xl font-black text-white my-2">{record.value}</p>
            {record.details && <p className="text-sm text-gray-400">{record.details}</p>}
        </div>
        <div className="w-full max-w-xs mt-2">
            <PlayerCard player={record.player} onSelect={() => {}} onViewDetails={onViewDetails} isSelected={false} isDisabled={true} hideActions={true} />
        </div>
    </div>
);

const RatingRecordCard: React.FC<{ record: RatingRecord; onViewDetails: (player: Player) => void }> = ({ record, onViewDetails }) => {
    const valueColor = record.isPositive ? 'text-green-400' : 'text-red-400';
    return (
        <div className="bg-gray-800/70 rounded-xl p-6 flex flex-col items-center gap-4 border border-gray-700/50 h-full">
            <div className="text-center flex-grow">
                <h3 className="text-2xl font-bold text-orange-400">{record.title}</h3>
                <p className={`text-5xl font-black my-2 ${valueColor}`}>{record.value}</p>
                <p className="text-lg text-gray-300 font-semibold">{record.progress}</p>
            </div>
            <div className="w-full max-w-xs mt-2">
                <PlayerCard player={record.player} onSelect={() => {}} onViewDetails={onViewDetails} isSelected={false} isDisabled={true} hideActions={true} />
            </div>
        </div>
    );
};

const DuoRecordCard: React.FC<{ record: DuoRecord; onViewDetails: (player: Player) => void }> = ({ record, onViewDetails }) => (
    <div className="bg-gray-800/70 rounded-xl p-6 flex flex-col items-center gap-4 border border-gray-700/50">
         <div className="text-center">
            <h3 className="text-2xl font-bold text-orange-400">{record.title}</h3>
            <p className="text-5xl font-black text-white my-2">{record.value}</p>
            <p className="text-sm text-gray-400">{record.details}</p>
        </div>
        <div className="w-full flex flex-col sm:flex-row gap-4 justify-center mt-2">
             <div className="w-full sm:w-64">
                <PlayerCard player={record.players[0]} onSelect={() => {}} onViewDetails={onViewDetails} isSelected={false} isDisabled={true} hideActions={true} />
             </div>
             <div className="w-full sm:w-64">
                <PlayerCard player={record.players[1]} onSelect={() => {}} onViewDetails={onViewDetails} isSelected={false} isDisabled={true} hideActions={true} />
             </div>
        </div>
    </div>
);

// --- Main Component ---
const HallOfFame: React.FC<HallOfFameProps> = ({ onViewDetails }) => {
    
    const { 
        originalRecords, 
        performanceLeaders, 
        efficiencyLeaders, 
        ratingChanges, 
        duoStats 
    } = useMemo(() => {
        const MIN_MAPS = 3;
        
        // --- Helpers ---
        const getProcessedHistory = (): HistorySeries[] => {
            const seriesMap = new Map<string, HistorySeries>();
            for (const player of PLAYERS_DATA) {
                for (const series of player.seriesHistory) {
                    if (!seriesMap.has(series.title)) seriesMap.set(series.title, { title: series.title, matches: [] });
                    const historySeries = seriesMap.get(series.title)!;
                    for (const match of series.matches) {
                        const winningScore = Math.max(match.team1Score, match.team2Score);
                        const losingScore = Math.min(match.team1Score, match.team2Score);
                        let historyMatch = historySeries.matches.find(hm => hm.map === match.map && hm.winningScore === winningScore && hm.losingScore === losingScore);
                        if (!historyMatch) {
                            historyMatch = { id: match.id, map: match.map, winningScore, losingScore, winningTeamPlayers: [], losingTeamPlayers: [] };
                            historySeries.matches.push(historyMatch);
                        }
                        const perfData: MatchPlayerPerformance = { playerName: player.name, photoUrl: player.photoUrl, kills: match.kills, deaths: match.deaths, assists: match.assists, points: match.points };
                        const teamList = match.won ? historyMatch.winningTeamPlayers : historyMatch.losingTeamPlayers;
                        if (!teamList.some(p => p.playerName === player.name)) teamList.push(perfData);
                    }
                }
            }
            seriesMap.forEach(series => {
                series.matches.forEach(match => {
                    const allPlayers = [...match.winningTeamPlayers, ...match.losingTeamPlayers];
                    if (allPlayers.length > 0) {
                        const mvp = allPlayers.reduce((max, p) => p.points > max.points ? p : max);
                        const playerToMark = allPlayers.find(p => p.playerName === mvp.playerName);
                        if (playerToMark) playerToMark.isMvp = true;
                    }
                });
            });
            return Array.from(seriesMap.values());
        };

        const history = getProcessedHistory();
        const eligiblePlayers = PLAYERS_DATA.filter(p => p.seriesHistory.flatMap(s => s.matches).length >= MIN_MAPS && p.status === 'active');
        const allPlayersAndMatches = PLAYERS_DATA.flatMap(p => p.seriesHistory.flatMap(s => s.matches.map(m => ({ player: p, match: m, series: s }))));
        const activePlayers = PLAYERS_DATA.filter(p => p.status === 'active');
        
        // --- Calculations ---
        const originalRecords: OriginalRecord[] = [];
        const performanceLeaders: StatRecord[] = [];
        const efficiencyLeaders: StatRecord[] = [];
        const ratingChanges: RatingRecord[] = [];
        const duoStats: DuoRecord[] = [];

        if (allPlayersAndMatches.length > 0) {
            originalRecords.push({
                title: 'Maior Pontuação (Partida)', value: allPlayersAndMatches.reduce((max, curr) => curr.match.points > max.match.points ? curr : max).match.points.toFixed(2),
                player: allPlayersAndMatches.reduce((max, curr) => curr.match.points > max.match.points ? curr : max).player, details: `no mapa ${allPlayersAndMatches.reduce((max, curr) => curr.match.points > max.match.points ? curr : max).match.map}`, type: 'positive'
            });

            let mostKillsSeries = { player: PLAYERS_DATA[0], value: 0, seriesTitle: '' };
            PLAYERS_DATA.forEach(p => p.seriesHistory.forEach(s => {
                const seriesKills = s.matches.reduce((sum, m) => sum + m.kills, 0);
                if (seriesKills > mostKillsSeries.value) mostKillsSeries = { player: p, value: seriesKills, seriesTitle: s.title };
            }));
            originalRecords.push({ title: 'Mais Kills (Série)', value: mostKillsSeries.value.toString(), player: mostKillsSeries.player, details: `na série "${mostKillsSeries.seriesTitle.split(' - ')[0]}"`, type: 'positive' });
            
            const mostDeathsMatch = allPlayersAndMatches.reduce((max, curr) => curr.match.deaths > max.match.deaths ? curr : max);
            originalRecords.push({ title: 'Ímã de Bala', value: mostDeathsMatch.match.deaths.toString(), player: mostDeathsMatch.player, details: `de mortes no mapa ${mostDeathsMatch.match.map}`, type: 'negative' });

            originalRecords.push({ title: 'Lanterna (Menor Overall)', value: activePlayers.reduce((min, p) => p.overall < min.overall ? p : min).overall.toString(), player: activePlayers.reduce((min, p) => p.overall < min.overall ? p : min), type: 'negative' });
            
            const wonMatches = allPlayersAndMatches.filter(pm => pm.match.won);
            if (wonMatches.length > 0) {
                const tourist = wonMatches.reduce((max, curr) => curr.match.deaths > max.match.deaths ? curr : max);
                originalRecords.push({ title: 'O Turista', value: `${tourist.match.deaths} mortes`, player: tourist.player, details: `em vitória por ${tourist.match.team1Score} a ${tourist.match.team2Score} na ${tourist.match.map}`, type: 'funny' });
            }
        }
        
        if (eligiblePlayers.length > 0) {
             const headshotKing = eligiblePlayers.reduce((max, p) => p.avgHeadshotPercentage > max.avgHeadshotPercentage ? p : max);
            originalRecords.push({
                title: 'Headshot Machine',
                value: `${headshotKing.avgHeadshotPercentage}%`,
                player: headshotKing,
                details: 'Maior % de HS médio (mín. 3 mapas)',
                type: 'positive'
            });

            const getMapsPlayed = (p: Player) => p.seriesHistory.flatMap(s => s.matches).length;
            
            const bestKpa = eligiblePlayers.map(p => ({ player: p, value: p.totalKills / getMapsPlayed(p) })).reduce((max, curr) => curr.value > max.value ? curr : max);
            performanceLeaders.push({ title: "Matador (Mais Kills/Mapa)", value: bestKpa.value.toFixed(2), player: bestKpa.player });

            const leastKpa = eligiblePlayers.map(p => ({ player: p, value: p.totalKills / getMapsPlayed(p) })).reduce((min, curr) => curr.value < min.value ? curr : min);
            performanceLeaders.push({ title: "Pacificador (Menos Kills/Mapa)", value: leastKpa.value.toFixed(2), player: leastKpa.player });
            
            const mostDpa = eligiblePlayers.map(p => ({ player: p, value: p.totalDeaths / getMapsPlayed(p) })).reduce((max, curr) => curr.value > max.value ? curr : max);
            performanceLeaders.push({ title: "Esponja (Mais Mortes/Mapa)", value: mostDpa.value.toFixed(2), player: mostDpa.player });

            const leastDpa = eligiblePlayers.map(p => ({ player: p, value: p.totalDeaths / getMapsPlayed(p) })).reduce((min, curr) => curr.value < min.value ? curr : min);
            performanceLeaders.push({ title: "Muralha (Menos Mortes/Mapa)", value: leastDpa.value.toFixed(2), player: leastDpa.player });

            const bestApa = eligiblePlayers.map(p => ({ player: p, value: p.totalAssists / getMapsPlayed(p) })).reduce((max, curr) => curr.value > max.value ? curr : max);
            performanceLeaders.push({ title: "Média de Assists / Mapa", value: bestApa.value.toFixed(2), player: bestApa.player });

            const mostKillsSingleMap = allPlayersAndMatches.reduce((max, curr) => curr.match.kills > max.match.kills ? curr : max);
            performanceLeaders.push({ title: "Mais Kills (Mapa Único)", value: mostKillsSingleMap.match.kills.toString(), player: mostKillsSingleMap.player, details: `na ${mostKillsSingleMap.match.map}` });

            const mvpCounts = new Map<string, number>();
            history.forEach(s => s.matches.forEach(m => { const mvp = [...m.winningTeamPlayers, ...m.losingTeamPlayers].find(p => p.isMvp); if(mvp) mvpCounts.set(mvp.playerName, (mvpCounts.get(mvp.playerName) || 0) + 1); }));
            if (mvpCounts.size > 0) {
                const [mvpPlayerName, maxMvps] = [...mvpCounts.entries()].reduce((max, curr) => curr[1] > max[1] ? curr : max);
                const mvpPlayer = PLAYERS_DATA.find(p => p.name === mvpPlayerName);
                if (mvpPlayer) performanceLeaders.push({ title: "Mais Vezes MVP", value: maxMvps.toString(), player: mvpPlayer });
            }

            const ironMan = eligiblePlayers.reduce((max, p) => (p.seriesHistory.flatMap(s => s.matches).length > max.seriesHistory.flatMap(s => s.matches).length ? p : max));
            performanceLeaders.push({ title: "Iron Man", value: `${ironMan.seriesHistory.flatMap(s => s.matches).length} mapas`, player: ironMan, details: "Mais mapas jogados" });

            efficiencyLeaders.push({ title: "Maior Win Rate", value: `${eligiblePlayers.reduce((max, p) => p.winRate > max.winRate ? p : max).winRate}%`, player: eligiblePlayers.reduce((max, p) => p.winRate > max.winRate ? p : max) });
            efficiencyLeaders.push({ title: "Menor Win Rate", value: `${eligiblePlayers.reduce((min, p) => p.winRate < min.winRate ? p : min).winRate}%`, player: eligiblePlayers.reduce((min, p) => p.winRate < min.winRate ? p : min) });
            
            const bestValuePlayer = eligiblePlayers.reduce((max, p) => (p.lastMatchPoints / p.price) > (max.lastMatchPoints / max.price) ? p : max);
            efficiencyLeaders.push({ title: "Melhor Custo-Benefício", value: `${(bestValuePlayer.lastMatchPoints / bestValuePlayer.price).toFixed(2)}`, player: bestValuePlayer, details: "Pontos / Preço" });

            const specialist = eligiblePlayers.map(p => {
                const mapsPlayed = p.seriesHistory.flatMap(s => s.matches).reduce((acc, m) => ({ ...acc, [m.map]: (acc[m.map] || 0) + 1 }), {} as {[key:string]:number});
                const bestMap = Object.entries(p.winRateByMap).filter(([map]) => mapsPlayed[map] >= MIN_MAPS).reduce((best, [map, wr]) => (wr > best.wr ? { map, wr } : best), { map: '', wr: 0 });
                return { player: p, ...bestMap };
            }).filter(s => s.map).reduce((max, curr) => (curr.wr > max.wr ? curr : max));
            if(specialist) efficiencyLeaders.push({ title: "Especialista em Mapas", value: `${specialist.wr}% WR`, player: specialist.player, details: `na ${specialist.map}` });

            const playersWithHistory = PLAYERS_DATA.filter(p => p.ratingHistory.length > 1);
            if (playersWithHistory.length > 0) {
                const changes = playersWithHistory.map(p => ({ p, change: p.ratingHistory[p.ratingHistory.length - 1].overall - p.ratingHistory[0].overall }));
                const upgrade = changes.reduce((max, curr) => curr.change > max.change ? curr : max);
                ratingChanges.push({ title: "Maior Upgrade de Rating", value: `+${upgrade.change}`, player: upgrade.p, progress: `${upgrade.p.ratingHistory[0].overall} → ${upgrade.p.ratingHistory[upgrade.p.ratingHistory.length - 1].overall}`, isPositive: true });
                const drop = changes.reduce((min, curr) => curr.change < min.change ? curr : min);
                ratingChanges.push({ title: "Maior Queda de Rating", value: `${drop.change}`, player: drop.p, progress: `${drop.p.ratingHistory[0].overall} → ${drop.p.ratingHistory[drop.p.ratingHistory.length - 1].overall}`, isPositive: false });
            }

            const duoMap = new Map<string, { p1: string; p2: string; wins: number; total: number }>();
            history.forEach(s => s.matches.forEach(m => {
                [m.winningTeamPlayers, m.losingTeamPlayers].forEach((team, i) => {
                    for (let j = 0; j < team.length; j++) for (let k = j + 1; k < team.length; k++) {
                        const key = [team[j].playerName, team[k].playerName].sort().join('-');
                        if (!duoMap.has(key)) duoMap.set(key, { p1: team[j].playerName, p2: team[k].playerName, wins: 0, total: 0 });
                        const stats = duoMap.get(key)!;
                        stats.total++;
                        if (i === 0) stats.wins++;
                    }
                });
            }));
            const eligibleDuos = Array.from(duoMap.values()).filter(d => d.total >= MIN_MAPS).map(d => ({ ...d, wr: (d.wins / d.total) * 100 }));
            if (eligibleDuos.length > 0) {
                const best = eligibleDuos.reduce((max, d) => d.wr > max.wr ? d : max);
                const worst = eligibleDuos.reduce((min, d) => d.wr < min.wr ? d : min);
                duoStats.push({ title: "Melhor Dupla", value: `${best.wr.toFixed(0)}% WR`, players: [PLAYERS_DATA.find(p => p.name === best.p1)!, PLAYERS_DATA.find(p => p.name === best.p2)!], details: `(${best.wins}V / ${best.total - best.wins}D)` });
                duoStats.push({ title: "Pior Dupla", value: `${worst.wr.toFixed(0)}% WR`, players: [PLAYERS_DATA.find(p => p.name === worst.p1)!, PLAYERS_DATA.find(p => p.name === worst.p2)!], details: `(${worst.wins}V / ${worst.total - worst.wins}D)` });
            }
        }
        
        return { originalRecords, performanceLeaders, efficiencyLeaders, ratingChanges, duoStats };
    }, []);

    const renderSection = (title: string, children: React.ReactNode) => (
        <div className="mb-16">
            <h3 className="text-2xl font-bold text-gray-300 mb-6 text-center border-b-2 border-gray-700 pb-2">{title}</h3>
            {children}
        </div>
    );
    
    return (
        <main>
            <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-gray-300">Hall da Fama</h2>
                <p className="text-orange-400">As lendas e seus feitos históricos no Mix Abençoado.</p>
            </div>

            {originalRecords.length > 0 && renderSection("Recordes Históricos", (
                <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-8">
                    {originalRecords.sort((a,b) => a.title.localeCompare(b.title)).map(r => <OriginalRecordCard key={r.title} record={r} onViewDetails={onViewDetails} />)}
                </div>
            ))}

            {performanceLeaders.length > 0 && renderSection("Líderes de Desempenho", (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {performanceLeaders.map(r => <StatRecordCard key={r.title} record={r} onViewDetails={onViewDetails} />)}
                </div>
            ))}
            
            {efficiencyLeaders.length > 0 && renderSection("Análise de Aproveitamento", (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {efficiencyLeaders.map(r => <StatRecordCard key={r.title} record={r} onViewDetails={onViewDetails} />)}
                </div>
            ))}

            {ratingChanges.length > 0 && renderSection("Evolução de Rating", (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {ratingChanges.map(r => <RatingRecordCard key={r.title} record={r} onViewDetails={onViewDetails} />)}
                </div>
            ))}
            
            {duoStats.length > 0 && renderSection("Duplas em Sinergia", (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {duoStats.map(r => <DuoRecordCard key={r.title} record={r} onViewDetails={onViewDetails} />)}
                </div>
            ))}
        </main>
    );
};

export default HallOfFame;