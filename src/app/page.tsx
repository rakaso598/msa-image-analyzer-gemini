'use client';

import { useState } from 'react';
import Image from 'next/image';

interface AnalysisResult {
  analysis?: string;
  response?: string;
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

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!selectedFile || !query || !apiKey) {
      setError('Please select an image, enter a question, and provide your API key.');
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

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to analyze image');
        }

        setResult(data);
      };

      reader.readAsDataURL(selectedFile);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 px-4 py-6">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <header className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">📸 Image Analyzer</h1>
          <p className="text-gray-300">Upload an image and ask a question.</p>
        </header>

        {/* Main Form */}
        <main>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* API Key Input */}
            <div className="bg-gray-800 rounded-xl p-6 shadow-xl border border-gray-700">
              <label htmlFor="api-key" className="block text-sm font-medium text-gray-200 mb-2">
                API Key
              </label>
              <input
                type="password"
                id="api-key"
                className="w-full p-4 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="Enter your Gemini API key"
                value={apiKey}
                onChange={handleApiKeyChange}
              />
            </div>

            {/* File Input */}
            <div className="bg-gray-800 rounded-xl p-6 shadow-xl border border-gray-700">
              <input
                type="file"
                id="image-upload"
                className="hidden"
                onChange={handleFileChange}
                accept="image/*"
              />
              <label
                htmlFor="image-upload"
                className="block w-full p-4 border-2 border-dashed border-gray-600 rounded-lg text-center cursor-pointer hover:border-blue-500 hover:bg-gray-700 transition-colors text-gray-300"
              >
                {selectedFile ? 'Change Image' : 'Choose an Image'}
              </label>

              {/* Image Preview */}
              {previewUrl && (
                <div className="mt-4">
                  <Image
                    src={previewUrl}
                    alt="Preview"
                    width={300}
                    height={200}
                    className="w-full h-48 object-cover rounded-lg shadow-md"
                  />
                </div>
              )}
            </div>

            {/* Query Input */}
            <div className="bg-gray-800 rounded-xl p-6 shadow-xl border border-gray-700">
              <label htmlFor="query" className="block text-sm font-medium text-gray-200 mb-2">
                Question
              </label>
              <textarea
                id="query"
                className="w-full p-4 bg-gray-700 border border-gray-600 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-white placeholder-gray-400"
                placeholder="What can you see in this image?"
                value={query}
                onChange={handleQueryChange}
                rows={3}
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-4 px-6 rounded-xl font-semibold text-lg hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors shadow-xl"
              disabled={!selectedFile || !query || !apiKey || isLoading}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Analyzing...
                </div>
              ) : (
                'Analyze Image'
              )}
            </button>
          </form>

          {/* Error Display */}
          {error && (
            <div className="mt-6 bg-red-900 border border-red-700 rounded-xl p-4">
              <p className="text-red-200 text-center">{error}</p>
            </div>
          )}

          {/* Result Display */}
          {result && (
            <div className="mt-6 bg-gray-800 rounded-xl p-6 shadow-xl border border-gray-700">
              <h2 className="text-xl font-semibold text-white mb-3">Analysis Result</h2>
              <p className="text-gray-200 leading-relaxed">{result.analysis || result.response || JSON.stringify(result)}</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default HomePage;
