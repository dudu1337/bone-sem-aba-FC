import React from 'react';
import { Player } from '../types';
import PlayerCard from './PlayerCard';

interface RatingHistoryProps {
  players: Player[];
  onViewDetails: (player: Player) => void;
}

const RatingHistory: React.FC<RatingHistoryProps> = ({ players, onViewDetails }) => {
  const sortedPlayers = [...players]
    .filter(p => p.status !== 'banned' && p.status !== 'stand-in')
    .sort((a, b) => b.overall - a.overall);

  return (
    <main>
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-300">Histórico de Ratings</h2>
        <p className="text-orange-400">Acompanhe a evolução do overall dos jogadores do mix.</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-8">
        {sortedPlayers.map(player => (
          <div key={player.id} className="bg-gray-800/70 rounded-lg p-4 border border-gray-700/50 flex flex-col items-center">
            <div className="w-full max-w-xs mb-4">
                 <PlayerCard
                    player={player}
                    onSelect={() => {}}
                    onViewDetails={onViewDetails}
                    isSelected={false}
                    isDisabled={true}
                    hideActions={true}
                />
            </div>
            <div className="space-y-2 w-full max-w-xs">
              <h4 className="text-sm font-semibold text-gray-400 text-center mb-2">Evolução do Jogador:</h4>
               <div className="grid grid-cols-2 items-center text-center text-xs text-gray-500 px-2 font-bold">
                  <span className="text-left">Data</span>
                  <span>Overall</span>
              </div>
              {player.ratingHistory.length > 0 ? (
                player.ratingHistory.map((rating, index) => {
                    const previousRating = player.ratingHistory[index - 1];
                    
                    const overallChange = previousRating ? rating.overall - previousRating.overall : 0;
                    const overallChangeColor = overallChange > 0 ? 'text-green-400' : overallChange < 0 ? 'text-red-400' : 'text-gray-500';
                    const overallChangeSign = overallChange > 0 ? '+' : '';

                    return (
                        <div key={rating.date} className="grid grid-cols-2 items-center bg-gray-900/50 p-2 rounded-md">
                            <span className="text-xs text-gray-400 text-left">{rating.date}</span>
                            <div className="flex items-center justify-center">
                                <span className="font-bold text-lg">{rating.overall}</span>
                                {index > 0 && (
                                    <span className={`text-xs font-semibold ml-1.5 ${overallChangeColor}`}>
                                        ({overallChangeSign}{overallChange})
                                    </span>
                                )}
                            </div>
                        </div>
                    );
                })
              ) : (
                <p className="text-sm text-gray-500 text-center">Nenhum histórico disponível.</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
};

export default RatingHistory;