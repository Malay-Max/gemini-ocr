
import React, { useState, useCallback, useEffect } from 'react';
import { fileToBase64 } from './utils/fileUtils';
import { extractTextFromImage } from './services/geminiService';
import { addHistoryItem, getHistoryItems, deleteHistoryItem, clearHistory } from './services/firestoreService';
import { db } from './firebase/config';
import { HistoryItem } from './types';
import ImageUploader from './components/ImageUploader';
import ExtractedTextDisplay from './components/ExtractedTextDisplay';
import HistoryPanel from './components/HistoryPanel';
import Button from './components/Button';
import { Icon } from './components/icons';
import UploadNextImage from './components/UploadNextImage';
import DebugPanel from './components/DebugPanel';

const MAX_HISTORY_ITEMS = 5;

const formatErrorForDebug = (error: unknown): string => {
    if (error instanceof Error) {
        return `Error Name: ${error.name}\nError Message: ${error.message}\n\nStack Trace:\n${error.stack}`;
    }
    try {
        return `Raw Error Object:\n${JSON.stringify(error, null, 2)}`;
    } catch {
        return `Unknown Error: ${String(error)}`;
    }
};


function App() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [extractedText, setExtractedText] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState<boolean>(true);
  const [showDebug, setShowDebug] = useState<boolean>(false);
  const [debugInfo, setDebugInfo] = useState<string | null>(null);

  useEffect(() => {
    const fetchHistory = async () => {
      setIsHistoryLoading(true);
      setError(null);
      setDebugInfo(null);
      
      if (db.app.options.apiKey === 'AIzaSyDRxqlYeIga-BUPOBuEvuspdyIFdwlRDgk') {
        const configErrorMsg = `Firebase Not Configured
-------------------------
The application is using a placeholder Firebase configuration. To enable persistent history for your extractions, you need to:

1. Create your own project in the Firebase console (https://console.firebase.google.com/).
2. Enable the Firestore database in your new project.
3. Find your project's configuration details in the project settings.
4. Copy and paste your configuration into the 'firebase/config.ts' file in this project.

The history feature is currently disabled.`;
        setError("Firebase is not configured. See debug panel for setup instructions.");
        setDebugInfo(configErrorMsg);
        setShowDebug(true);
        setHistory([]);
        setIsHistoryLoading(false);
        return;
      }

      try {
        const items = await getHistoryItems(MAX_HISTORY_ITEMS);
        setHistory(items);
      } catch (err) {
        console.error("Firestore error:", err);
        setError("Failed to load history. Check the debug panel for details.");
        setDebugInfo(`Operation: Load History\n\n${formatErrorForDebug(err)}`);
        setShowDebug(true);
      } finally {
        setIsHistoryLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const handleImageSelect = (file: File) => {
    setImageFile(file);
    setImageUrl(URL.createObjectURL(file));
    setError(null);
    setDebugInfo(null);
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
    setDebugInfo(null);
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
    setDebugInfo(null);

    try {
      const { base64, mimeType } = await fileToBase64(imageFile);
      const { text, title, rawResponse } = await extractTextFromImage(base64, mimeType);
      
      setExtractedText(text);
      setDebugInfo(rawResponse);

      if (db.app.options.apiKey !== 'AIzaSyDRxqlYeIga-BUPOBuEvuspdyIFdwlRDgk') {
        addHistoryItem({ title, text })
          .then(newItem => {
            setHistory(prevHistory => {
              const newHistory = [newItem, ...prevHistory];
              return newHistory.slice(0, MAX_HISTORY_ITEMS);
            });
          })
          .catch(err => {
            console.error("Failed to save item to history:", err);
            setError("Text extracted, but failed to save to history. See debug panel.");
            setDebugInfo(`Operation: Save to History\n\n${formatErrorForDebug(err)}`);
            setShowDebug(true);
          });
      }

    } catch (e: unknown) {
      if (e instanceof Error) {
        setError(e.message.split('\n\n')[0]); // Show user-friendly part of error
        setDebugInfo(e.message); // Show full error in debug panel
      } else {
        setError('An unknown error occurred.');
        setDebugInfo(String(e));
      }
      setShowDebug(true); // Automatically show debug info on error
    } finally {
      setIsLoading(false);
    }
  }, [imageFile]);

  const handleSelectHistoryItem = (text: string) => {
    setExtractedText(text);
    handleClearImage();
    setError(null);
    setDebugInfo(null);
  };

  const handleDeleteHistoryItem = async (id: string) => {
    const originalHistory = [...history];
    setHistory(history.filter(item => item.id !== id)); // Optimistic update
    try {
      await deleteHistoryItem(id);
    } catch (err) {
      console.error(err);
      setError("Failed to delete history item. See debug panel for details.");
      setDebugInfo(`Operation: Delete History Item (ID: ${id})\n\n${formatErrorForDebug(err)}`);
      setShowDebug(true);
      setHistory(originalHistory); // Revert on failure
    }
  };
  
  const handleClearHistory = async () => {
    const originalHistory = [...history];
    setHistory([]); // Optimistic update
    try {
      await clearHistory();
    } catch (err) {
      console.error(err);
      setError("Failed to clear history. See debug panel for details.");
      setDebugInfo(`Operation: Clear All History\n\n${formatErrorForDebug(err)}`);
      setShowDebug(true);
      setHistory(originalHistory); // Revert on failure
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans">
      {showDebug && <DebugPanel info={debugInfo} onClose={() => setShowDebug(false)} />}
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
                isLoading={isHistoryLoading}
                onSelect={handleSelectHistoryItem} 
                onDelete={handleDeleteHistoryItem} 
                onClear={handleClearHistory} 
             />
          </div>
        </div>
        <footer className="text-center mt-12 text-gray-500">
          <p>Powered by Google Gemini 2.5 Pro. Built with React & Tailwind CSS.</p>
           <div className="mt-4">
              <Button variant="ghost" onClick={() => setShowDebug(!showDebug)} disabled={!debugInfo}>
                {showDebug ? 'Hide' : 'Show'} Debug Info
              </Button>
            </div>
        </footer>
      </main>
    </div>
  );
}

export default App;
