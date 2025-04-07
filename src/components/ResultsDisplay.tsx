import React from 'react';
import { ScanResult, TestResult } from '../types';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { AlertTriangle, CheckCircle, XCircle, Clock, ChevronDown, ChevronUp, Info } from 'lucide-react';

interface ResultsDisplayProps {
  result: ScanResult | null;
}

const getSeverityColor = (severity?: string) => {
  switch (severity) {
    case 'critical':
      return 'text-red-700';
    case 'high':
      return 'text-red-600';
    case 'medium':
      return 'text-orange-500';
    case 'low':
      return 'text-yellow-500';
    default:
      return 'text-gray-600';
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'passed':
      return <CheckCircle className="text-green-500" size={20} />;
    case 'failed':
      return <XCircle className="text-red-500" size={20} />;
    case 'warning':
      return <AlertTriangle className="text-yellow-500" size={20} />;
    default:
      return <Info className="text-blue-500" size={20} />;
  }
};

const TestResultItem: React.FC<{ result: TestResult }> = ({ result }) => {
  const [expanded, setExpanded] = React.useState(false);
  const severityColor = getSeverityColor(result.severity);
  
  return (
    <div className="mb-4 border rounded-lg overflow-hidden">
      <div 
        className={`flex items-center justify-between p-4 cursor-pointer ${
          result.status === 'passed' ? 'bg-green-50' : 
          result.status === 'failed' ? 'bg-red-50' : 'bg-yellow-50'
        }`}
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center">
          {getStatusIcon(result.status)}
          <div className="ml-3">
            <h3 className="text-sm font-medium">{result.name}</h3>
            <p className="text-xs text-gray-500">{result.description}</p>
          </div>
        </div>
        <div className="flex items-center">
          {result.severity && (
            <span className={`text-xs font-medium mr-2 px-2 py-0.5 rounded-full ${
              result.severity === 'critical' ? 'bg-red-100 text-red-800' :
              result.severity === 'high' ? 'bg-red-100 text-red-800' :
              result.severity === 'medium' ? 'bg-orange-100 text-orange-800' :
              'bg-yellow-100 text-yellow-800'
            }`}>
              {result.severity.toUpperCase()}
            </span>
          )}
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </div>
      
      {expanded && result.details && (
        <div className="p-4 bg-gray-50 border-t">
          <pre className="text-xs whitespace-pre-wrap">{result.details}</pre>
        </div>
      )}
    </div>
  );
};

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ result }) => {
  const [showRawResponse, setShowRawResponse] = React.useState(false);
  
  if (!result) {
    return null;
  }

  const passedTests = result.results.filter(r => r.status === 'passed').length;
  const failedTests = result.results.filter(r => r.status === 'failed').length;
  const warningTests = result.results.filter(r => r.status === 'warning').length;
  
  // Safely stringify the raw response
  let safeRawResponse = "No response data available";
  try {
    if (result.rawResponse) {
      safeRawResponse = JSON.stringify(result.rawResponse, null, 2);
    }
  } catch (error) {
    safeRawResponse = "Error displaying response data: " + 
      (error instanceof Error ? error.message : String(error));
  }
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-2">Security Scan Results</h2>
        <div className="flex flex-wrap gap-2 text-sm text-gray-600 mb-4">
          <div className="flex items-center">
            <Clock size={16} className="mr-1" />
            <span>Completed: {new Date(result.timestamp).toLocaleString()}</span>
          </div>
          {result.responseTime && (
            <div className="flex items-center">
              <Clock size={16} className="mr-1" />
              <span>Response time: {result.responseTime}ms</span>
            </div>
          )}
          {result.statusCode && (
            <div className="flex items-center">
              <Info size={16} className="mr-1" />
              <span>Status code: {result.statusCode}</span>
            </div>
          )}
        </div>
        
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex items-center bg-green-100 text-green-800 px-3 py-1 rounded-full">
            <CheckCircle size={16} className="mr-1" />
            <span>{passedTests} Passed</span>
          </div>
          <div className="flex items-center bg-red-100 text-red-800 px-3 py-1 rounded-full">
            <XCircle size={16} className="mr-1" />
            <span>{failedTests} Failed</span>
          </div>
          <div className="flex items-center bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full">
            <AlertTriangle size={16} className="mr-1" />
            <span>{warningTests} Warnings</span>
          </div>
        </div>
        
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Endpoint Details</h3>
          <div className="bg-gray-50 p-3 rounded border">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div>
                <span className="text-sm font-medium text-gray-500">URL:</span>
                <span className="text-sm ml-2 break-all">{result.endpoint.url}</span>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">Method:</span>
                <span className="text-sm ml-2">{result.endpoint.method}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-4">Test Results</h3>
        <div className="space-y-2">
          {result.results.map((testResult, index) => (
            <TestResultItem key={index} result={testResult} />
          ))}
        </div>
      </div>
      
      {result.rawResponse && (
        <div className="mb-4">
          <button
            onClick={() => setShowRawResponse(!showRawResponse)}
            className="flex items-center text-sm text-indigo-600 hover:text-indigo-800 mb-2"
          >
            {showRawResponse ? <ChevronUp size={16} className="mr-1" /> : <ChevronDown size={16} className="mr-1" />}
            {showRawResponse ? 'Hide Raw Response' : 'Show Raw Response'}
          </button>
          
          {showRawResponse && (
            <div className="border rounded-md overflow-hidden">
              <SyntaxHighlighter
                language="json"
                style={vscDarkPlus}
                customStyle={{ margin: 0, maxHeight: '400px' }}
              >
                {safeRawResponse}
              </SyntaxHighlighter>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ResultsDisplay;