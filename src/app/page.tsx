'use client';

import { useState } from 'react';
import Image from 'next/image';

interface AnalysisResult {
  analysis?: string;
  response?: string;
  error?: string;
}

export default function Home() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [query, setQuery] = useState('');
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

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!selectedFile || !query) {
      setError('Please select an image and enter a question.');
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 px-4 py-6">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <header className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">📸 Image Analyzer</h1>
          <p className="text-gray-600">Upload an image and ask a question.</p>
        </header>

        {/* Main Form */}
        <main>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* File Input */}
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <input
                type="file"
                id="image-upload"
                className="hidden"
                onChange={handleFileChange}
                accept="image/*"
              />
              <label
                htmlFor="image-upload"
                className="block w-full p-4 border-2 border-dashed border-gray-300 rounded-lg text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors"
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
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <textarea
                className="w-full p-4 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none"
                placeholder="What can you see in this image?"
                value={query}
                onChange={handleQueryChange}
                rows={3}
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-4 px-6 rounded-xl font-semibold text-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors shadow-lg"
              disabled={!selectedFile || !query || isLoading}
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
            <div className="mt-6 bg-red-50 border border-red-200 rounded-xl p-4">
              <p className="text-red-600 text-center">{error}</p>
            </div>
          )}

          {/* Result Display */}
          {result && (
            <div className="mt-6 bg-white rounded-xl p-6 shadow-lg">
              <h2 className="text-xl font-semibold text-gray-800 mb-3">Analysis Result</h2>
              <p className="text-gray-700 leading-relaxed">{result.analysis || result.response || JSON.stringify(result)}</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
