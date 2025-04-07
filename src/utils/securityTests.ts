import axios from 'axios';
import { ApiEndpoint, SecurityTest, TestResult } from '../types';

// Helper function to safely parse JSON
const safeJsonParse = (str: string): any => {
  try {
    return JSON.parse(str);
  } catch (e) {
    return null;
  }
};

// Helper function to make response data serializable
const makeSerializable = (obj: any): any => {
  if (obj === null || obj === undefined) {
    return obj;
  }
  
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

// Safely execute axios requests with error handling
const safeAxiosRequest = async (config: any): Promise<any> => {
  try {
    return await axios(config);
  } catch (error) {
    // Convert axios errors to a serializable format
    if (axios.isAxiosError(error)) {
      return {
        status: error.response?.status || 500,
        statusText: error.response?.statusText || 'Error',
        headers: makeSerializable(error.response?.headers || {}),
        data: makeSerializable(error.response?.data || { message: error.message }),
      };
    }
    throw error;
  }
};

// Test for missing authentication
export const authenticationTest: SecurityTest = {
  id: 'auth-check',
  name: 'Authentication Check',
  description: 'Checks if the API requires proper authentication',
  run: async (endpoint: ApiEndpoint): Promise<TestResult> => {
    try {
      // Clone the endpoint but remove any auth headers
      const strippedEndpoint = { ...endpoint };
      const strippedHeaders = { ...endpoint.headers };
      
      // Remove common auth headers
      delete strippedHeaders['Authorization'];
      delete strippedHeaders['x-api-key'];
      delete strippedHeaders['api-key'];
      strippedEndpoint.headers = strippedHeaders;

      const response = await safeAxiosRequest({
        method: strippedEndpoint.method,
        url: strippedEndpoint.url,
        headers: strippedEndpoint.headers,
        data: strippedEndpoint.body ? safeJsonParse(strippedEndpoint.body) : undefined,
        validateStatus: () => true, // Don't throw on any status code
        timeout: 30000, // Increased from 10000 to 30000
      });

      // If we get a 2xx status code without auth, that's a problem
      if (response.status >= 200 && response.status < 300) {
        return {
          name: 'Authentication Check',
          status: 'failed',
          description: 'API endpoint accessible without authentication',
          details: `Received status code ${response.status} without authentication headers`,
          severity: 'high',
        };
      } else if (response.status === 401 || response.status === 403) {
        return {
          name: 'Authentication Check',
          status: 'passed',
          description: 'API properly requires authentication',
          details: `Received appropriate status code ${response.status} when authentication was removed`,
        };
      } else {
        return {
          name: 'Authentication Check',
          status: 'warning',
          description: 'Unexpected response when testing authentication',
          details: `Received status code ${response.status} which is neither a success nor an auth error`,
          severity: 'medium',
        };
      }
    } catch (error) {
      return {
        name: 'Authentication Check',
        status: 'warning',
        description: 'Error occurred during authentication test',
        details: error instanceof Error ? error.message : String(error),
        severity: 'medium',
      };
    }
  }
};

// Test for sensitive data exposure
export const sensitiveDataTest: SecurityTest = {
  id: 'sensitive-data',
  name: 'Sensitive Data Exposure',
  description: 'Checks if the API exposes sensitive data in responses',
  run: async (endpoint: ApiEndpoint): Promise<TestResult> => {
    try {
      const response = await safeAxiosRequest({
        method: endpoint.method,
        url: endpoint.url,
        headers: endpoint.headers,
        data: endpoint.body ? safeJsonParse(endpoint.body) : undefined,
        validateStatus: () => true,
        timeout: 30000, // Increased from 10000 to 30000
      });

      // Convert response to string for pattern matching
      // Make sure the data is serializable first
      const safeData = makeSerializable(response.data);
      const responseStr = JSON.stringify(safeData);
      
      // Patterns to look for
      const sensitivePatterns = [
        { pattern: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g, type: 'email' },
        { pattern: /\b(?:\d[ -]*?){13,16}\b/g, type: 'possible credit card' },
        { pattern: /password["']?\s*?:\s*?["']?[^"',\s]+/gi, type: 'password' },
        { pattern: /secret["']?\s*?:\s*?["']?[^"',\s]+/gi, type: 'secret' },
        { pattern: /token["']?\s*?:\s*?["']?[^"',\s]+/gi, type: 'token' },
        { pattern: /key["']?\s*?:\s*?["']?[^"',\s]+/gi, type: 'key' },
        { pattern: /\b(?:[0-9]{3}[-]?[0-9]{2}[-]?[0-9]{4})\b/g, type: 'SSN' },
      ];

      const findings: string[] = [];
      
      sensitivePatterns.forEach(({ pattern, type }) => {
        const matches = responseStr.match(pattern);
        if (matches && matches.length > 0) {
          findings.push(`Found possible ${type} data in response`);
        }
      });

      if (findings.length > 0) {
        return {
          name: 'Sensitive Data Exposure',
          status: 'failed',
          description: 'API may be exposing sensitive data',
          details: findings.join('\n'),
          severity: 'high',
        };
      } else {
        return {
          name: 'Sensitive Data Exposure',
          status: 'passed',
          description: 'No obvious sensitive data found in response',
        };
      }
    } catch (error) {
      return {
        name: 'Sensitive Data Exposure',
        status: 'warning',
        description: 'Error occurred during sensitive data test',
        details: error instanceof Error ? error.message : String(error),
        severity: 'medium',
      };
    }
  }
};

// Test for CORS misconfiguration
export const corsTest: SecurityTest = {
  id: 'cors-check',
  name: 'CORS Configuration',
  description: 'Checks for CORS misconfiguration',
  run: async (endpoint: ApiEndpoint): Promise<TestResult> => {
    try {
      // Send an OPTIONS request to check CORS headers
      const response = await safeAxiosRequest({
        method: 'OPTIONS',
        url: endpoint.url,
        headers: {
          ...endpoint.headers,
          'Origin': 'https://malicious-site.example.com',
          'Access-Control-Request-Method': endpoint.method,
        },
        validateStatus: () => true,
        timeout: 30000, // Increased from 10000 to 30000
      });

      const corsHeaders = {
        'Access-Control-Allow-Origin': response.headers['access-control-allow-origin'],
        'Access-Control-Allow-Methods': response.headers['access-control-allow-methods'],
        'Access-Control-Allow-Headers': response.headers['access-control-allow-headers'],
        'Access-Control-Allow-Credentials': response.headers['access-control-allow-credentials'],
      };

      // Check if wildcard is used with credentials
      const hasWildcard = corsHeaders['Access-Control-Allow-Origin'] === '*';
      const allowsCredentials = corsHeaders['Access-Control-Allow-Credentials'] === 'true';

      if (hasWildcard && allowsCredentials) {
        return {
          name: 'CORS Configuration',
          status: 'failed',
          description: 'Insecure CORS configuration detected',
          details: 'API allows wildcard origin (*) with credentials, which is a security risk',
          severity: 'high',
        };
      } else if (hasWildcard) {
        return {
          name: 'CORS Configuration',
          status: 'warning',
          description: 'Permissive CORS configuration',
          details: 'API allows requests from any origin (*)',
          severity: 'medium',
        };
      } else if (corsHeaders['Access-Control-Allow-Origin']?.includes('malicious-site.example.com')) {
        return {
          name: 'CORS Configuration',
          status: 'failed',
          description: 'CORS validation issue',
          details: 'API accepts requests from untrusted origins',
          severity: 'high',
        };
      } else if (!corsHeaders['Access-Control-Allow-Origin']) {
        return {
          name: 'CORS Configuration',
          status: 'passed',
          description: 'No CORS headers found or CORS is properly restricted',
        };
      } else {
        return {
          name: 'CORS Configuration',
          status: 'passed',
          description: 'CORS appears to be properly configured',
          details: `Origin: ${corsHeaders['Access-Control-Allow-Origin']}`,
        };
      }
    } catch (error) {
      return {
        name: 'CORS Configuration',
        status: 'warning',
        description: 'Error occurred during CORS test',
        details: error instanceof Error ? error.message : String(error),
        severity: 'low',
      };
    }
  }
};

// Test for HTTP security headers
export const securityHeadersTest: SecurityTest = {
  id: 'security-headers',
  name: 'Security Headers',
  description: 'Checks for important security headers',
  run: async (endpoint: ApiEndpoint): Promise<TestResult> => {
    try {
      const response = await safeAxiosRequest({
        method: endpoint.method,
        url: endpoint.url,
        headers: endpoint.headers,
        data: endpoint.body ? safeJsonParse(endpoint.body) : undefined,
        validateStatus: () => true,
        timeout: 30000, // Increased from 10000 to 30000
      });

      const securityHeaders = {
        'Strict-Transport-Security': response.headers['strict-transport-security'],
        'Content-Security-Policy': response.headers['content-security-policy'],
        'X-Content-Type-Options': response.headers['x-content-type-options'],
        'X-Frame-Options': response.headers['x-frame-options'],
        'X-XSS-Protection': response.headers['x-xss-protection'],
      };

      const missingHeaders = Object.entries(securityHeaders)
        .filter(([_, value]) => !value)
        .map(([key]) => key);

      if (missingHeaders.length === 0) {
        return {
          name: 'Security Headers',
          status: 'passed',
          description: 'All recommended security headers are present',
        };
      } else if (missingHeaders.length <= 2) {
        return {
          name: 'Security Headers',
          status: 'warning',
          description: 'Some recommended security headers are missing',
          details: `Missing headers: ${missingHeaders.join(', ')}`,
          severity: 'medium',
        };
      } else {
        return {
          name: 'Security Headers',
          status: 'failed',
          description: 'Multiple important security headers are missing',
          details: `Missing headers: ${missingHeaders.join(', ')}`,
          severity: 'high',
        };
      }
    } catch (error) {
      return {
        name: 'Security Headers',
        status: 'warning',
        description: 'Error occurred during security headers test',
        details: error instanceof Error ? error.message : String(error),
        severity: 'low',
      };
    }
  }
};

// Test for rate limiting
export const rateLimitTest: SecurityTest = {
  id: 'rate-limit',
  name: 'Rate Limiting',
  description: 'Checks if the API implements rate limiting',
  run: async (endpoint: ApiEndpoint): Promise<TestResult> => {
    try {
      // Make multiple requests in quick succession
      const requests = [];
      const startTime = Date.now();
      
      for (let i = 0; i < 5; i++) { // Reduced from 10 to 5 to minimize potential issues
        requests.push(safeAxiosRequest({
          method: endpoint.method,
          url: endpoint.url,
          headers: endpoint.headers,
          data: endpoint.body ? safeJsonParse(endpoint.body) : undefined,
          validateStatus: () => true,
          timeout: 30000, // Increased from 10000 to 30000
        }));
      }

      const responses = await Promise.all(requests);
      const endTime = Date.now();
      const totalTime = endTime - startTime;
      
      // Check if any responses indicate rate limiting
      const rateLimitHeaders = [
        'x-rate-limit-limit',
        'x-rate-limit-remaining',
        'x-rate-limit-reset',
        'retry-after',
        'ratelimit-limit',
        'ratelimit-remaining',
        'ratelimit-reset',
      ];

      // Safely check for rate limit headers
      const hasRateLimitHeaders = responses.some(response => 
        response && response.headers && 
        rateLimitHeaders.some(header => response.headers[header])
      );

      // Safely check for rate limit status codes
      const hasRateLimitStatus = responses.some(response => 
        response && (response.status === 429 || response.status === 503)
      );

      if (hasRateLimitStatus) {
        return {
          name: 'Rate Limiting',
          status: 'passed',
          description: 'API implements rate limiting (received 429 Too Many Requests)',
          details: 'Rate limiting is properly enforced',
        };
      } else if (hasRateLimitHeaders) {
        return {
          name: 'Rate Limiting',
          status: 'passed',
          description: 'API includes rate limit headers',
          details: 'Rate limiting appears to be implemented',
        };
      } else if (totalTime < 1000 && responses.every(r => r && r.status < 400)) {
        return {
          name: 'Rate Limiting',
          status: 'warning',
          description: 'No rate limiting detected',
          details: 'API processed multiple requests quickly without rate limiting',
          severity: 'medium',
        };
      } else {
        return {
          name: 'Rate Limiting',
          status: 'warning',
          description: 'Rate limiting status unclear',
          details: 'Could not definitively determine if rate limiting is implemented',
          severity: 'low',
        };
      }
    } catch (error) {
      return {
        name: 'Rate Limiting',
        status: 'warning',
        description: 'Error occurred during rate limit test',
        details: error instanceof Error ? error.message : String(error),
        severity: 'low',
      };
    }
  }
};

// Combine all tests
export const allTests: SecurityTest[] = [
  authenticationTest,
  sensitiveDataTest,
  corsTest,
  securityHeadersTest,
  rateLimitTest,
];