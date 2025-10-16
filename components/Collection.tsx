import React from 'react';
import { Player } from '../types';
import PlayerCard from './PlayerCard';

interface CollectionProps {
  players: Player[];
  onViewDetails: (player: Player) => void;
}

const Collection: React.FC<CollectionProps> = ({ players, onViewDetails }) => {
  return (
    <div className="w-full mt-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-5">
        {players.map((player) => (
          <PlayerCard
            key={player.id}
            player={player}
            isSelected={false}
            isDisabled={player.status === 'banned'}
            onSelect={() => {}} // Ação de seleção desabilitada
            onViewDetails={onViewDetails}
            hideActions={true} // Oculta o botão de adicionar/remover
          />
        ))}
      </div>
    </div>
  );
};

export default Collection;