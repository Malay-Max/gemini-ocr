
import React from 'react';
import { HistoryItem } from '../types';
import Button from './Button';
import { Icon } from './icons';

interface HistoryPanelProps {
  history: HistoryItem[];
  onSelect: (text: string) => void;
  onDelete: (id: string) => void;
  onClear: () => void;
}

const HistoryPanel: React.FC<HistoryPanelProps> = ({ history, onSelect, onDelete, onClear }) => {
  return (
    <div className="bg-gray-800/50 p-4 rounded-lg h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Icon name="history" />
          History
        </h2>
        <Button variant="danger" onClick={onClear} disabled={history.length === 0} className="px-2 py-1 text-xs">
          Clear All
        </Button>
      </div>
      {history.length === 0 ? (
        <div className="flex-grow flex items-center justify-center text-gray-500">
          <p>Your past extractions will appear here.</p>
        </div>
      ) : (
        <ul className="space-y-2 overflow-y-auto flex-grow">
          {history.map((item) => (
            <li
              key={item.id}
              className="group p-3 bg-gray-700 rounded-md flex justify-between items-center hover:bg-gray-600 transition-colors"
            >
              <button onClick={() => onSelect(item.text)} className="text-left flex-1 truncate">
                <p className="text-sm font-semibold text-gray-100 truncate pr-2">{item.title}</p>
                <p className="text-xs text-gray-400 mt-1">{new Date(item.timestamp).toLocaleString()}</p>
              </button>
              <button
                onClick={() => onDelete(item.id)}
                className="p-1 text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label={`Delete history item titled '${item.title}'`}
              >
                <Icon name="trash" className="w-4 h-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default HistoryPanel;