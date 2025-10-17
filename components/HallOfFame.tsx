import React, { useMemo } from 'react';
import { Player } from '../types';
import { PLAYERS_DATA } from '../constants';
import PlayerCard from './PlayerCard';
import StarIcon from './icons/StarIcon';
import ThumbDownIcon from './icons/ThumbDownIcon';
import PalmTreeIcon from './icons/PalmTreeIcon';
import CrosshairIcon from './icons/CrosshairIcon';
import EyeSlashIcon from './icons/EyeSlashIcon';


interface Record {
    title: string;
    value: string;
    player: Player;
    details?: string;
    type: 'positive' | 'negative' | 'funny';
}

interface HallOfFameProps {
    onViewDetails: (player: Player) => void;
}

const calculateRecords = (): Record[] => {
    const records: Record[] = [];
    if (PLAYERS_DATA.length === 0) return [];

    const allPlayersAndMatches = PLAYERS_DATA.flatMap(player => 
        player.seriesHistory.flatMap(series => 
            series.matches.map(match => ({ player, match, series }))
        )
    );
    
    const activePlayers = PLAYERS_DATA.filter(p => p.status === 'active');

    // POSITIVE RECORDS
    const highestScore = allPlayersAndMatches.reduce((max, current) => 
        current.match.points > max.match.points ? current : max
    );
    records.push({
        title: 'Maior Pontuação (Partida)',
        value: highestScore.match.points.toFixed(2),
        player: highestScore.player,
        details: `no mapa ${highestScore.match.map}`,
        type: 'positive'
    });

    let mostKillsSeries = { player: PLAYERS_DATA[0], value: 0, seriesTitle: '' };
    PLAYERS_DATA.forEach(player => {
        player.seriesHistory.forEach(series => {
            const seriesKills = series.matches.reduce((sum, match) => sum + match.kills, 0);
            if (seriesKills > mostKillsSeries.value) {
                mostKillsSeries = { player, value: seriesKills, seriesTitle: series.title };
            }
        });
    });
    records.push({
        title: 'Mais Kills (Série)',
        value: mostKillsSeries.value.toString(),
        player: mostKillsSeries.player,
        details: `na série "${mostKillsSeries.seriesTitle.split(' - ')[0]}"`,
        type: 'positive'
    });
    
    const highestHS = activePlayers.reduce((max, p) => p.avgHeadshotPercentage > max.avgHeadshotPercentage ? p : max);
    records.push({
        title: 'Headshot Machine',
        value: `${highestHS.avgHeadshotPercentage}%`,
        player: highestHS,
        details: 'Maior % de HS médio',
        type: 'positive'
    });

    const highestKd = PLAYERS_DATA.reduce((max, p) => p.kdRatio > max.kdRatio ? p : max);
    records.push({
        title: 'Maior K/D Ratio (Geral)',
        value: highestKd.kdRatio.toFixed(2),
        player: highestKd,
        details: `em ${highestKd.seriesHistory.flatMap(s => s.matches).length} mapas jogados`,
        type: 'positive'
    });

    const highestOverall = PLAYERS_DATA.filter(p => p.status !== 'banned').reduce((max, p) => p.overall > max.overall ? p : max);
    records.push({
        title: 'Rei do Mix (Maior Overall)',
        value: highestOverall.overall.toString(),
        player: highestOverall,
        type: 'positive'
    });
    
    const mostTotalAssists = PLAYERS_DATA.reduce((max, p) => p.totalAssists > max.totalAssists ? p : max);
     records.push({
        title: 'O Onipresente (Total de Assists)',
        value: mostTotalAssists.totalAssists.toString(),
        player: mostTotalAssists,
        type: 'positive'
    });

    const highestMatchKd = allPlayersAndMatches.reduce((max, current) => {
        const currentKd = current.match.deaths > 0 ? current.match.kills / current.match.deaths : current.match.kills;
        const maxKd = max.match.deaths > 0 ? max.match.kills / max.match.deaths : max.match.kills;
        return currentKd > maxKd ? current : max;
    });
    records.push({
        title: 'O Imortal (K/D em Partida)',
        value: `${highestMatchKd.match.kills} / ${highestMatchKd.match.deaths}`,
        player: highestMatchKd.player,
        details: `no mapa ${highestMatchKd.match.map}`,
        type: 'positive'
    });
    
    const mostMapsPlayed = PLAYERS_DATA.reduce((max, p) => {
        const pMaps = p.seriesHistory.flatMap(s => s.matches).length;
        const maxMaps = max.seriesHistory.flatMap(s => s.matches).length;
        return pMaps > maxMaps ? p : max;
    });
    records.push({
        title: 'Homem de Ferro (Mais Mapas)',
        value: mostMapsPlayed.seriesHistory.flatMap(s => s.matches).length.toString(),
        player: mostMapsPlayed,
        details: 'O que mais jogou',
        type: 'positive'
    });

    // NEGATIVE RECORDS

    const mostDeathsMatch = allPlayersAndMatches.reduce((max, current) => 
        current.match.deaths > max.match.deaths ? current : max
    );
    records.push({
        title: 'Saco de Pancada',
        value: mostDeathsMatch.match.deaths.toString(),
        player: mostDeathsMatch.player,
        details: `de mortes no mapa ${mostDeathsMatch.match.map}`,
        type: 'negative'
    });

    const lowestTotalAssists = activePlayers.reduce((min, p) => p.totalAssists < min.totalAssists ? p : min);
     records.push({
        title: 'O Esquecido (Menos Assists)',
        value: lowestTotalAssists.totalAssists.toString(),
        player: lowestTotalAssists,
        details: 'Menor número de assists no total',
        type: 'negative'
    });

    const lowestOverall = activePlayers.reduce((min, p) => p.overall < min.overall ? p : min);
    records.push({
        title: 'Lanterna (Menor Overall)',
        value: lowestOverall.overall.toString(),
        player: lowestOverall,
        type: 'negative'
    });

    // FUNNY RECORD
    const wonMatches = allPlayersAndMatches.filter(pm => pm.match.won);
    if (wonMatches.length > 0) {
        const tourist = wonMatches.reduce((max, current) => 
            current.match.deaths > max.match.deaths ? current : max
        );
        records.push({
            title: 'O Turista',
            value: `${tourist.match.deaths} mortes`,
            player: tourist.player,
            details: `em vitória por ${tourist.match.team1Score} a ${tourist.match.team2Score} na ${tourist.match.map}`,
            type: 'funny'
        });
    }

    return records;
};

const RecordCard: React.FC<{ record: Record; onViewDetails: (player: Player) => void }> = ({ record, onViewDetails }) => {
    const typeStyles = {
        positive: {
            Icon: StarIcon,
            bgColor: 'bg-gray-800/70',
            borderColor: 'border-gray-700/50',
            titleColor: 'text-orange-400',
            iconColor: 'text-yellow-400',
        },
        negative: {
            Icon: ThumbDownIcon,
            bgColor: 'bg-red-900/20',
            borderColor: 'border-red-500/20',
            titleColor: 'text-red-400',
            iconColor: 'text-red-400',
        },
        funny: {
            Icon: PalmTreeIcon,
            bgColor: 'bg-cyan-900/20',
            borderColor: 'border-cyan-500/20',
            titleColor: 'text-cyan-400',
            iconColor: 'text-cyan-400',
        }
    };
    
    // Override icon for specific records
    if (record.title === 'Headshot Machine') typeStyles.positive.Icon = CrosshairIcon;
    if (record.title === 'O Esquecido (Menos Assists)') typeStyles.negative.Icon = EyeSlashIcon;
    
    const styles = typeStyles[record.type];

    return (
        <div className={`rounded-xl p-6 flex flex-col items-center gap-4 border ${styles.bgColor} ${styles.borderColor}`}>
            <div className="text-center">
                <h3 className={`text-2xl font-bold ${styles.titleColor} flex items-center justify-center gap-2`}>
                    <styles.Icon className={`w-6 h-6 ${styles.iconColor}`} />
                    {record.title}
                </h3>
                <p className="text-5xl font-black text-white my-2">{record.value}</p>
                {record.details && <p className="text-sm text-gray-400">{record.details}</p>}
            </div>
            <div className="w-full max-w-xs mt-2">
                <PlayerCard
                    player={record.player}
                    onSelect={() => {}}
                    onViewDetails={onViewDetails}
                    isSelected={false}
                    isDisabled={true}
                    hideActions={true}
                />
            </div>
        </div>
    );
};


const HallOfFame: React.FC<HallOfFameProps> = ({ onViewDetails }) => {
    const records = useMemo(() => calculateRecords(), []);

    return (
        <main>
            <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-300">Hall da Fama</h2>
                <p className="text-orange-400">As lendas e seus feitos históricos no Mix Abençoado.</p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-8">
                {records.map(record => (
                   <RecordCard key={record.title} record={record} onViewDetails={onViewDetails} />
                ))}
            </div>
        </main>
    );
};

export default HallOfFame;
