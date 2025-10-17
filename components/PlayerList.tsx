

import React from 'react';
import { Player } from '../types';
import PlayerCard from './PlayerCard';

interface PlayerListProps {
  players: Player[];
  selectedTeamIds: Set<number>;
  onSelectPlayer: (player: Player) => void;
  onViewDetails: (player: Player) => void;
  budget: number;
}

const PlayerList: React.FC<PlayerListProps> = ({ players, selectedTeamIds, onSelectPlayer, onViewDetails, budget }) => {
  return (
    <div className="w-full mt-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-5">
        {players
          .filter(p => p.status !== 'stand-in')
          .map((player) => {
            const isSelected = selectedTeamIds.has(player.id);
            const isAffordable = player.price <= budget;
            const isDisabled = player.status === 'banned' || (!isSelected && !isAffordable) || (!isSelected && selectedTeamIds.size >= 5);

            return (
              <PlayerCard
                key={player.id}
                player={player}
                isSelected={isSelected}
                isDisabled={isDisabled}
                onSelect={onSelectPlayer}
                onViewDetails={onViewDetails}
              />
            );
        })}
      </div>
    </div>
  );
};

export default PlayerList;