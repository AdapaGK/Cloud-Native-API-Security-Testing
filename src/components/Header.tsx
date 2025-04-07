import React from 'react';
import { Shield } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-6">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Shield size={32} className="mr-2" />
            <div>
              <h1 className="text-2xl font-bold">API Security Scanner</h1>
              <p className="text-indigo-100 text-sm">Cloud-Native API Security Testing Tool</p>
            </div>
          </div>
          <div className="hidden md:block">
            <div className="flex space-x-4">
              <a 
                href="https://github.com/your-username/api-security-scanner" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-indigo-100 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
              >
                GitHub
              </a>
              <a 
                href="#" 
                className="text-indigo-100 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
              >
                Documentation
              </a>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;