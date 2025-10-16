import React, { useState, useMemo } from 'react';
import { Player } from '../types';
import PlayerCard from './PlayerCard';
import PlayerCardSmall from './PlayerCardSmall';
import UsersIcon from './icons/UsersIcon';
import StarIcon from './icons/StarIcon';
import CoinIcon from './icons/CoinIcon';

type DraftStep = 'PLAYER_SELECTION' | 'CAPTAIN_SELECTION' | 'COIN_FLIP' | 'DRAFTING' | 'SUMMARY';

interface TeamDraftProps {
    allPlayers: Player[];
    onViewDetails: (player: Player) => void;
}

const TeamDraft: React.FC<TeamDraftProps> = ({ allPlayers, onViewDetails }) => {
    const [step, setStep] = useState<DraftStep>('PLAYER_SELECTION');
    const [draftPool, setDraftPool] = useState<Player[]>([]);
    const [captains, setCaptains] = useState<[Player | null, Player | null]>([null, null]);
    const [teamA, setTeamA] = useState<Player[]>([]);
    const [teamB, setTeamB] = useState<Player[]>([]);
    const [coinFlipWinner, setCoinFlipWinner] = useState<Player | null>(null);
    const [isCoinFlipping, setIsCoinFlipping] = useState(false);
    const [currentPickerIndex, setCurrentPickerIndex] = useState(0);

    const availablePlayers = useMemo(() => allPlayers.filter(p => p.status !== 'banned'), [allPlayers]);
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
            const winner = Math.random() < 0.5 ? captains[0] : captains[1];
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
        setStep('PLAYER_SELECTION');
        setDraftPool([]);
        setCaptains([null, null]);
        setTeamA([]);
        setTeamB([]);
        setCoinFlipWinner(null);
        setCurrentPickerIndex(0);
    };

    const renderStepContent = () => {
        switch (step) {
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
                        <div className="fixed bottom-0 left-0 right-0 bg-gray-900/80 backdrop-blur-sm p-4 flex justify-center items-center gap-4">
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
                        <div className="fixed bottom-0 left-0 right-0 bg-gray-900/80 backdrop-blur-sm p-4 flex justify-center items-center gap-4">
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
                        <div className="grid grid-cols-3 gap-6 flex-grow">
                            {/* Team A */}
                            <div className={`p-4 rounded-lg border-2 ${picker?.id === teamA[0]?.id ? 'border-orange-500' : 'border-gray-700'}`}>
                                <h4 className="text-lg font-bold text-center mb-3">Time de {teamA[0]?.name}</h4>
                                <div className="space-y-3">
                                    {teamA.map(p => <PlayerCardSmall key={p.id} player={p} onClick={() => {}} isDisabled={true}/>)}
                                    {Array(5 - teamA.length).fill(0).map((_, i) => <div key={i} className="h-16 bg-gray-800/50 rounded-lg border-2 border-dashed border-gray-600"></div>)}
                                </div>
                            </div>
                            {/* Player Pool */}
                            <div className="p-4 rounded-lg border-2 border-gray-700">
                                <h4 className="text-lg font-bold text-center mb-3">Jogadores Disponíveis</h4>
                                <div className="space-y-3">
                                    {remainingPlayers.map(p => <PlayerCardSmall key={p.id} player={p} onClick={handleDraftPick} />)}
                                </div>
                            </div>
                            {/* Team B */}
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
                        <h3 className="text-2xl font-semibold mb-6">Times Formados!</h3>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                             <div className="p-4 rounded-lg border-2 border-gray-700">
                                <h4 className="text-xl font-bold text-center mb-3 text-orange-400">Time de {teamA[0]?.name}</h4>
                                <div className="space-y-4">
                                     {teamA.map(p => <PlayerCard key={p.id} player={p} isSelected={false} isDisabled={true} onSelect={()=>{}} onViewDetails={onViewDetails} hideActions={true} />)}
                                </div>
                             </div>
                              <div className="p-4 rounded-lg border-2 border-gray-700">
                                <h4 className="text-xl font-bold text-center mb-3 text-orange-400">Time de {teamB[0]?.name}</h4>
                                <div className="space-y-4">
                                     {teamB.map(p => <PlayerCard key={p.id} player={p} isSelected={false} isDisabled={true} onSelect={()=>{}} onViewDetails={onViewDetails} hideActions={true} />)}
                                </div>
                             </div>
                         </div>
                    </div>
                );
        }
    };

    const steps = [
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
                        <div className="flex flex-col items-center text-center">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300
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
