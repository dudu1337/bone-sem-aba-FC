import React, { useState, useMemo, useEffect } from 'react';
import { Player } from '../types';
// Fix: Import MAP_POOL from constants to use the shared definition.
import { MAP_IMAGES, SIDE_LOGOS, MAP_POOL } from '../constants';

type MatchFormat = 'md1' | 'md2' | 'md3' | 'md5';
type VetoAction = 'ban' | 'pick' | 'finished';
export type VetoResult = { map: string; pickedBy?: Player; side?: 'CT' | 'TR'; sidePickedBy?: Player };

interface MapVetoProps {
    teamA: Player[];
    teamB: Player[];
    matchFormat: MatchFormat;
    captains: [Player, Player];
    coinFlipWinner: Player;
    onVetoComplete: (maps: VetoResult[]) => void;
}

const getTeamWinRateForMap = (team: Player[], mapName: string): number => {
    const rates = team.map(p => p.winRateByMap[mapName]).filter(rate => rate !== undefined);
    if (rates.length === 0) return 0;
    return Math.round(rates.reduce((a, b) => a + b, 0) / rates.length);
};

const TeamDisplay: React.FC<{ team: Player[], hoveredMap: string | null }> = ({ team, hoveredMap }) => (
    <div className="p-4 bg-gray-800/50 rounded-lg space-y-2">
        <h3 className="text-xl font-bold text-center text-orange-400 mb-3">Time de {team[0]?.name}</h3>
        {team.map(player => (
            <div key={player.id} className="flex justify-between items-center bg-gray-700/60 p-2 rounded-md">
                <span className="font-semibold">{player.name}</span>
                <span className={`font-bold ${hoveredMap ? 'text-white' : 'text-gray-500'}`}>
                    {hoveredMap ? `${player.winRateByMap[hoveredMap] ?? 'N/A'}%` : '-'}
                </span>
            </div>
        ))}
    </div>
);


const MapVeto: React.FC<MapVetoProps> = ({ teamA, teamB, matchFormat, captains, coinFlipWinner, onVetoComplete }) => {
    const [bannedMaps, setBannedMaps] = useState<string[]>([]);
    const [pickedMaps, setPickedMaps] = useState<VetoResult[]>([]);
    const [turn, setTurn] = useState(0);
    const [hoveredMap, setHoveredMap] = useState<string | null>(null);
    const [sideSelection, setSideSelection] = useState<Omit<VetoResult, 'side' | 'sidePickedBy'> & { sidePickedBy: Player } | null>(null);

    const vetoOrder = useMemo(() => {
        const vetoStarter = captains.find(c => c.id !== coinFlipWinner.id)!;
        const secondPicker = coinFlipWinner;
        
        const sequence = (actions: VetoAction[]) => {
            return actions.map((action, index) => ({
                action,
                picker: index % 2 === 0 ? vetoStarter : secondPicker,
            }));
        };

        switch(matchFormat) {
            case 'md1': return sequence(['ban', 'ban', 'ban', 'ban', 'ban', 'ban']);
            case 'md2': return sequence(['ban', 'ban', 'ban', 'ban', 'pick', 'pick']);
            case 'md3': return sequence(['ban', 'ban', 'pick', 'pick', 'ban', 'ban']);
            case 'md5': return sequence(['ban', 'ban', 'pick', 'pick', 'pick', 'pick']);
            default: return [];
        }
    }, [matchFormat, captains, coinFlipWinner]);

    const currentVeto = useMemo(() => {
        if (turn >= vetoOrder.length) return { action: 'finished' as VetoAction, picker: null };
        return vetoOrder[turn];
    }, [turn, vetoOrder]);

    const handleMapClick = (mapName: string) => {
        if (currentVeto.action === 'finished' || sideSelection) return;
        const picker = currentVeto.picker!;

        if (currentVeto.action === 'ban') {
            setBannedMaps(prev => [...prev, mapName]);
            setTurn(t => t + 1);
        } else if (currentVeto.action === 'pick') {
            const opponent = captains.find(c => c.id !== picker.id)!;
            setSideSelection({ map: mapName, pickedBy: picker, sidePickedBy: opponent });
        }
    };

    const handleSideSelect = (side: 'CT' | 'TR') => {
        if (!sideSelection) return;
        setPickedMaps(prev => [...prev, { ...sideSelection, side }]);
        setSideSelection(null);
        setTurn(t => t + 1);
    }
    
    useEffect(() => {
        if (currentVeto.action === 'finished') {
            let finalMapsResult: VetoResult[];
            if (matchFormat === 'md1' || matchFormat === 'md3' || matchFormat === 'md5') {
                 const allProcessedMaps = [...bannedMaps, ...pickedMaps.map(p => p.map)];
                 const remainingMap = MAP_POOL.filter(m => !allProcessedMaps.includes(m));
                 finalMapsResult = [...pickedMaps, { map: remainingMap[0] }];
            } else { //md2
                finalMapsResult = pickedMaps;
            }
            const timer = setTimeout(() => onVetoComplete(finalMapsResult), 2000);
            return () => clearTimeout(timer);
        }
    }, [currentVeto.action, bannedMaps, pickedMaps, matchFormat, onVetoComplete]);

    const bannerText = () => {
        if (currentVeto.action === 'finished') {
            return <h2 className="text-2xl font-bold text-green-400 animate-pulse">Veto finalizado!</h2>
        }
        const actionText = currentVeto.action === 'ban' ? 'banir' : 'escolher';
        return (
             <>
                <h2 className="text-2xl font-bold">Veto de Mapas</h2>
                <p className="text-lg">Vez de <span className="font-bold text-orange-400">{currentVeto.picker?.name}</span> para <span className="font-bold">{actionText}</span> um mapa.</p>
            </>
        )
    }

    return (
        <div className="relative">
            {sideSelection && (
                <div className="absolute inset-0 bg-black/80 flex flex-col justify-center items-center z-30 rounded-lg">
                    <div className="bg-gray-800 p-8 rounded-xl shadow-lg text-center border border-gray-700">
                        <p className="text-lg mb-2"><span className="font-bold text-orange-400">{sideSelection.pickedBy?.name}</span> escolheu o mapa <span className="font-bold">{sideSelection.map}</span>.</p>
                        <h3 className="text-2xl font-bold mb-6">
                           <span className="text-orange-400">{sideSelection.sidePickedBy.name}</span>, escolha o lado:
                        </h3>
                        <div className="flex gap-4 justify-center">
                            <button onClick={() => handleSideSelect('CT')} className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-8 rounded-lg text-lg flex items-center">
                                <img src={SIDE_LOGOS.CT} alt="CT Logo" className="w-8 h-8 mr-2" />
                                CT
                            </button>
                            <button onClick={() => handleSideSelect('TR')} className="bg-yellow-600 hover:bg-yellow-500 text-white font-bold py-3 px-8 rounded-lg text-lg flex items-center">
                                <img src={SIDE_LOGOS.TR} alt="TR Logo" className="w-8 h-8 mr-2" />
                                TR
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="text-center mb-6">{bannerText()}</div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                <TeamDisplay team={teamA} hoveredMap={hoveredMap} />
                
                <div className="space-y-2" onMouseLeave={() => setHoveredMap(null)}>
                    {MAP_POOL.map(map => {
                        const isBanned = bannedMaps.includes(map);
                        const pickedInfo = pickedMaps.find(p => p.map === map);
                        const isUnavailable = isBanned || !!pickedInfo;

                        const teamAwr = getTeamWinRateForMap(teamA, map);
                        const teamBwr = getTeamWinRateForMap(teamB, map);
                        const imageUrl = MAP_IMAGES[map];

                        return (
                             <div
                                key={map}
                                onClick={() => !isUnavailable && currentVeto.action !== 'finished' && handleMapClick(map)}
                                onMouseEnter={() => setHoveredMap(map)}
                                style={{ backgroundImage: imageUrl ? `linear-gradient(rgba(10, 10, 10, 0.75), rgba(10, 10, 10, 0.75)), url(${imageUrl})` : undefined }}
                                className={`h-20 flex items-center justify-center p-3 rounded-lg transition-all duration-200 relative overflow-hidden border-2 bg-center bg-cover bg-gray-900
                                    ${isBanned ? 'border-red-800' : ''}
                                    ${pickedInfo ? 'border-green-500' : ''}
                                    ${!isUnavailable ? 'border-gray-700 hover:border-orange-500 cursor-pointer' : 'border-transparent cursor-default'}
                                `}
                            >
                                <div className="relative z-10 flex justify-between items-center font-bold w-full">
                                    <span className={`text-sm ${teamAwr > teamBwr ? 'text-green-400' : 'text-gray-300'}`}>{teamAwr}%</span>
                                    <span className="text-xl text-white uppercase tracking-wider" style={{ textShadow: '2px 2px 4px black' }}>{map}</span>
                                    <span className={`text-sm ${teamBwr > teamAwr ? 'text-green-400' : 'text-gray-300'}`}>{teamBwr}%</span>
                                </div>
                                {isBanned && <div className="absolute inset-0 bg-red-900/80 flex items-center justify-center text-red-500 font-black text-3xl tracking-widest uppercase">Banido</div>}
                                {pickedInfo && (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center text-green-400 font-black text-3xl tracking-widest bg-green-900/80 uppercase text-center">
                                       <span>Escolhido</span>
                                       {pickedInfo.side && 
                                            <span className="text-sm font-normal normal-case mt-1 flex items-center justify-center">
                                                <img src={SIDE_LOGOS[pickedInfo.side]} alt={`${pickedInfo.side} logo`} className="w-5 h-5 mr-1"/>
                                                para {captains.find(c => c.id !== pickedInfo.pickedBy?.id)?.name}
                                            </span>
                                        }
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>

                <TeamDisplay team={teamB} hoveredMap={hoveredMap} />
            </div>
        </div>
    );
};

export default MapVeto;
