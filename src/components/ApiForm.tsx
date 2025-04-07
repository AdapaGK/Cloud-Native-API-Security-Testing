import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { ApiEndpoint } from '../types';
import { allTests } from '../utils/securityTests';
import { Settings, Send } from 'lucide-react';

interface ApiFormProps {
  onSubmit: (data: ApiFormData) => void;
  isLoading: boolean;
}

export interface ApiFormData {
  endpoint: ApiEndpoint;
  selectedTests: string[];
}

const ApiForm: React.FC<ApiFormProps> = ({ onSubmit, isLoading }) => {
  const { register, handleSubmit, control, watch, formState: { errors } } = useForm<ApiFormData>({
    defaultValues: {
      endpoint: {
        url: '',
        method: 'GET',
        headers: {},
        body: '',
      },
      selectedTests: allTests.map(test => test.id),
    }
  });

  const method = watch('endpoint.method');
  const showBody = method === 'POST' || method === 'PUT' || method === 'PATCH';

  const [showAdvanced, setShowAdvanced] = React.useState(false);
  const [headersText, setHeadersText] = React.useState('');

  // Convert headers text to object when submitting
  const processSubmit = (data: ApiFormData) => {
    try {
      // Parse headers from text area
      if (headersText.trim()) {
        const headerLines = headersText.split('\n');
        const headersObj: Record<string, string> = {};
        
        headerLines.forEach(line => {
          const [key, value] = line.split(':').map(part => part.trim());
          if (key && value) {
            headersObj[key] = value;
          }
        });
        
        data.endpoint.headers = headersObj;
      } else {
        data.endpoint.headers = {};
      }
      
      onSubmit(data);
    } catch (error) {
      console.error('Error processing form data:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit(processSubmit)} className="space-y-6 bg-white p-6 rounded-lg shadow-md">
      <div>
        <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-1">
          API Endpoint URL
        </label>
        <input
          id="url"
          type="url"
          placeholder="https://api.example.com/v1/resource"
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          {...register('endpoint.url', { required: 'URL is required' })}
        />
        {errors.endpoint?.url && (
          <p className="mt-1 text-sm text-red-600">{errors.endpoint.url.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="method" className="block text-sm font-medium text-gray-700 mb-1">
          HTTP Method
        </label>
        <select
          id="method"
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          {...register('endpoint.method')}
        >
          <option value="GET">GET</option>
          <option value="POST">POST</option>
          <option value="PUT">PUT</option>
          <option value="DELETE">DELETE</option>
          <option value="PATCH">PATCH</option>
        </select>
      </div>

      <div>
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center text-sm text-indigo-600 hover:text-indigo-800"
        >
          <Settings size={16} className="mr-1" />
          {showAdvanced ? 'Hide Advanced Options' : 'Show Advanced Options'}
        </button>
      </div>

      {showAdvanced && (
        <>
          <div>
            <label htmlFor="headers" className="block text-sm font-medium text-gray-700 mb-1">
              Headers (one per line, format: Key: Value)
            </label>
            <textarea
              id="headers"
              placeholder="Content-Type: application/json
Authorization: Bearer token"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              rows={4}
              value={headersText}
              onChange={(e) => setHeadersText(e.target.value)}
            />
          </div>

          {showBody && (
            <div>
              <label htmlFor="body" className="block text-sm font-medium text-gray-700 mb-1">
                Request Body (JSON)
              </label>
              <textarea
                id="body"
                placeholder='{"key": "value"}'
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                rows={4}
                {...register('endpoint.body')}
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Security Tests to Run
            </label>
            <div className="space-y-2">
              <Controller
                control={control}
                name="selectedTests"
                render={({ field }) => (
                  <>
                    {allTests.map((test) => (
                      <div key={test.id} className="flex items-start">
                        <input
                          type="checkbox"
                          id={`test-${test.id}`}
                          value={test.id}
                          checked={field.value.includes(test.id)}
                          onChange={(e) => {
                            const value = e.target.value;
                            const newValues = e.target.checked
                              ? [...field.value, value]
                              : field.value.filter((v) => v !== value);
                            field.onChange(newValues);
                          }}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded mt-1"
                        />
                        <label htmlFor={`test-${test.id}`} className="ml-2 block">
                          <span className="text-sm font-medium text-gray-700">{test.name}</span>
                          <p className="text-xs text-gray-500">{test.description}</p>
                        </label>
                      </div>
                    ))}
                  </>
                )}
              />
            </div>
          </div>
        </>
      )}

      <div>
        <button
          type="submit"
          disabled={isLoading}
          className={`w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
            isLoading ? 'opacity-70 cursor-not-allowed' : ''
          }`}
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Testing API...
            </>
          ) : (
            <>
              <Send size={16} className="mr-2" />
              Test API Security
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default ApiForm;