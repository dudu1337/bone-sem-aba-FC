import React, { forwardRef } from 'react';
import { Player } from '../types';
import TeamStatus from './TeamStatus';
import PlayerCard from './PlayerCard';

interface ExportableImageProps {
  title: string;
  team: Player[];
  patrimony: number;
  teamValue: number;
  roundPoints: number;
  valorization: number;
}

// Placeholder para slots vazios na imagem
const ExportPlaceholderSlot: React.FC = () => (
    <div className="h-[500px] bg-gray-800/50 border-2 border-dashed border-gray-600 rounded-2xl flex flex-col items-center justify-center text-gray-500 text-center p-2">
       <span className="text-sm">Vaga</span>
       <span className="text-5xl font-bold">+</span>
    </div>
);


const ExportableImage = forwardRef<HTMLDivElement, ExportableImageProps>(
  ({ title, team, patrimony, teamValue, roundPoints, valorization }, ref) => {

    const slots = 5;
    const filledSlots = team.map(player => (
        <PlayerCard 
            key={player.id}
            player={player}
            isSelected={false} // Apenas visual
            isDisabled={true}   // Apenas visual
            onSelect={() => {}} // Não interativo
            onViewDetails={() => {}} // Não interativo
            isExportView={true} // Oculta o botão
        />
    ));
    const emptySlots = Array(slots - team.length).fill(null).map((_, index) => <ExportPlaceholderSlot key={`placeholder-${index}`} />);


    return (
      <div ref={ref} className="bg-black text-gray-100 p-6" style={{ width: '1344px' }}>
        <h1 className="text-center text-4xl font-bold text-orange-400 tracking-wider mb-4" style={{ fontFamily: 'monospace' }}>
          {title}
        </h1>
        
        <div className="mb-6">
            <TeamStatus
                patrimony={patrimony}
                teamValue={teamValue}
                roundPoints={roundPoints}
                valorization={valorization}
            />
        </div>

        <div className="grid grid-cols-5 gap-4">
          {filledSlots}
          {emptySlots}
        </div>

         <p className="text-center text-xs text-gray-500 mt-6">Gerado pelo Cartola do Mix Abençoado</p>
      </div>
    );
  }
);

export default ExportableImage;