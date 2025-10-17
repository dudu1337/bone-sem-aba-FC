import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { toPng } from 'html-to-image';
import { Player, SavedData } from './types';
import { PLAYERS_DATA, INITIAL_BUDGET } from './constants';
import Header from './components/Header';
import SelectedTeam from './components/SelectedTeam';
import TeamStatus from './components/TeamStatus';
import PlayerList from './components/PlayerList';
import PlayerDetailModal from './components/PlayerDetailModal';
import ExportModal from './components/ExportModal';
import ExportableImage from './components/ExportableImage';
import MatchHistory from './components/MatchHistory';
import Collection from './components/Collection';
import TeamDraft from './components/TeamDraft';
import HallOfFame from './components/HallOfFame';
import RatingHistory from './components/RatingHistory';

const LOCAL_STORAGE_KEY = 'cartolaMixAbençoado';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'cartola' | 'history' | 'collection' | 'draft' | 'hallOfFame' | 'ratingHistory'>('collection');
  const [selectedTeam, setSelectedTeam] = useState<Player[]>([]);
  const [patrimony, setPatrimony] = useState<number>(INITIAL_BUDGET);
  const [roundPoints, setRoundPoints] = useState<number>(0);
  const [valorization, setValorization] = useState<number>(0);
  const [viewingPlayer, setViewingPlayer] = useState<Player | null>(null);

  // Export state
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [exportTitle, setExportTitle] = useState('Meu Time Abençoado');
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const exportableRef = useRef<HTMLDivElement>(null);

  // Carregar dados do localStorage na inicialização
  useEffect(() => {
    try {
      const savedDataString = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (savedDataString) {
        const savedData: SavedData = JSON.parse(savedDataString);
        
        const savedTeamCurrentData = savedData.team.map(savedPlayer => 
            PLAYERS_DATA.find(p => p.id === savedPlayer.id)
        ).filter((p): p is Player => !!p);

        setSelectedTeam(savedTeamCurrentData);
        setPatrimony(savedData.patrimony);

        let calculatedPoints = 0;
        let calculatedValorization = 0;
        
        savedData.team.forEach(savedPlayer => {
          const currentPlayer = PLAYERS_DATA.find(p => p.id === savedPlayer.id);
          if (currentPlayer) {
            calculatedPoints += currentPlayer.lastMatchPoints;
            calculatedValorization += (currentPlayer.price - savedPlayer.price);
          }
        });

        setRoundPoints(calculatedPoints);
        setValorization(calculatedValorization);
        
        setPatrimony(currentPatrimony => currentPatrimony + calculatedValorization);
      }
    } catch (error) {
        console.error("Failed to load or parse data from localStorage", error);
        localStorage.removeItem(LOCAL_STORAGE_KEY);
    }
  }, []);

  // Salvar dados no localStorage sempre que o time mudar
  useEffect(() => {
    try {
        if (selectedTeam.length > 0 || patrimony !== INITIAL_BUDGET) {
            const dataToSave: SavedData = { team: selectedTeam, patrimony };
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(dataToSave));
        }
    } catch (error) {
        console.error("Failed to save data to localStorage", error);
    }
  }, [selectedTeam, patrimony]);

  const teamValue = useMemo(() => {
    return selectedTeam.reduce((sum, player) => sum + player.price, 0);
  }, [selectedTeam]);
  
  const budget = useMemo(() => patrimony - teamValue, [patrimony, teamValue]);

  const selectedTeamIds = useMemo(() => new Set(selectedTeam.map(p => p.id)), [selectedTeam]);

  const handleSelectPlayer = useCallback((player: Player) => {
    setSelectedTeam(currentTeam => {
      const isCurrentlySelected = selectedTeamIds.has(player.id);
      if (isCurrentlySelected) {
        return currentTeam.filter(p => p.id !== player.id);
      }
      const availableBudget = budget + (isCurrentlySelected ? player.price : 0);
      if (currentTeam.length < 5 && player.price <= availableBudget) {
        return [...currentTeam, player];
      }
      return currentTeam;
    });
  }, [budget, selectedTeamIds]);

  const handleViewDetails = useCallback((player: Player) => {
    setViewingPlayer(player);
  }, []);

  const handleCloseModal = useCallback(() => {
    setViewingPlayer(null);
  }, []);

  const handleExportImage = useCallback(async () => {
    if (!exportableRef.current) {
        alert("Erro ao encontrar o componente para exportação.");
        return;
    }
    setIsGeneratingImage(true);
    try {
        const dataUrl = await toPng(exportableRef.current, {
            cacheBust: true,
            pixelRatio: 2, // Aumenta a resolução da imagem
            style: {
                // Força o componente a não usar `transform` que pode interferir na captura
                transform: 'none'
            }
        });
        const link = document.createElement('a');
        const safeTitle = exportTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase();
        link.download = `${safeTitle || 'meu_time'}.png`;
        link.href = dataUrl;
        link.click();
        setIsExportModalOpen(false);
    } catch (err) {
        console.error('Falha ao gerar a imagem:', err);
        alert("Ocorreu um erro ao gerar a imagem. Tente novamente.");
    } finally {
        setIsGeneratingImage(false);
    }
  }, [exportTitle]);

  return (
    <div className="min-h-screen bg-black text-gray-100 p-4 md:p-8">
      <Header />
      
      <div className="container mx-auto max-w-screen-2xl mt-8">
        {/* Tab Navigation */}
        <div className="flex justify-center border-b border-gray-700 mb-6 overflow-x-auto">
          <button
            onClick={() => setActiveTab('collection')}
            className={`flex-shrink-0 px-6 py-3 text-sm font-medium uppercase tracking-wider transition-colors duration-200 ${
              activeTab === 'collection'
                ? 'border-b-2 border-orange-500 text-orange-400'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Coleção
          </button>
          <button
            onClick={() => setActiveTab('draft')}
            className={`flex-shrink-0 px-6 py-3 text-sm font-medium uppercase tracking-wider transition-colors duration-200 ${
              activeTab === 'draft'
                ? 'border-b-2 border-orange-500 text-orange-400'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Bater Times
          </button>
           <button
            onClick={() => setActiveTab('history')}
            className={`flex-shrink-0 px-6 py-3 text-sm font-medium uppercase tracking-wider transition-colors duration-200 ${
              activeTab === 'history'
                ? 'border-b-2 border-orange-500 text-orange-400'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Histórico de Partidas
          </button>
            <button
            onClick={() => setActiveTab('ratingHistory')}
            className={`flex-shrink-0 px-6 py-3 text-sm font-medium uppercase tracking-wider transition-colors duration-200 ${
              activeTab === 'ratingHistory'
                ? 'border-b-2 border-orange-500 text-orange-400'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Histórico de Ratings
          </button>
          <button
            onClick={() => setActiveTab('hallOfFame')}
            className={`flex-shrink-0 px-6 py-3 text-sm font-medium uppercase tracking-wider transition-colors duration-200 ${
              activeTab === 'hallOfFame'
                ? 'border-b-2 border-orange-500 text-orange-400'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Hall da Fama
          </button>
           <button
            onClick={() => setActiveTab('cartola')}
            className={`flex-shrink-0 px-6 py-3 text-sm font-medium uppercase tracking-wider transition-colors duration-200 ${
              activeTab === 'cartola'
                ? 'border-b-2 border-orange-500 text-orange-400'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Cartola
          </button>
        </div>

        {activeTab === 'collection' && (
            <main>
                <h2 className="text-2xl font-bold text-gray-300 mb-4">Coleção de Jogadores</h2>
                <Collection 
                    players={PLAYERS_DATA}
                    onViewDetails={handleViewDetails}
                />
            </main>
        )}

        {activeTab === 'draft' && (
          <main>
            <TeamDraft 
              allPlayers={PLAYERS_DATA} 
              onViewDetails={handleViewDetails} 
            />
          </main>
        )}
        
        {activeTab === 'history' && <MatchHistory />}

        {activeTab === 'ratingHistory' && <RatingHistory players={PLAYERS_DATA} onViewDetails={handleViewDetails} />}

        {activeTab === 'hallOfFame' && <HallOfFame onViewDetails={handleViewDetails} />}
        
        {activeTab === 'cartola' && (
          <main>
            <div className="mb-8">
              <div className="mb-4">
                   <TeamStatus 
                      patrimony={patrimony} 
                      teamValue={teamValue} 
                      roundPoints={roundPoints}
                      valorization={valorization}
                   />
              </div>
              <SelectedTeam 
                team={selectedTeam} 
                onSelectPlayer={handleSelectPlayer} 
                onViewDetails={handleViewDetails}
                onExportClick={() => setIsExportModalOpen(true)}
              />
            </div>

            <h2 className="text-2xl font-bold text-gray-300 mb-4">Mercado de Jogadores</h2>
            <PlayerList 
              players={PLAYERS_DATA}
              selectedTeamIds={selectedTeamIds}
              onSelectPlayer={handleSelectPlayer}
              onViewDetails={handleViewDetails}
              budget={budget}
            />
          </main>
        )}

      </div>

      <PlayerDetailModal player={viewingPlayer} onClose={handleCloseModal} />
      
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        title={exportTitle}
        setTitle={setExportTitle}
        onExport={handleExportImage}
        isLoading={isGeneratingImage}
      />

      {/* Componente para ser renderizado fora da tela para exportação */}
      {isExportModalOpen && (
          <div style={{ position: 'fixed', left: '-9999px', top: 0, zIndex: -1 }}>
             <ExportableImage
                ref={exportableRef}
                title={exportTitle}
                team={selectedTeam}
                patrimony={patrimony}
                teamValue={teamValue}
                roundPoints={roundPoints}
                valorization={valorization}
             />
          </div>
      )}
    </div>
  );
};

export default App;
