import { Leaf } from 'lucide-react';
import logoUrl from '@/assets/agritrust-logo.svg';

export default function Footer() {
  return (
    <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-emerald-900 text-white border-t border-gray-700">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Logo and Brand */}
          <div className="flex items-center gap-3">
            <img
              src={logoUrl}
              alt="AgriTrust"
              className="h-8 w-auto"
            />
            <span className="text-lg font-heading font-bold">AgriTrust</span>
          </div>

          {/* Copyright */}
          <div className="text-center md:text-right">
            <p className="text-sm text-gray-300 font-body">
              Copyright 2025 AgriTrust. All rights reserved.
            </p>
          </div>
        </div>

        {/* Tagline */}
        <div className="mt-6 pt-6 border-t border-gray-700 text-center">
          <p className="text-sm text-emerald-300 font-body flex items-center justify-center gap-2">
            <Leaf className="h-4 w-4" />
            Trust in every harvest.
          </p>
        </div>
      </div>
    </footer>
  );
}
