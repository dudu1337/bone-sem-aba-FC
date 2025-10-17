import React from 'react';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  setTitle: (title: string) => void;
  onExport: () => void;
  isLoading: boolean;
}

const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose, title, setTitle, onExport, isLoading }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 transition-opacity"
      onClick={onClose}
    >
      <div
        className="bg-gray-800 rounded-xl shadow-2xl p-6 w-full max-w-md border border-gray-700 m-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-2xl font-bold text-white">Exportar Imagem do Time</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl">&times;</button>
        </div>

        <div className="space-y-4">
          <div>
            <label htmlFor="export-title" className="block text-sm font-medium text-gray-300 mb-1">
              Título da Imagem
            </label>
            <input
              type="text"
              id="export-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:outline-none"
              placeholder="Ex: Time da Rodada 5"
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition"
            disabled={isLoading}
          >
            Cancelar
          </button>
          <button
            onClick={onExport}
            className="px-4 py-2 bg-orange-600 text-white font-bold rounded-lg hover:bg-orange-500 transition disabled:bg-orange-800 disabled:cursor-wait"
            disabled={isLoading}
          >
            {isLoading ? 'Gerando...' : 'Gerar Imagem'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExportModal;