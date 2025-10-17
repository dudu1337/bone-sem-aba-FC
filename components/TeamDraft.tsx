import React, { useState, useMemo } from 'react';
import { Player } from '../types';
import PlayerCard from './PlayerCard';
import PlayerCardSmall from './PlayerCardSmall';
import UsersIcon from './icons/UsersIcon';
import StarIcon from './icons/StarIcon';
import CoinIcon from './icons/CoinIcon';
import MapVeto, { VetoResult } from './MapVeto';
import { MAP_IMAGES, SIDE_LOGOS } from '../constants';

type MatchFormat = 'md1' | 'md2' | 'md3' | 'md5';
type DraftStep = 'FORMAT_SELECTION' |'PLAYER_SELECTION' | 'CAPTAIN_SELECTION' | 'COIN_FLIP' | 'DRAFTING' | 'SUMMARY';

interface TeamDraftProps {
    allPlayers: Player[];
    onViewDetails: (player: Player) => void;
}

const TeamDraft: React.FC<TeamDraftProps> = ({ allPlayers, onViewDetails }) => {
    const [step, setStep] = useState<DraftStep>('FORMAT_SELECTION');
    const [matchFormat, setMatchFormat] = useState<MatchFormat>('md1');
    const [draftPool, setDraftPool] = useState<Player[]>([]);
    const [captains, setCaptains] = useState<[Player | null, Player | null]>([null, null]);
    const [teamA, setTeamA] = useState<Player[]>([]);
    const [teamB, setTeamB] = useState<Player[]>([]);
    const [coinFlipWinner, setCoinFlipWinner] = useState<Player | null>(null);
    const [isCoinFlipping, setIsCoinFlipping] = useState(false);
    const [currentPickerIndex, setCurrentPickerIndex] = useState(0);
    const [summaryView, setSummaryView] = useState<'teams' | 'veto' | 'final'>('teams');
    const [finalMaps, setFinalMaps] = useState<VetoResult[]>([]);


    const availablePlayers = useMemo(() => allPlayers.filter(p => p.status !== 'banned' && p.status !== 'stand-in'), [allPlayers]);
    const remainingPlayers = useMemo(() => {
        const teamAPlayerIds = new Set(teamA.map(p => p.id));
        const teamBPlayerIds = new Set(teamB.map(p => p.id));
        return draftPool.filter(p => !teamAPlayerIds.has(p.id) && !teamBPlayerIds.has(p.id));
    }, [draftPool, teamA, teamB]);

    const pickOrder = useMemo(() => {
        if (!coinFlipWinner || !captains[0] || !captains[1]) return [];
        const loser = captains[0].id === coinFlipWinner.id ? captains[1] : captains[0];
        return [
            coinFlipWinner, loser, loser, coinFlipWinner, coinFlipWinner, loser, loser, coinFlipWinner
        ];
    }, [coinFlipWinner, captains]);

    const handlePlayerSelect = (player: Player) => {
        setDraftPool(currentPool => {
            const isSelected = currentPool.some(p => p.id === player.id);
            if (isSelected) {
                return currentPool.filter(p => p.id !== player.id);
            }
            if (currentPool.length < 10) {
                return [...currentPool, player];
            }
            return currentPool;
        });
    };

    const handleCaptainSelect = (player: Player) => {
        setCaptains(currentCaptains => {
            const isSelected = currentCaptains.some(p => p?.id === player.id);
            if (isSelected) {
                return currentCaptains.map(p => p?.id === player.id ? null : p) as [Player | null, Player | null];
            }
            const nullIndex = currentCaptains.indexOf(null);
            if (nullIndex !== -1) {
                const newCaptains = [...currentCaptains] as [Player | null, Player | null];
                newCaptains[nullIndex] = player;
                return newCaptains;
            }
            return currentCaptains;
        });
    };

    const handleCoinFlip = () => {
        if (!captains[0] || !captains[1]) return;
        setIsCoinFlipping(true);
        setTimeout(() => {
            const winner = Math.random() < 0.5 ? captains[0]! : captains[1]!;
            setCoinFlipWinner(winner);
            setIsCoinFlipping(false);
        }, 1500);
    };
    
    const startDraft = () => {
        if (!captains[0] || !captains[1]) return;
        setTeamA([captains[0]]);
        setTeamB([captains[1]]);
        setStep('DRAFTING');
    }

    const handleDraftPick = (player: Player) => {
        if (currentPickerIndex >= pickOrder.length) return;

        const currentPicker = pickOrder[currentPickerIndex];
        if (currentPicker.id === captains[0]?.id) {
            setTeamA(t => [...t, player]);
        } else {
            setTeamB(t => [...t, player]);
        }
        
        const nextIndex = currentPickerIndex + 1;
        setCurrentPickerIndex(nextIndex);
        if (nextIndex >= pickOrder.length) {
            setStep('SUMMARY');
        }
    };
    
    const resetDraft = () => {
        setStep('FORMAT_SELECTION');
        setMatchFormat('md1');
        setDraftPool([]);
        setCaptains([null, null]);
        setTeamA([]);
        setTeamB([]);
        setCoinFlipWinner(null);
        setCurrentPickerIndex(0);
        setSummaryView('teams');
        setFinalMaps([]);
    };

    const renderStepContent = () => {
        switch (step) {
            case 'FORMAT_SELECTION':
                return (
                    <div className="text-center flex flex-col items-center justify-center h-full">
                        <h3 className="text-2xl font-semibold mb-6">Selecione o Formato da Partida</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                            {(['md1', 'md2', 'md3', 'md5'] as MatchFormat[]).map(format => (
                                <button
                                    key={format}
                                    onClick={() => setMatchFormat(format)}
                                    className={`px-6 py-3 rounded-lg font-bold text-lg border-2 transition-all ${
                                        matchFormat === format
                                        ? 'bg-orange-500 border-orange-400 text-white'
                                        : 'bg-gray-700 border-gray-600 hover:border-orange-500'
                                    }`}
                                >
                                    {format.replace('md', 'MD').replace('1', '1')}
                                </button>
                            ))}
                        </div>
                        <button
                            onClick={() => setStep('PLAYER_SELECTION')}
                            className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-lg text-lg"
                        >
                            Confirmar Formato
                        </button>
                    </div>
                );
            case 'PLAYER_SELECTION':
                return (
                    <div>
                        <h3 className="text-xl font-semibold text-center mb-4">Selecione 10 jogadores para o Mix</h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                            {availablePlayers.map(p => (
                                <PlayerCardSmall 
                                    key={p.id}
                                    player={p}
                                    onClick={handlePlayerSelect}
                                    isSelected={draftPool.some(dp => dp.id === p.id)}
                                />
                            ))}
                        </div>
                        <div className="fixed bottom-0 left-0 right-0 bg-gray-900/80 backdrop-blur-sm p-4 flex justify-center items-center gap-4 z-20">
                            <p className="font-bold text-lg">{draftPool.length} / 10 selecionados</p>
                            <button 
                                onClick={() => setStep('CAPTAIN_SELECTION')}
                                disabled={draftPool.length !== 10}
                                className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 px-6 rounded-lg disabled:bg-gray-600 disabled:cursor-not-allowed"
                            >
                                Próximo
                            </button>
                        </div>
                    </div>
                );
            case 'CAPTAIN_SELECTION':
                 return (
                    <div>
                        <h3 className="text-xl font-semibold text-center mb-4">Escolha 2 capitães</h3>
                         <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                            {draftPool.map(p => (
                                <PlayerCardSmall 
                                    key={p.id}
                                    player={p}
                                    onClick={handleCaptainSelect}
                                    isSelected={captains.some(c => c?.id === p.id)}
                                />
                            ))}
                        </div>
                        <div className="fixed bottom-0 left-0 right-0 bg-gray-900/80 backdrop-blur-sm p-4 flex justify-center items-center gap-4 z-20">
                            <p className="font-bold text-lg">{captains.filter(c => c).length} / 2 selecionados</p>
                            <button 
                                onClick={() => setStep('COIN_FLIP')}
                                disabled={captains.filter(c => c).length !== 2}
                                className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 px-6 rounded-lg disabled:bg-gray-600 disabled:cursor-not-allowed"
                            >
                                Próximo
                            </button>
                        </div>
                    </div>
                );
            case 'COIN_FLIP':
                return (
                    <div className="text-center flex flex-col items-center justify-center h-full">
                        <h3 className="text-2xl font-semibold mb-6">Sorteio do First Pick</h3>
                        <div className="flex gap-8 items-center">
                            <div className="font-bold text-xl">{captains[0]?.name}</div>
                            <div className="text-gray-500 text-2xl">vs</div>
                            <div className="font-bold text-xl">{captains[1]?.name}</div>
                        </div>

                        <div className="my-8">
                            {isCoinFlipping ? (
                                <div className="animate-spin text-orange-500"><CoinIcon className="w-24 h-24"/></div>
                            ) : coinFlipWinner ? (
                                <div className="p-4 bg-gray-800 rounded-lg">
                                    <p className="text-lg"><span className="font-bold text-orange-400">{coinFlipWinner.name}</span> começa escolhendo!</p>
                                </div>
                            ) : (
                                 <CoinIcon className="w-24 h-24 text-gray-600"/>
                            )}
                        </div>
                        
                        {coinFlipWinner ? (
                             <button onClick={startDraft} className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-lg text-lg">
                                Começar Draft
                            </button>
                        ) : (
                             <button onClick={handleCoinFlip} disabled={isCoinFlipping} className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-8 rounded-lg text-lg disabled:bg-gray-600">
                                {isCoinFlipping ? 'Sorteando...' : 'Girar Moeda'}
                            </button>
                        )}
                    </div>
                );
            case 'DRAFTING':
                const picker = pickOrder[currentPickerIndex];
                return (
                     <div className="flex flex-col h-full">
                        <div className="text-center mb-4 p-3 bg-gray-800 rounded-lg">
                            <h3 className="text-xl font-bold">Vez de <span className="text-orange-400">{picker?.name}</span></h3>
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-grow">
                            <div className={`p-4 rounded-lg border-2 ${picker?.id === teamA[0]?.id ? 'border-orange-500' : 'border-gray-700'}`}>
                                <h4 className="text-lg font-bold text-center mb-3">Time de {teamA[0]?.name}</h4>
                                <div className="space-y-3">
                                    {teamA.map(p => <PlayerCardSmall key={p.id} player={p} onClick={() => {}} isDisabled={true}/>)}
                                    {Array(5 - teamA.length).fill(0).map((_, i) => <div key={i} className="h-16 bg-gray-800/50 rounded-lg border-2 border-dashed border-gray-600"></div>)}
                                </div>
                            </div>
                            <div className="p-4 rounded-lg border-2 border-gray-700">
                                <h4 className="text-lg font-bold text-center mb-3">Jogadores Disponíveis</h4>
                                <div className="space-y-3">
                                    {remainingPlayers.map(p => <PlayerCardSmall key={p.id} player={p} onClick={handleDraftPick} />)}
                                </div>
                            </div>
                             <div className={`p-4 rounded-lg border-2 ${picker?.id === teamB[0]?.id ? 'border-orange-500' : 'border-gray-700'}`}>
                                <h4 className="text-lg font-bold text-center mb-3">Time de {teamB[0]?.name}</h4>
                                <div className="space-y-3">
                                    {teamB.map(p => <PlayerCardSmall key={p.id} player={p} onClick={() => {}} isDisabled={true}/>)}
                                    {Array(5 - teamB.length).fill(0).map((_, i) => <div key={i} className="h-16 bg-gray-800/50 rounded-lg border-2 border-dashed border-gray-600"></div>)}
                                </div>
                            </div>
                        </div>
                     </div>
                );
            case 'SUMMARY':
                 return (
                    <div className="text-center">
                        {summaryView === 'teams' && (
                            <>
                                <h3 className="text-2xl font-semibold mb-6">Times Formados!</h3>
                                <div className="flex flex-col gap-8 mb-8">
                                    <div className="p-4 rounded-lg border-2 border-gray-700">
                                        <h4 className="text-xl font-bold text-center mb-3 text-orange-400">Time de {teamA[0]?.name}</h4>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                                            {teamA.map(p => <PlayerCard key={p.id} player={p} isSelected={false} isDisabled={true} onSelect={()=>{}} onViewDetails={onViewDetails} hideActions={true} />)}
                                        </div>
                                    </div>
                                    <div className="p-4 rounded-lg border-2 border-gray-700">
                                        <h4 className="text-xl font-bold text-center mb-3 text-orange-400">Time de {teamB[0]?.name}</h4>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                                            {teamB.map(p => <PlayerCard key={p.id} player={p} isSelected={false} isDisabled={true} onSelect={()=>{}} onViewDetails={onViewDetails} hideActions={true} />)}
                                        </div>
                                    </div>
                                </div>
                                <button onClick={() => setSummaryView('veto')} className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-lg text-lg">
                                    Iniciar Veto de Mapas
                                </button>
                            </>
                        )}
                        {summaryView === 'veto' && captains[0] && captains[1] && coinFlipWinner && (
                            <MapVeto 
                                teamA={teamA} 
                                teamB={teamB}
                                matchFormat={matchFormat}
                                captains={[captains[0], captains[1]]}
                                coinFlipWinner={coinFlipWinner}
                                onVetoComplete={(maps) => {
                                    setFinalMaps(maps);
                                    setSummaryView('final');
                                }}
                            />
                        )}
                        {summaryView === 'final' && (
                             <>
                                <h3 className="text-2xl font-semibold mb-6">Draft Finalizado!</h3>
                                <div className="mb-8 p-4 bg-gray-800 rounded-lg max-w-4xl mx-auto">
                                    <h4 className="text-xl font-bold mb-4 text-orange-400">Mapas da Partida</h4>
                                     <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        {finalMaps.map(mapInfo => {
                                            const isDecider = !mapInfo.pickedBy && (matchFormat === 'md3' || matchFormat === 'md5');
                                            const opponent = captains.find(c => c?.id !== mapInfo.pickedBy?.id);
                                            return (
                                                <div key={mapInfo.map} className="bg-gray-700 rounded-lg overflow-hidden text-center border-2 border-gray-600">
                                                    <div 
                                                        className="h-24 bg-cover bg-center flex items-center justify-center"
                                                        style={{ backgroundImage: `linear-gradient(rgba(10,10,10,0.6), rgba(10,10,10,0.6)), url(${MAP_IMAGES[mapInfo.map]})` }}
                                                    >
                                                        <h5 className="text-2xl font-bold text-white uppercase tracking-wider" style={{ textShadow: '2px 2px 4px black' }}>{mapInfo.map}</h5>
                                                    </div>
                                                    <div className="p-3 text-sm h-24 flex flex-col justify-center">
                                                        {isDecider ? (
                                                            <p className="font-bold text-yellow-400 text-lg">DECIDER</p>
                                                        ) : mapInfo.pickedBy ? (
                                                            <>
                                                                <p className="text-gray-400">Escolhido por:</p>
                                                                <p className="font-bold">{mapInfo.pickedBy.name}</p>
                                                                {mapInfo.side && opponent && (
                                                                    <div className="flex items-center justify-center mt-2 text-gray-400">
                                                                        <p>Lado para {opponent.name}:</p>
                                                                        <img src={SIDE_LOGOS[mapInfo.side]} alt={mapInfo.side} className="w-6 h-6 ml-2"/>
                                                                    </div>
                                                                )}
                                                            </>
                                                        ) : (
                                                            <p className="font-bold text-green-400">JOGADO</p>
                                                        )}
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                               <div className="flex flex-col gap-8">
                                    <div className="p-4 rounded-lg border-2 border-gray-700">
                                        <h4 className="text-xl font-bold text-center mb-3 text-orange-400">Time de {teamA[0]?.name}</h4>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                                            {teamA.map(p => <PlayerCard key={p.id} player={p} isSelected={false} isDisabled={true} onSelect={()=>{}} onViewDetails={onViewDetails} hideActions={true} />)}
                                        </div>
                                    </div>
                                    <div className="p-4 rounded-lg border-2 border-gray-700">
                                        <h4 className="text-xl font-bold text-center mb-3 text-orange-400">Time de {teamB[0]?.name}</h4>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                                            {teamB.map(p => <PlayerCard key={p.id} player={p} isSelected={false} isDisabled={true} onSelect={()=>{}} onViewDetails={onViewDetails} hideActions={true} />)}
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                );
        }
    };

    const steps = [
        { key: 'FORMAT_SELECTION', label: 'Formato', icon: <span>MDX</span>},
        { key: 'PLAYER_SELECTION', label: 'Jogadores', icon: <UsersIcon className="w-5 h-5"/> },
        { key: 'CAPTAIN_SELECTION', label: 'Capitães', icon: <StarIcon className="w-5 h-5"/> },
        { key: 'COIN_FLIP', label: 'Sorteio', icon: <CoinIcon className="w-5 h-5"/> },
        { key: 'DRAFTING', label: 'Draft', icon: null },
        { key: 'SUMMARY', label: 'Resultado', icon: null }
    ];
    const currentStepIndex = steps.findIndex(s => s.key === step);

    return (
        <div className="bg-gray-900 p-4 sm:p-6 rounded-lg">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-300">Bater Times</h2>
                <button onClick={resetDraft} className="bg-red-600 hover:bg-red-700 text-white font-bold py-1 px-3 rounded-lg text-xs">
                    Resetar
                </button>
            </div>

            {/* Stepper */}
             <div className="mb-8 flex justify-center items-center gap-2 sm:gap-4">
                {steps.map((s, index) => s.icon && (
                    <React.Fragment key={s.key}>
                        <div className="flex flex-col items-center text-center w-16">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 font-bold
                                ${index <= currentStepIndex ? 'bg-orange-500 border-orange-400 text-white' : 'bg-gray-700 border-gray-600 text-gray-400'}`}>
                                {s.icon}
                            </div>
                            <p className={`mt-2 text-xs font-semibold ${index <= currentStepIndex ? 'text-orange-400' : 'text-gray-500'}`}>{s.label}</p>
                        </div>
                         {index < steps.length - 3 && <div className={`flex-grow h-1 rounded-full ${index < currentStepIndex ? 'bg-orange-500' : 'bg-gray-700'}`}></div>}
                    </React.Fragment>
                ))}
            </div>


            <div className="min-h-[60vh]">
                 {renderStepContent()}
            </div>
        </div>
    );
};

export default TeamDraft;