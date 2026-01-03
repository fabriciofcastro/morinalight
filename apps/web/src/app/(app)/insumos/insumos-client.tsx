"use client";

import { Button } from "@morina/ui";
import { Package, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export function InsumosClient() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4 md:p-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="relative">
            <div className="absolute -inset-px bg-linear-to-r from-blue-500/0 to-blue-500/0 rounded-lg group-hover:from-blue-500/30 group-hover:to-blue-400/30 blur-sm transition-all duration-300" />
            <div className="relative p-6 rounded-lg border border-white/20 bg-white/5 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Package className="h-8 w-8 text-blue-400" />
                  <div>
                    <h1 className="text-3xl font-bold text-white">Insumos</h1>
                    <p className="text-white/60">Gerencie seus insumos e aviamentos</p>
                  </div>
                </div>
                <Button
                  onClick={() => router.push("/insumos/new")}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Insumo
                </Button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Lista de Insumos */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="relative"
        >
          <div className="absolute -inset-px bg-linear-to-r from-blue-500/0 to-blue-500/0 rounded-lg group-hover:from-blue-500/30 group-hover:to-blue-400/30 blur-sm transition-all duration-300" />
          <div className="relative p-6 rounded-lg border border-white/20 bg-white/5 backdrop-blur-sm">
            <p className="text-white/60 text-center py-8">
              Lista de insumos será implementada em breve
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}





