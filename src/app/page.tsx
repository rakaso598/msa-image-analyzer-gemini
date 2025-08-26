'use client';

import { useState } from 'react';
import Image from 'next/image';

interface AnalysisResult {
  analysis?: string;
  response?: string;
  result?: string;
  error?: string;
}

function HomePage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [query, setQuery] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [showErrorModal, setShowErrorModal] = useState(false);

  // 결과 텍스트를 포맷팅하는 함수
  const formatAnalysisResult = (data: AnalysisResult): string => {
    const text = data.result || data.analysis || data.response || '';

    // **텍스트** -> 볼드로 변환하고 HTML 반환
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br/>');
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setError('');
      setResult(null);
    }
  };

  const handleQueryChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setQuery(event.target.value);
  };

  const handleApiKeyChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setApiKey(event.target.value);
  };

  const closeErrorModal = () => {
    setShowErrorModal(false);
    setError('');
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!selectedFile || !query || !apiKey) {
      setError('Please select an image, enter a question, and provide your x-api-key.');
      setShowErrorModal(true);
      return;
    }

    setIsLoading(true);
    setError('');
    setResult(null);

    try {
      // 파일을 Base64로 변환
      const reader = new FileReader();
      reader.onload = async () => {
        const base64String = reader.result as string;

        // API 호출
        const response = await fetch('/api/analyze', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            image: base64String,
            query: query,
            apiKey: apiKey,
          }),
        });

        const data = await response.json(); if (!response.ok) {
          throw new Error(data.error || 'Failed to analyze image');
        }

        setResult(data);
      };

      reader.readAsDataURL(selectedFile);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setShowErrorModal(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navigation Bar */}
      <nav className="border-b border-gray-800 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-white rounded-sm"></div>
            <span className="font-semibold text-lg">Image Analyzer</span>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            AI Image Analyzer
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Upload an image and ask questions about it. Get instant AI-powered analysis with detailed insights.
          </p>
        </div>

        {/* Form Container */}
        <div className="max-w-2xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* API Key Input */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-gray-700 transition-colors">
              <label htmlFor="api-key" className="block text-sm font-medium text-gray-300 mb-3">
                x-api-key
              </label>
              <input
                type="password"
                id="api-key"
                className="w-full p-4 bg-black border border-gray-800 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                placeholder="Enter your x-api-key value"
                value={apiKey}
                onChange={handleApiKeyChange}
              />
            </div>

            {/* File Upload */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-gray-700 transition-colors">
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Upload Image
              </label>
              <input
                type="file"
                id="image-upload"
                className="hidden"
                onChange={handleFileChange}
                accept="image/*"
              />
              <label
                htmlFor="image-upload"
                className="block w-full p-8 border-2 border-dashed border-gray-700 rounded-lg text-center cursor-pointer hover:border-gray-600 hover:bg-gray-800/50 transition-all group"
              >
                <div className="flex flex-col items-center space-y-2">
                  <div className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center group-hover:bg-gray-700 transition-colors">
                    📁
                  </div>
                  <span className="text-gray-300 font-medium">
                    {selectedFile ? 'Change Image' : 'Choose an Image'}
                  </span>
                  <span className="text-gray-500 text-sm">
                    Support for PNG, JPG, GIF up to 10MB
                  </span>
                </div>
              </label>

              {/* Image Preview */}
              {previewUrl && (
                <div className="mt-6">
                  <Image
                    src={previewUrl}
                    alt="Preview"
                    width={400}
                    height={300}
                    className="w-full max-h-64 object-cover rounded-lg border border-gray-800"
                  />
                </div>
              )}
            </div>

            {/* Query Input */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-gray-700 transition-colors">
              <label htmlFor="query" className="block text-sm font-medium text-gray-300 mb-3">
                Question
              </label>
              <textarea
                id="query"
                className="w-full p-4 bg-black border border-gray-800 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-white placeholder-gray-500 transition-colors"
                placeholder="What can you see in this image? Describe the scene, objects, or ask specific questions..."
                value={query}
                onChange={handleQueryChange}
                rows={4}
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className={`w-full py-4 px-6 rounded-lg font-semibold text-lg transition-all transform ${isLoading
                  ? 'bg-gray-700 text-gray-300 cursor-wait'
                  : 'bg-white text-black hover:bg-gray-100 hover:scale-[1.02] active:scale-[0.98]'
                } disabled:bg-gray-600 disabled:text-gray-400 disabled:cursor-not-allowed`}
              disabled={!selectedFile || !query || !apiKey || isLoading}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-gray-400 border-t-white mr-3"></div>
                  <span>Analyzing Image...</span>
                </div>
              ) : (
                'Analyze Image'
              )}
            </button>
          </form>

          {/* Loading State */}
          {isLoading && (
            <div className="mt-8 bg-gray-900 border border-gray-800 rounded-xl p-8 text-center">
              <div className="animate-pulse">
                <div className="w-16 h-16 bg-gray-800 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent"></div>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Analyzing your image...</h3>
                <p className="text-gray-400">This may take a few moments. Please wait.</p>
              </div>
            </div>
          )}

          {/* Result Display */}
          {result && !isLoading && (
            <div className="mt-8 bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-gray-700 transition-colors">
              <div className="flex items-center space-x-2 mb-6">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <h2 className="text-xl font-semibold text-white">Analysis Complete</h2>
                <div className="flex-1"></div>
                <div className="text-xs text-gray-500 bg-gray-800 px-2 py-1 rounded">
                  AI Generated
                </div>
              </div>

              <div className="bg-black border border-gray-800 rounded-lg p-6">
                <div
                  className="text-gray-100 leading-relaxed prose prose-invert max-w-none"
                  dangerouslySetInnerHTML={{
                    __html: formatAnalysisResult(result)
                  }}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 mt-4">
                <button
                  onClick={() => {
                    const text = result.result || result.analysis || result.response || '';
                    navigator.clipboard.writeText(text.replace(/\*\*(.*?)\*\*/g, '$1').replace(/\*(.*?)\*/g, '$1'));
                  }}
                  className="px-3 py-1 text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 rounded transition-colors"
                >
                  Copy Text
                </button>
                <button
                  onClick={() => setResult(null)}
                  className="px-3 py-1 text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 rounded transition-colors"
                >
                  Clear Result
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Error Modal */}
      {showErrorModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-red-600 rounded-xl max-w-md w-full p-6 transform transition-all">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white text-sm font-bold">!</span>
              </div>
              <h3 className="text-lg font-semibold text-white">Error</h3>
            </div>
            <p className="text-gray-300 mb-6 leading-relaxed">
              {error}
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={closeErrorModal}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default HomePage;
