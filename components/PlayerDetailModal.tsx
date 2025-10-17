import React, { useState } from 'react';
import { Player, Match } from '../types';

interface PlayerDetailModalProps {
  player: Player | null;
  onClose: () => void;
}

const PointBreakdown: React.FC<{ match: Match }> = ({ match }) => {
  const hsKills = Math.round(match.kills * (match.headshotPercentage / 100));
  const normalKills = match.kills - hsKills;
  const killPoints = (normalKills * 2) + (hsKills * 2 * 1.3);
  const deathPoints = match.deaths * -1;
  const assistPoints = match.assists * 0.5;
  const winBonus = match.won ? Math.abs(match.team1Score - match.team2Score) * 1.5 : 0;

  return (
    <div className="bg-gray-800/50 p-4">
      <h4 className="text-md font-bold text-orange-400 mb-2">Detalhes da Pontuação</h4>
      <ul className="text-sm space-y-1 text-gray-300">
        <li className="flex justify-between"><span>Kills Normais ({normalKills} x 2)</span> <span>+{(normalKills * 2).toFixed(2)}</span></li>
        <li className="flex justify-between"><span>Kills HS ({hsKills} x 2.6)</span> <span>+{ (hsKills * 2.6).toFixed(2)}</span></li>
        <li className="flex justify-between"><span>Mortes ({match.deaths} x -1)</span> <span className="text-red-400">{deathPoints.toFixed(2)}</span></li>
        <li className="flex justify-between"><span>Assistências ({match.assists} x 0.5)</span> <span>+{assistPoints.toFixed(2)}</span></li>
        {match.won && <li className="flex justify-between"><span>Bônus de Vitória</span> <span>+{winBonus.toFixed(2)}</span></li>}
        <li className="border-t border-gray-600 mt-2 pt-2 flex justify-between font-bold"><span>Total</span> <span>{match.points.toFixed(2)}</span></li>
      </ul>
       <p className="text-xs text-gray-500 mt-4">
            Cálculo: +2/kill, -1/morte, +0.5/assist. Kill com HS tem multiplicador de 1.3 (2.6 pts). Bônus de vitória: (placar final A - placar final B) * 1.5.
       </p>
    </div>
  );
};

const PlayerDetailModal: React.FC<PlayerDetailModalProps> = ({ player, onClose }) => {
  if (!player) return null;

  const [expandedMatchId, setExpandedMatchId] = useState<string | null>(null);

  const toggleMatchDetails = (matchId: string) => {
    setExpandedMatchId(prevId => (prevId === matchId ? null : matchId));
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 transition-opacity"
      onClick={onClose}
    >
      <div 
        className="bg-gray-900 rounded-xl shadow-2xl p-6 w-full max-w-2xl border border-gray-700 m-4 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex-shrink-0">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-4">
                <img src={player.photoUrl} alt={player.name} className="w-20 h-20 rounded-full border-4 border-orange-500 object-cover" />
                <div>
                  <h2 className="text-3xl font-bold text-white">{player.name}</h2>
                </div>
              </div>
              <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl">&times;</button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 text-center my-4">
              <div className="bg-gray-800 p-3 rounded-lg"><div className="text-xs text-gray-400">Preço</div><div className="text-xl font-bold text-green-400">${player.price.toFixed(2)}</div></div>
              <div className="bg-gray-800 p-3 rounded-lg"><div className="text-xs text-gray-400">KDA Total</div><div className="text-xl font-bold">{`${player.totalKills}/${player.totalDeaths}/${player.totalAssists}`}</div></div>
              <div className="bg-gray-800 p-3 rounded-lg"><div className="text-xs text-gray-400">K/D Ratio</div><div className="text-xl font-bold">{player.kdRatio.toFixed(2)}</div></div>
              <div className="bg-gray-800 p-3 rounded-lg"><div className="text-xs text-gray-400">HS% Médio</div><div className="text-xl font-bold">{player.avgHeadshotPercentage}%</div></div>
              <div className="bg-gray-800 p-3 rounded-lg"><div className="text-xs text-gray-400">Pontos (Série)</div><div className="text-xl font-bold text-orange-400">{player.lastMatchPoints.toFixed(2)}</div></div>
            </div>
        </div>
        
        <div className="flex-grow overflow-y-auto mt-4 pr-2 -mr-2">
            <h3 className="text-lg font-semibold mb-2 sticky top-0 bg-gray-900 py-2">Histórico de Partidas (clique para detalhar)</h3>
            {player.seriesHistory.length > 0 ? (
                <div className="space-y-4">
                {player.seriesHistory.map((series) => (
                    <div key={series.id} className="bg-gray-800/70 rounded-lg overflow-hidden">
                    <div className="bg-gray-700/60 p-3">
                        <p className="font-bold text-orange-400 tracking-wide">{series.title}</p>
                    </div>
                    <div className="p-2 space-y-2">
                        {series.matches.map((match) => (
                        <div key={match.id} className="bg-gray-800 rounded-lg overflow-hidden transition-all">
                            <div 
                            className="p-4 cursor-pointer hover:bg-gray-700/50"
                            onClick={() => toggleMatchDetails(match.id)}
                            >
                            <div className="flex justify-between items-center">
                                <div>
                                <p className="font-bold">{match.map} - <span className={match.won ? 'text-green-400' : 'text-red-400'}>{match.won ? 'Vitória' : 'Derrota'}</span></p>
                                <p className="text-sm text-gray-400">Placar: {match.team1Score} x {match.team2Score}</p>
                                </div>
                                <div className="text-right">
                                <p className="font-bold text-lg">{match.points.toFixed(2)} PTS</p>
                                <p className="text-sm text-gray-400">{`${match.kills}K / ${match.deaths}D / ${match.assists}A`}</p>
                                </div>
                            </div>
                            </div>
                            {expandedMatchId === match.id && <PointBreakdown match={match}/>}
                        </div>
                        ))}
                    </div>
                    </div>
                ))}
                </div>
            ) : (
                <p className="text-gray-500">Nenhuma partida recente.</p>
            )}
        </div>
      </div>
    </div>
  );
};

export default PlayerDetailModal;