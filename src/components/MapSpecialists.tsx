import React, { useMemo } from 'react';
import { Player } from '../types';
import { MAP_POOL, MAP_IMAGES } from '../constants';
import PlayerCard from './PlayerCard';

interface MapSpecialistsProps {
  players: Player[];
  onViewDetails: (player: Player) => void;
}

const MIN_MAPS_PLAYED = 3;

const MapSpecialists: React.FC<MapSpecialistsProps> = ({ players, onViewDetails }) => {
  const mapRankings = useMemo(() => {
    return MAP_POOL.map(mapName => {
      const eligiblePlayers = players
        .filter(p => p.status !== 'banned' && p.status !== 'stand-in')
        .map(player => {
          const mapsPlayed = player.seriesHistory.flatMap(s => s.matches).filter(m => m.map === mapName).length;
          return { player, mapsPlayed };
        })
        .filter(({ mapsPlayed }) => mapsPlayed >= MIN_MAPS_PLAYED)
        .map(({ player, mapsPlayed }) => ({
          player,
          winRate: player.winRateByMap[mapName] ?? 0,
          mapsPlayed,
        }))
        .sort((a, b) => b.winRate - a.winRate)
        .slice(0, 5);

      return {
        mapName,
        topPlayers: eligiblePlayers,
      };
    });
  }, [players]);

  return (
    <main>
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-gray-300">Melhores por Mapa</h2>
        <p className="text-orange-400">Os 5 melhores jogadores em cada mapa com base na taxa de vitória (mínimo de {MIN_MAPS_PLAYED} partidas).</p>
      </div>

      <div className="space-y-16">
        {mapRankings.map(({ mapName, topPlayers }) => (
          <div key={mapName}>
            <div className="flex items-center gap-4 mb-6 border-b-2 border-gray-700 pb-3">
              <img src={MAP_IMAGES[mapName]} alt={mapName} className="w-16 h-16 object-cover rounded-lg" />
              <h3 className="text-3xl font-bold text-gray-100 uppercase tracking-wider">{mapName}</h3>
            </div>
            {topPlayers.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
                {topPlayers.map(({ player, winRate, mapsPlayed }, index) => (
                  <div key={player.id} className="relative">
                    <div className="absolute -top-3 -left-3 z-10 bg-orange-500 text-white font-bold w-10 h-10 rounded-full flex items-center justify-center text-xl shadow-lg">
                      {index + 1}
                    </div>
                     <PlayerCard
                        player={player}
                        onSelect={() => {}}
                        onViewDetails={onViewDetails}
                        isSelected={false}
                        isDisabled={true}
                        hideActions={true}
                    />
                    <div className="mt-2 bg-gray-800 text-center rounded-lg p-2">
                        <p className="text-lg font-bold">{winRate}% <span className="text-sm font-normal text-gray-400">Win Rate</span></p>
                        <p className="text-xs text-gray-500">{mapsPlayed} partidas jogadas</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8 bg-gray-800/50 rounded-lg">
                <p>Nenhum jogador elegível para este mapa ainda.</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </main>
  );
};

export default MapSpecialists;
