"use client";

import { GlassCard, cn } from "@morina/ui";
import { Building2, Briefcase, FolderTree, X, Layers } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";
import { DepartmentNode } from "@/components/organizational-structure/organization-tree";
import { Department, Sector, Subdepartment, Position } from "@morina/organizational-structure-domain";

// Deleted legacy View types to avoid confusion
// type PositionView...

type OrganogramViewProps = {
  departments: DepartmentNode[];
  onClose?: () => void;
};

export function OrgTree({ departments, onClose }: OrganogramViewProps) {
  const [zoom, setZoom] = useState(1);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
    >
      <GlassCard className="relative h-[90vh] w-[95vw] overflow-hidden border-2 border-[hsl(var(--primary))]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 bg-white/5 p-4">
          <div className="flex items-center gap-3">
            <FolderTree className="h-5 w-5 text-[hsl(var(--primary))]" />
            <h3 className="text-lg font-semibold text-white">Organograma</h3>
            <span className="text-xs text-white/50">
              {departments.length} departamento(s)
            </span>
          </div>
          <div className="flex items-center gap-2">
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center border border-white/10 bg-white/5 text-white/60 hover:bg-white/10 hover:text-white transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Canvas */}
        <div className="relative h-[calc(90vh-4rem)] overflow-auto bg-[radial-gradient(circle_at_50%_50%,hsl(var(--primary))/0.05,transparent_70%)] flex items-center justify-center">
          <div className="text-center text-white/60">
            <Layers className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">Visualização de Organograma</p>
            <p className="text-sm mt-2 max-w-md mx-auto">
              A visualização em árvore está passando por manutenção.
              Por favor, utilize a visualização em lista por enquanto.
            </p>
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
}
