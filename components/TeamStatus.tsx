import React from 'react';

interface TeamStatusProps {
  patrimony: number;
  teamValue: number;
  roundPoints: number;
  valorization: number;
}

const TeamStatus: React.FC<TeamStatusProps> = ({ patrimony, teamValue, roundPoints, valorization }) => {
  const valorizationColor = valorization > 0 ? 'text-green-400' : valorization < 0 ? 'text-red-400' : 'text-gray-400';
  const valorizationSign = valorization > 0 ? '+' : '';

  return (
    <div className="bg-gray-800 rounded-lg p-3 grid grid-cols-2 md:grid-cols-4 gap-2 text-center shadow-lg w-full">
      <div className="px-2">
        <span className="text-xs sm:text-sm font-semibold text-gray-400 uppercase tracking-wider">Patrimônio</span>
        <p className="text-lg sm:text-xl font-bold text-orange-400">${patrimony.toFixed(2)}</p>
      </div>
      <div className="px-2">
        <span className="text-xs sm:text-sm font-semibold text-gray-400 uppercase tracking-wider">Valor do Time</span>
        <p className="text-lg sm:text-xl font-bold text-gray-100">${teamValue.toFixed(2)}</p>
      </div>
      <div className="px-2">
        <span className="text-xs sm:text-sm font-semibold text-gray-400 uppercase tracking-wider">Pontos na Rodada</span>
        <p className="text-lg sm:text-xl font-bold text-orange-400">{roundPoints.toFixed(2)}</p>
      </div>
       <div className="px-2">
        <span className="text-xs sm:text-sm font-semibold text-gray-400 uppercase tracking-wider">Valorização</span>
        <p className={`text-lg sm:text-xl font-bold ${valorizationColor}`}>
          {valorizationSign}{valorization.toFixed(2)}
        </p>
      </div>
    </div>
  );
};

export default TeamStatus;