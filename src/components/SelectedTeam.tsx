import React from 'react';
import { Player } from '../types';
import PlayerCard from './PlayerCard';

interface SelectedTeamProps {
  team: Player[];
  onSelectPlayer: (player: Player) => void;
  onViewDetails: (player: Player) => void;
  onExportClick: () => void;
}

const PlaceholderSlot: React.FC = () => (
    <div className="flex-shrink-0 w-64 h-[500px] bg-gray-800/50 border-2 border-dashed border-gray-600 rounded-2xl flex flex-col items-center justify-center text-gray-500 text-center p-2">
       <span className="text-sm">Vaga</span>
       <span className="text-5xl font-bold">+</span>
    </div>
  );

const SelectedTeam: React.FC<SelectedTeamProps> = ({ team, onSelectPlayer, onViewDetails, onExportClick }) => {
  const slots = 5;
  const filledSlots = team.map(player => (
    <div key={player.id} className="flex-shrink-0 w-64">
      <PlayerCard 
        player={player}
        isSelected={true}
        isDisabled={false}
        onSelect={onSelectPlayer}
        onViewDetails={onViewDetails}
      />
    </div>
  ));
  const emptySlots = Array(slots - team.length).fill(null).map((_, index) => <PlaceholderSlot key={`placeholder-${index}`} />);

  return (
    <div className="bg-gray-900 py-4 rounded-lg flex-grow">
        <div className="flex justify-center items-center mb-3 px-4">
          <h3 className="text-lg font-semibold text-gray-300 text-center">Meu Time</h3>
          <button 
            onClick={onExportClick}
            disabled={team.length === 0}
            className="ml-4 bg-orange-600 hover:bg-orange-700 text-white font-bold py-1 px-3 rounded-lg text-xs disabled:bg-gray-600 disabled:cursor-not-allowed"
          >
            Exportar Time
          </button>
        </div>
        <div className="flex flex-row gap-4 justify-center items-start pb-4 overflow-x-auto">
            {filledSlots}
            {emptySlots}
        </div>
    </div>
  );
};

export default SelectedTeam;
