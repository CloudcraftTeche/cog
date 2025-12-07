"use client";

import React from "react";
import { User } from "lucide-react";

export const PageHeader: React.FC = () => {
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 text-white">
      <div className="absolute inset-0 bg-black/10"></div>
      <div className="relative px-6 py-12">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
              <User className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Teacher Profile</h1>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};