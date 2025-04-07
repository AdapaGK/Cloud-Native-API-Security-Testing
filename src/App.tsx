import React, { useState } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import ApiForm, { ApiFormData } from './components/ApiForm';
import ResultsDisplay from './components/ResultsDisplay';
import { runApiTest } from './utils/apiTester';
import { ScanResult } from './types';
import { Shield, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

function App() {
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: ApiFormData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await runApiTest(data.endpoint, data.selectedTests);
      setScanResult(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      console.error('Error running API test:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-4">
            <div className="mb-6">
              <h2 className="text-xl font-bold mb-2">API Security Scanner</h2>
              <p className="text-gray-600">
                Test your cloud-native APIs for common security vulnerabilities and misconfigurations.
              </p>
            </div>
            
            <ApiForm onSubmit={handleSubmit} isLoading={isLoading} />
            
            {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
                <div className="flex">
                  <AlertTriangle className="text-red-500 mr-2" size={20} />
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              </div>
            )}
          </div>
          
          <div className="lg:col-span-8">
            {scanResult ? (
              <ResultsDisplay result={scanResult} />
            ) : (
              <div className="bg-white p-6 rounded-lg shadow-md h-full flex flex-col items-center justify-center text-center">
                <Shield size={64} className="text-indigo-300 mb-4" />
                <h3 className="text-xl font-semibold mb-2">No Scan Results Yet</h3>
                <p className="text-gray-500 mb-6 max-w-md">
                  Enter an API endpoint URL and click "Test API Security" to start scanning for vulnerabilities.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-2xl">
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <CheckCircle size={24} className="text-green-500 mx-auto mb-2" />
                    <h4 className="font-medium text-sm mb-1">Authentication</h4>
                    <p className="text-xs text-gray-500">Verify proper authentication mechanisms</p>
                  </div>
                  
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <AlertTriangle size={24} className="text-yellow-500 mx-auto mb-2" />
                    <h4 className="font-medium text-sm mb-1">Data Exposure</h4>
                    <p className="text-xs text-gray-500">Check for sensitive data leakage</p>
                  </div>
                  
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <XCircle size={24} className="text-red-500 mx-auto mb-2" />
                    <h4 className="font-medium text-sm mb-1">CORS & Headers</h4>
                    <p className="text-xs text-gray-500">Validate security headers and CORS config</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}

export default App;