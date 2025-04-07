export interface ApiEndpoint {
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: string;
}

export interface TestResult {
  name: string;
  status: 'passed' | 'failed' | 'warning';
  description: string;
  details?: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
}

export interface ScanResult {
  endpoint: ApiEndpoint;
  timestamp: string;
  results: TestResult[];
  rawResponse?: any;
  responseTime?: number;
  statusCode?: number;
}

export interface SecurityTest {
  id: string;
  name: string;
  description: string;
  run: (endpoint: ApiEndpoint) => Promise<TestResult>;
}