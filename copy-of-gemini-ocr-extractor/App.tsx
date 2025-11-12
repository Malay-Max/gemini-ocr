
import React, { useState, useCallback } from 'react';
import { useLocalStorage } from './hooks/useLocalStorage';
import { fileToBase64 } from './utils/fileUtils';
import { extractTextFromImage } from './services/geminiService';
import { HistoryItem } from './types';
import ImageUploader from './components/ImageUploader';
import ExtractedTextDisplay from './components/ExtractedTextDisplay';
import HistoryPanel from './components/HistoryPanel';
import Button from './components/Button';
import { Icon } from './components/icons';
import UploadNextImage from './components/UploadNextImage';

const MAX_HISTORY_ITEMS = 5;

function App() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [extractedText, setExtractedText] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useLocalStorage<HistoryItem[]>('ocr-history', []);

  const handleImageSelect = (file: File) => {
    setImageFile(file);
    setImageUrl(URL.createObjectURL(file));
    setError(null);
  };

  const handleClearImage = useCallback(() => {
    if (imageUrl) URL.revokeObjectURL(imageUrl);
    setImageFile(null);
    setImageUrl(null);
  }, [imageUrl]);

  const handleReset = useCallback(() => {
    handleClearImage();
    setExtractedText('');
    setError(null);
  }, [handleClearImage]);

  const handleNextImageSelect = (file: File) => {
    handleReset();
    handleImageSelect(file);
  };

  const handleOcr = useCallback(async () => {
    if (!imageFile) {
      setError('Please select an image first.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setExtractedText('');

    try {
      const { base64, mimeType } = await fileToBase64(imageFile);
      const { text, title } = await extractTextFromImage(base64, mimeType);
      setExtractedText(text);

      setHistory(prevHistory => {
        const newItem: HistoryItem = {
          id: crypto.randomUUID(),
          title,
          text,
          timestamp: Date.now(),
        };
        const newHistory = [newItem, ...prevHistory];
        return newHistory.slice(0, MAX_HISTORY_ITEMS);
      });

    } catch (e: unknown) {
      if (e instanceof Error) {
        setError(e.message);
      } else {
        setError('An unknown error occurred.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [imageFile, setHistory]);

  const handleSelectHistoryItem = (text: string) => {
    setExtractedText(text);
    handleClearImage();
    setError(null);
  };

  const handleDeleteHistoryItem = (id: string) => {
    setHistory(history.filter(item => item.id !== id));
  };
  
  const handleClearHistory = () => {
    setHistory([]);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans">
      <main className="container mx-auto p-4 md:p-8">
        <header className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-600">
            Gemini OCR Extractor
          </h1>
          <p className="mt-2 text-lg text-gray-400">
            Upload an image and let AI extract the text for you.
          </p>
        </header>

        {error && (
          <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-md relative mb-6 flex justify-between items-center" role="alert">
            <span className="block sm:inline">{error}</span>
            <button onClick={() => setError(null)} className="p-1 rounded-full hover:bg-red-800/50">
                <Icon name="close" className="w-5 h-5"/>
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 bg-gray-800 p-6 rounded-xl shadow-lg flex flex-col space-y-4">
            <div className="bg-gray-900/50 p-2 rounded-lg flex-grow h-[32rem] md:h-[36rem]">
              {(!extractedText && !isLoading) ? (
                <ImageUploader onImageSelect={handleImageSelect} imageUrl={imageUrl} onClear={handleClearImage} />
              ) : (
                <ExtractedTextDisplay text={extractedText} isLoading={isLoading} />
              )}
            </div>
            
            {extractedText && !isLoading ? (
              <UploadNextImage onImageSelect={handleNextImageSelect} />
            ) : (
              <Button
                onClick={handleOcr}
                disabled={!imageFile || isLoading}
                className="w-full text-lg py-3"
              >
                {isLoading ? 'Processing...' : 'Extract Text'}
              </Button>
            )}
          </div>

          <div className="md:col-span-1 h-[32rem] md:h-auto">
             <HistoryPanel 
                history={history} 
                onSelect={handleSelectHistoryItem} 
                onDelete={handleDeleteHistoryItem} 
                onClear={handleClearHistory} 
             />
          </div>
        </div>
        <footer className="text-center mt-12 text-gray-500">
          <p>Powered by Google Gemini 2.5 Pro. Built with React & Tailwind CSS.</p>
        </footer>
      </main>
    </div>
  );
}

export default App;