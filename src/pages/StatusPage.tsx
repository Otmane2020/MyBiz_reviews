import React from "react";
import { Server } from "lucide-react";

const StatusPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#4285F4]/10 via-[#34A853]/10 to-[#FBBC05]/10 p-6">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
        <div className="flex justify-center mb-4">
          <Server className="w-12 h-12 text-[#34A853]" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">État du service</h1>
        <p className="text-gray-600 mb-4">
          Tous les systèmes <strong>Starlinko</strong> fonctionnent normalement ✅
        </p>
        <p className="text-sm text-gray-500">Dernière mise à jour : {new Date().toLocaleString("fr-FR")}</p>
      </div>
    </div>
  );
};

export default StatusPage;
