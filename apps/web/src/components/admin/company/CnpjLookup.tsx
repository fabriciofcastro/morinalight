"use client";

import { AlertCircle, Loader2 } from "lucide-react";
import { useState } from "react";

interface CnpjData {
  cnpj: string;
  name: string;
  legal_name: string;
  street: string;
  number: string;
  neighborhood: string;
  city: string;
  state: string;
  zip_code: string;
}

interface CnpjLookupProps {
  onDataFound: (data: CnpjData) => void;
  className?: string;
}

export function CnpjLookup({ onDataFound, className }: CnpjLookupProps) {
  const [cnpj, setCnpj] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const formatCnpj = (value: string) => {
    return value
      .replace(/\D/g, "")
      .replace(/(\d{2})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1/$2")
      .replace(/(\d{4})(\d)/, "$1-$2");
  };

  const handleLookup = async () => {
    const cleanCnpj = cnpj.replace(/\D/g, "");

    if (cleanCnpj.length < 14) {
      setError("CNPJ inválido");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cleanCnpj}`);

      if (!response.ok) {
        throw new Error("CNPJ não encontrado");
      }

      const data = await response.json();
      onDataFound(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao buscar CNPJ");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleLookup();
    }
  };

  return (
    <div className={`space-y-3 ${className || ""}`}>
      <div className="flex gap-2">
        <input
          type="text"
          value={cnpj}
          onChange={(e) => setCnpj(formatCnpj(e.target.value))}
          onKeyPress={handleKeyPress}
          placeholder="00.000.000/0000-00"
          className="flex-1 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2.5 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
        />
        <button
          onClick={handleLookup}
          disabled={loading}
          type="button"
          className="rounded-lg bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 px-4 py-2.5 font-medium text-white transition-all disabled:cursor-not-allowed"
        >
          {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Buscar"}
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/10 dark:border-red-900/50 dark:bg-red-950/30 p-3 text-sm text-red-600 dark:text-red-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}
    </div>
  );
}
