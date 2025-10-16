import React from 'react';
import { Player } from '../types';

interface PlayerCardSmallProps {
  player: Player;
  onClick: (player: Player) => void;
  isDisabled?: boolean;
  isSelected?: boolean;
}

const PlayerCardSmall: React.FC<PlayerCardSmallProps> = ({ player, onClick, isDisabled = false, isSelected = false }) => {
  return (
    <div
      onClick={() => !isDisabled && onClick(player)}
      className={`flex items-center p-2 rounded-lg transition-all duration-200 border-2
        ${isDisabled ? 'bg-gray-800 border-gray-700 opacity-40 cursor-not-allowed' : 'bg-gray-800 border-gray-700 hover:border-orange-500 cursor-pointer'}
        ${isSelected ? '!border-orange-500 ring-2 ring-orange-500' : ''}
      `}
    >
      <img src={player.photoUrl} alt={player.name} className="w-12 h-12 rounded-full object-cover" />
      <div className="ml-3 flex-grow">
        <p className="font-bold text-white text-sm">{player.name}</p>
        <p className="text-xs text-gray-400">OVR: {player.overall} | K/D: {player.kdRatio.toFixed(2)}</p>
      </div>
      <div className="text-right">
        <p className="font-bold text-green-400 text-sm">${player.price.toFixed(2)}</p>
      </div>
    </div>
  );
};

export default PlayerCardSmall;
