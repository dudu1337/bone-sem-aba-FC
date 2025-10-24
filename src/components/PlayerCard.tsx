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
        cardStyle: { backgroundColor: '#111827' }, // bg-gray-900
        statsStyle: { backgroundColor: '#4A5568', backgroundSize: 'cover', backgroundPosition: 'center' },
        overallText: 'text-gray-400',
        nameText: 'text-gray-300',
        lastPointsText: 'text-gray-400',
        statsTextColor: 'text-white'
    };

    const commonStyles = {
        overallText: 'text-white',
        nameText: 'text-white',
    };

    if (overall >= 95) return { // Emerald Tier
        overallText: 'text-green-900',
        nameText: 'text-green-900',
        cardStyle: {
            backgroundImage: `url(https://i.imgur.com/VBfis5e.png)`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundBlendMode: 'overlay',
        },
        statsStyle: {
            backgroundImage: `url(https://i.imgur.com/08x0mOv.png)`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
        },
        lastPointsText: 'text-emerald-700',
        statsTextColor: 'text-gray-800'
    };

    if (overall >= 90) return { // Reddish with background
        ...commonStyles,
        cardStyle: { 
            backgroundColor: '#4c1d14',
            backgroundImage: `url(https://i.imgur.com/xVvF4BV.png)`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundBlendMode: 'overlay',
        },
        statsStyle: { backgroundColor: '#2a0f0a', backgroundImage: `url(https://i.imgur.com/mfasmlM.png)`, backgroundSize: 'cover', backgroundPosition: 'center' },
        lastPointsText: 'text-red-300',
        statsTextColor: 'text-white'
    };
    if (overall >= 85) return { // Blue
        ...commonStyles,
        cardStyle: { 
            backgroundImage: `url(https://i.imgur.com/GsY510Z.png)`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundBlendMode: 'overlay',
        },
        statsStyle: { backgroundColor: '#172052', backgroundImage: `url(https://i.imgur.com/fHmj94z.png)`, backgroundSize: 'cover', backgroundPosition: 'center' },
        lastPointsText: 'text-sky-300',
        statsTextColor: 'text-white'
    };
    if (overall >= 80) return { // Gold
        ...commonStyles,
        cardStyle: { 
            backgroundImage: `url(https://i.imgur.com/6taPM0o.png)`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundBlendMode: 'overlay',
        },
        statsStyle: { backgroundColor: '#fbd470', backgroundImage: `url(https://i.imgur.com/VBBCDG1.png)`, backgroundSize: 'cover', backgroundPosition: 'center' },
        lastPointsText: 'text-amber-900',
        statsTextColor: 'text-gray-900'
    };
    if (overall >= 70) return { // Silver
        ...commonStyles,
        cardStyle: { 
            backgroundImage: `url(https://i.imgur.com/cyMl8rr.png)`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundBlendMode: 'overlay',
        },
        statsStyle: { backgroundColor: '#d2d2d2', backgroundImage: `url(https://i.imgur.com/tgiR8xs.png)`, backgroundSize: 'cover', backgroundPosition: 'center' },
        lastPointsText: 'text-gray-700',
        statsTextColor: 'text-gray-800'
    };
    return { // Bronze
        ...commonStyles,
        cardStyle: { backgroundColor: '#b67e61' },
        statsStyle: { backgroundColor: '#ad7350', backgroundImage: `url(https://i.imgur.com/uDFMp8x.png)`, backgroundSize: 'cover', backgroundPosition: 'center' },
        lastPointsText: 'text-orange-200',
        statsTextColor: 'text-white'
    };
}


const PlayerCard: React.FC<PlayerCardProps> = ({ player, isSelected, isDisabled, onSelect, onViewDetails, isExportView = false, hideActions = false }) => {
    
    const handleSelectClick = (e: React.MouseEvent) => {
        e.stopPropagation(); // Impede que o modal de detalhes abra ao clicar no botão
        onSelect(player);
    };

    const { cardStyle, statsStyle, overallText, nameText, lastPointsText, statsTextColor } = getTierStyles(player.overall, player.status);
    const textShadow = player.overall >= 95 
        ? { textShadow: '1px 1px 2px rgba(0, 0, 0, 0.25)' } 
        : { textShadow: '2px 2px 4px rgba(0, 0, 0, 0.9)' };

    return (
        <div 
            onClick={() => !isExportView && player.status !== 'banned' && onViewDetails(player)}
            style={cardStyle}
            className={`relative rounded-2xl w-full mx-auto transition-all duration-300 overflow-hidden flex flex-col shadow-lg
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
                    <div className="flex justify-end items-start">
                        <p className={`font-black text-4xl ${overallText}`} style={textShadow}>
                            {player.overall}
                        </p>
                    </div>
                    <div>
                        <h3 className={`text-xl font-extrabold tracking-wide uppercase ${nameText}`} style={textShadow}>
                            {player.name}
                        </h3>
                    </div>
                </div>
            </div>

            {/* STATS & BUTTON SECTION */}
            <div style={statsStyle} 
                className="p-4 flex-grow flex flex-col justify-between"
            >
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