
import React, { useState } from 'react';
import { Icon } from './icons';

interface ExtractedTextDisplayProps {
  text: string;
  isLoading: boolean;
}

const ExtractedTextDisplay: React.FC<ExtractedTextDisplayProps> = ({ text, isLoading }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'extracted-text.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-400">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-400"></div>
        <p className="mt-4 text-lg">Extracting text...</p>
      </div>
    );
  }

  if (!text) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        <p>Extracted text will appear here.</p>
      </div>
    );
  }

  return (
    <div className="relative h-full">
      <div className="absolute top-2 right-2 flex space-x-2">
        <button
          onClick={handleCopy}
          className="p-2 bg-gray-700 rounded-md text-gray-300 hover:bg-gray-600 hover:text-white transition-colors"
          aria-label="Copy text"
        >
          {copied ? <span className="text-sm text-green-400">Copied!</span> : <Icon name="copy" className="w-5 h-5" />}
        </button>
        <button
          onClick={handleDownload}
          className="p-2 bg-gray-700 rounded-md text-gray-300 hover:bg-gray-600 hover:text-white transition-colors"
          aria-label="Download text"
        >
          <Icon name="download" className="w-5 h-5" />
        </button>
      </div>
      <textarea
        readOnly
        value={text}
        className="w-full h-full p-4 bg-gray-800 border border-gray-700 rounded-lg resize-none text-gray-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
        aria-label="Extracted Text"
      />
    </div>
  );
};

export default ExtractedTextDisplay;
