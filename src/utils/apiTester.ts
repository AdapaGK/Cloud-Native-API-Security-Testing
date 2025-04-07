import axios from 'axios';
import { ApiEndpoint, ScanResult, SecurityTest } from '../types';
import { allTests } from './securityTests';

// Helper function to make response data serializable
const makeSerializable = (obj: any): any => {
  if (obj === null || obj === undefined) {
    return obj;
  }
  
  // Handle circular references and non-serializable objects
  try {
    // Test if the object is serializable
    JSON.stringify(obj);
    return obj;
  } catch (error) {
    // If it's not serializable, convert to a string representation
    if (typeof obj === 'object') {
      const result: Record<string, any> = {};
      
      // For arrays
      if (Array.isArray(obj)) {
        return obj.map(item => makeSerializable(item));
      }
      
      // For objects
      for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
          try {
            result[key] = makeSerializable(obj[key]);
          } catch (e) {
            result[key] = `[Non-serializable ${typeof obj[key]}]`;
          }
        }
      }
      return result;
    }
    
    // For other non-serializable types
    return String(obj);
  }
};

export const runApiTest = async (
  endpoint: ApiEndpoint,
  selectedTests: string[] = []
): Promise<ScanResult> => {
  const startTime = Date.now();
  let statusCode: number | undefined;
  let rawResponse: any = undefined;

  // Make an initial request to get basic info
  try {
    const response = await axios({
      method: endpoint.method,
      url: endpoint.url,
      headers: endpoint.headers,
      data: endpoint.body ? JSON.parse(endpoint.body) : undefined,
      validateStatus: () => true, // Don't throw on any status code
      timeout: 30000, // Increased from 10000 to 30000
    });
    
    statusCode = response.status;
    
    // Make sure the response data is serializable
    rawResponse = makeSerializable(response.data);
  } catch (error) {
    console.error('Error making initial request:', error);
    // Make sure error is serializable too
    if (error instanceof Error) {
      rawResponse = { error: error.message };
    } else {
      rawResponse = { error: String(error) };
    }
  }

  // Filter tests if specific ones are selected
  const testsToRun = selectedTests.length > 0
    ? allTests.filter(test => selectedTests.includes(test.id))
    : allTests;

  // Run all selected security tests
  const testPromises = testsToRun.map(async (test) => {
    try {
      return await test.run(endpoint);
    } catch (error) {
      console.error(`Error running test ${test.id}:`, error);
      // Return a fallback test result if the test fails
      return {
        name: test.name,
        status: 'warning' as const,
        description: 'Test execution failed',
        details: error instanceof Error ? error.message : String(error),
        severity: 'medium' as const,
      };
    }
  });
  
  const results = await Promise.all(testPromises);
  const endTime = Date.now();
  
  // Create a serializable result object
  const scanResult: ScanResult = {
    endpoint,
    timestamp: new Date().toISOString(),
    results,
    rawResponse,
    responseTime: endTime - startTime,
    statusCode,
  };
  
  // Final check to ensure everything is serializable
  return makeSerializable(scanResult) as ScanResult;
};