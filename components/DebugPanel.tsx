import React from 'react';
import { Icon } from './icons';

interface DebugPanelProps {
  info: string | null;
  onClose: () => void;
}

const DebugPanel: React.FC<DebugPanelProps> = ({ info, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4" aria-modal="true" role="dialog">
      <div className="bg-gray-800 border border-gray-700 rounded-lg shadow-xl w-full max-w-3xl max-h-[80vh] flex flex-col">
        <header className="flex justify-between items-center p-4 border-b border-gray-700 flex-shrink-0">
          <h2 className="text-lg font-semibold text-gray-100">Debug Information</h2>
          <button 
            onClick={onClose} 
            className="p-1 rounded-full text-gray-400 hover:bg-gray-700 hover:text-white transition-colors"
            aria-label="Close debug panel"
          >
            <Icon name="close" className="w-6 h-6" />
          </button>
        </header>
        <main className="p-4 overflow-y-auto">
          <pre className="text-sm text-gray-300 whitespace-pre-wrap break-words">
            <code>{info || 'No debug information available.'}</code>
          </pre>
        </main>
      </div>
    </div>
  );
};

export default DebugPanel;