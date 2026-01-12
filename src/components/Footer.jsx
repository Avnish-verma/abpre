import React from 'react';
import { Heart } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-white border-t py-6 mt-auto">
      <div className="container mx-auto px-4 text-center">
        <p className="text-gray-600 text-sm">
          © 2026 avnish. All rights reserved.
        </p>
        <div className="flex justify-center items-center gap-1 mt-2 text-xs text-gray-400">
          Made with <Heart size={12} className="text-red-500 fill-red-500" /> for Students
        </div>
      </div>
    </footer>
  );
};

export default Footer;