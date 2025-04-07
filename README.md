# Cloud-Native API Security Testing Tool 🛡️

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5.3-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3.1-blue.svg)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4.2-brightgreen.svg)](https://vitejs.dev/)

A comprehensive web-based tool for testing the security of cloud-native APIs and microservices. This tool helps developers and security professionals identify potential vulnerabilities, misconfigurations, and security risks in their APIs.

![API Security Scanner Dashboard](https://images.unsplash.com/photo-1555949963-aa79dcee981c?auto=format&fit=crop&w=1200&q=80)

## ✨ Key Features

- **Authentication Testing**: Verify proper authentication mechanisms
- **Sensitive Data Detection**: Identify potential data exposure risks
- **CORS Configuration Analysis**: Test for CORS misconfigurations
- **Security Headers Validation**: Check for important security headers
- **Rate Limiting Tests**: Verify API rate limiting implementation
- **Real-time Results**: Instant feedback on security tests
- **Detailed Reporting**: Comprehensive security analysis reports
- **User-friendly Interface**: Clean, intuitive UI for easy testing

## 🚀 Installation

### Prerequisites

- Node.js (v18 or higher)
- npm (v9 or higher)

### Setup Instructions

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/cloud-native-api-security-tester.git
   cd cloud-native-api-security-tester
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

The application will be available at `http://localhost:5173`

## 📖 Usage Guide

1. Enter the API endpoint URL you want to test
2. Select the HTTP method (GET, POST, PUT, DELETE, PATCH)
3. Configure additional options if needed:
   - Add custom headers
   - Include request body (for POST/PUT/PATCH)
   - Select specific security tests to run
4. Click "Test API Security" to start the analysis
5. Review the detailed results and security recommendations

### Example Usage

```typescript
// Example API endpoint configuration
const endpoint = {
  url: 'https://api.example.com/v1/users',
  method: 'GET',
  headers: {
    'Authorization': 'Bearer your-token',
    'Content-Type': 'application/json'
  }
};
```

## ⚙️ Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
VITE_API_TIMEOUT=30000
VITE_MAX_RETRIES=3
```

### Available Configuration Options

| Option | Description | Default |
|--------|-------------|---------|
| `VITE_API_TIMEOUT` | API request timeout (ms) | 30000 |
| `VITE_MAX_RETRIES` | Maximum retry attempts | 3 |

## 🔍 Security Tests

### Available Tests

1. **Authentication Check**
   - Verifies proper authentication implementation
   - Tests token validation
   - Checks for authentication bypass vulnerabilities

2. **Sensitive Data Exposure**
   - Scans for exposed sensitive information
   - Checks for PII in responses
   - Identifies potential data leaks

3. **CORS Configuration**
   - Tests CORS header configuration
   - Validates origin restrictions
   - Checks credentials handling

4. **Security Headers**
   - Verifies presence of security headers
   - Checks header configurations
   - Validates security policies

5. **Rate Limiting**
   - Tests request rate limiting
   - Verifies throttling mechanisms
   - Checks for DDoS protection

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style Guidelines

- Use TypeScript for all new code
- Follow the existing code formatting style
- Add appropriate comments and documentation
- Write unit tests for new features
- Ensure all tests pass before submitting PR

## 🧪 Testing

Run the test suite:

```bash
npm run test
```

### Testing Framework

- Vitest for unit and integration testing
- React Testing Library for component testing
- Axios for API testing

## 📞 Contact & Support

- **Author**: Adapa Greeshmi Karunya
- **Email**: 99220041051@klu.ac.in

### Support Channels

- GitHub Issues for bug reports and feature requests
- Discussions tab for general questions
- Email for private inquiries
