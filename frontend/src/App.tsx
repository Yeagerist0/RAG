import React, { useState } from 'react';
import { DocumentUpload } from './components/DocumentUpload';
import { Chat } from './components/Chat';
import { Brain, AlertCircle } from 'lucide-react';

function App() {
  const [documentUploaded, setDocumentUploaded] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleUploadSuccess = (data: any) => {
    setDocumentUploaded(true);
    setNotification({
      type: 'success',
      message: `Document processed: ${data.data.fileName} (${data.data.chunksCreated} chunks)`,
    });

    setTimeout(() => setNotification(null), 3000);
  };

  const handleUploadError = (error: string) => {
    setNotification({
      type: 'error',
      message: error,
    });

    setTimeout(() => setNotification(null), 3000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4 md:p-8">
      {/* Header */}
      <header className="mb-8 text-center">
        <div className="flex items-center justify-center gap-3 mb-3">
          <Brain className="w-10 h-10 text-blue-600" />
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            NotebookLM RAG
          </h1>
        </div>
        <p className="text-gray-600 text-lg">Chat with your documents using AI-powered Retrieval-Augmented Generation</p>
      </header>

      {/* Notification */}
      {notification && (
        <div
          className={`max-w-2xl mx-auto mb-4 p-4 rounded-lg flex gap-3 ${
            notification.type === 'success'
              ? 'bg-green-100 text-green-800 border border-green-200'
              : 'bg-red-100 text-red-800 border border-red-200'
          }`}
        >
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <p className="text-sm">{notification.message}</p>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sidebar - Upload */}
        <div className="lg:col-span-1">
          <DocumentUpload onSuccess={handleUploadSuccess} onError={handleUploadError} />
        </div>

        {/* Main - Chat */}
        <div className="lg:col-span-2 h-screen lg:h-[600px]">
          <Chat documentUploaded={documentUploaded} />
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-8 text-center text-gray-600 text-sm">
        <p>Powered by OpenAI + Qdrant | RAG with Corrective Pattern</p>
      </footer>
    </div>
  );
}

export default App;
