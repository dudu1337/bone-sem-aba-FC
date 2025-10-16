import React from 'react';
import { Player } from '../types';

interface PlayerCardProps {
  player: Player;
  isSelected: boolean;
  isDisabled: boolean;
  onSelect: (player: Player) => void;
  onViewDetails: (player: Player) => void;
  isExportView?: boolean;
  hideActions?: boolean;
}

const getTierStyles = (overall: number, status?: string) => {
    if (status === 'banned') return {
        statsStyle: { backgroundColor: '#4A5568' },
        overallText: 'text-gray-400',
        nameText: 'text-gray-300',
        lastPointsText: 'text-gray-400',
        statsTextColor: 'text-white'
    };

    const commonStyles = {
        overallText: 'text-white',
        nameText: 'text-white',
    };

    if (overall >= 90) return { // Blue
        ...commonStyles,
        statsStyle: { backgroundColor: '#172052' },
        lastPointsText: 'text-sky-300',
        statsTextColor: 'text-white'
    };
    if (overall >= 80) return { // Gold
        ...commonStyles,
        statsStyle: { backgroundColor: '#fbd470' },
        lastPointsText: 'text-amber-900',
        statsTextColor: 'text-gray-900'
    };
    if (overall >= 70) return { // Silver
        ...commonStyles,
        statsStyle: { backgroundColor: '#d2d2d2' },
        lastPointsText: 'text-gray-700',
        statsTextColor: 'text-gray-800'
    };
    return { // Bronze
        ...commonStyles,
        statsStyle: { backgroundColor: '#ad7350' },
        lastPointsText: 'text-orange-200',
        statsTextColor: 'text-white'
    };
}

const PlayerCard: React.FC<PlayerCardProps> = ({ player, isSelected, isDisabled, onSelect, onViewDetails, isExportView = false, hideActions = false }) => {
    
    const handleSelectClick = (e: React.MouseEvent) => {
        e.stopPropagation(); // Impede que o modal de detalhes abra ao clicar no botão
        onSelect(player);
    };

    const { statsStyle, overallText, nameText, lastPointsText, statsTextColor } = getTierStyles(player.overall, player.status);
    const textShadow = { textShadow: '2px 2px 4px rgba(0, 0, 0, 0.9)' };

    return (
        <div 
            onClick={() => !isExportView && player.status !== 'banned' && onViewDetails(player)}
            className={`relative rounded-2xl w-full mx-auto transition-all duration-300 overflow-hidden bg-gray-900 flex flex-col shadow-lg
            ${!isExportView && player.status !== 'banned' ? 'cursor-pointer hover:scale-105 hover:shadow-2xl hover:shadow-orange-500/20' : ''}
            ${isSelected && !isExportView ? 'ring-4 ring-offset-2 ring-offset-black ring-green-500' : ''}`}
        >
             {/* IMAGE SECTION */}
            <div 
                className="relative h-80 w-full bg-cover bg-top" 
                style={{ backgroundImage: `url(${player.photoUrl})` }}
            >
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
                
                <div className="relative z-10 p-3 h-full flex flex-col justify-between text-white">
                    <div className="flex justify-between items-start">
                        <p className={`font-black text-4xl ${overallText}`} style={textShadow}>
                            {player.overall}
                        </p>
                        <img className="w-10 h-10 object-cover rounded-full border-2 border-white/30" src="https://i.imgur.com/gB8hCgB.png" alt="Team Logo" />
                    </div>
                    <div>
                        <h3 className={`text-xl font-extrabold tracking-wide uppercase ${nameText}`} style={textShadow}>
                            {player.name}
                        </h3>
                    </div>
                </div>
            </div>

            {/* STATS & BUTTON SECTION */}
            <div style={statsStyle} className="p-4 flex-grow flex flex-col justify-between">
                <div className={`flex flex-col space-y-2 text-sm ${statsTextColor}`}>
                     <div className="flex justify-between items-center">
                        <span className="opacity-80">KDA Total</span>
                        <span className="font-bold text-sm">{`${player.totalKills}/${player.totalDeaths}/${player.totalAssists}`}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="opacity-80">K/D Ratio</span>
                        <span className="font-bold text-sm">{player.kdRatio.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="opacity-80">Win Rate</span>
                        <span className="font-bold text-sm">{`${player.winRate}%`}</span>
                    </div>
                     <div className="flex justify-between items-center">
                        <span className="opacity-80">HS Médio</span>
                        <span className="font-bold text-sm">{`${player.avgHeadshotPercentage}%`}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="opacity-80">Última Pontuação</span>
                        <span className={`font-bold text-sm ${lastPointsText}`}>{player.lastMatchPoints.toFixed(2)}</span>
                    </div>
                </div>

                {!isExportView && !hideActions && (
                    <div className="mt-4">
                        <button
                            onClick={handleSelectClick}
                            disabled={isDisabled}
                            className={`w-full font-bold py-2 px-4 rounded-full text-sm transition-all duration-200 shadow-md
                                ${player.status === 'banned' 
                                    ? 'bg-gray-600 text-gray-300'
                                    : isSelected 
                                        ? 'bg-red-600 hover:bg-red-700 text-white' 
                                        : 'bg-green-600 hover:bg-green-700 text-white'}
                                ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}
                            `}
                        >
                            {player.status === 'banned' ? 'Banido' : isSelected ? `Remover ($${player.price.toFixed(2)})` : `Adicionar ($${player.price.toFixed(2)})`}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PlayerCard;