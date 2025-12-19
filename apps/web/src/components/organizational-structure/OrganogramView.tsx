"use client";

import { GlassCard, cn } from "@morina/ui";
import { Building2, Briefcase, FolderTree, X } from "lucide-react";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";

type Department = {
  id?: string;
  departmentId?: string;
  name: string;
  code: string;
  status: "ativo" | "inativo" | "arquivado";
  sectors?: Array<{
    id: string;
    name: string;
    code: string;
    status: "ativo" | "inativo" | "arquivado";
    positions?: Array<{
      id: string;
      name: string;
      code: string;
      status: "ativo" | "inativo" | "arquivado";
    }>;
  }>;
};

type OrganogramViewProps = {
  departments: Department[];
  onClose?: () => void;
};

type NodePosition = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export function OrganogramView({ departments, onClose }: OrganogramViewProps) {
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Calcular posições dos nós
  const nodePositions = useMemo(() => {
    const positions: Record<string, NodePosition> = {};
    const currentY = 100;
    const nodeWidth = 200;
    const nodeHeight = 80;
    const horizontalSpacing = 250;
    const verticalSpacing = 150;

    departments.forEach((dept, deptIdx) => {
      const deptId = dept.departmentId || dept.id || "";
      if (!deptId) return;
      const deptX = 50 + (deptIdx % 3) * horizontalSpacing;
      const deptY = currentY + Math.floor(deptIdx / 3) * (verticalSpacing * 2);

      positions[`dept-${deptId}`] = {
        x: deptX,
        y: deptY,
        width: nodeWidth,
        height: nodeHeight,
      };

      // Setores
      dept.sectors?.forEach((sector, sectorIdx) => {
        const sectorX = deptX - 100 + (sectorIdx - (dept.sectors?.length || 0) / 2) * horizontalSpacing;
        const sectorY = deptY + verticalSpacing;

        positions[`sector-${sector.id}`] = {
          x: sectorX,
          y: sectorY,
          width: nodeWidth,
          height: nodeHeight,
        };

        // Cargos
        sector.positions?.forEach((position, posIdx) => {
          const posX = sectorX - 50 + (posIdx - (sector.positions?.length || 0) / 2) * (horizontalSpacing * 0.8);
          const posY = sectorY + verticalSpacing;

          positions[`position-${position.id}`] = {
            x: posX,
            y: posY,
            width: nodeWidth * 0.8,
            height: nodeHeight * 0.8,
          };
        });
      });
    });

    return positions;
  }, [departments]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setZoom((prev) => Math.max(0.5, Math.min(2, prev * delta)));
  };

  const getNodeColor = (type: "department" | "sector" | "position", status: string) => {
    if (status !== "ativo") {
      return "bg-gray-500/20 border-gray-500/30 text-gray-400";
    }
    switch (type) {
      case "department":
        return "bg-blue-500/20 border-blue-500/30 text-blue-300";
      case "sector":
        return "bg-purple-500/20 border-purple-500/30 text-purple-300";
      case "position":
        return "bg-green-500/20 border-green-500/30 text-green-300";
      default:
        return "bg-white/10 border-white/20 text-white";
    }
  };

  const getNodeIcon = (type: "department" | "sector" | "position") => {
    switch (type) {
      case "department":
        return Building2;
      case "sector":
        return FolderTree;
      case "position":
        return Briefcase;
      default:
        return Building2;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
    >
      <GlassCard className="relative h-[90vh] w-[95vw] overflow-hidden border-2 border-[hsl(var(--primary))]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 bg-white/5 p-4">
          <div className="flex items-center gap-3">
            <FolderTree className="h-5 w-5 text-[hsl(var(--primary))]" />
            <h3 className="text-lg font-semibold text-white">Organograma</h3>
            <span className="text-xs text-white/50">
              {departments.length} departamento(s) • Zoom: {Math.round(zoom * 100)}%
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setZoom(1)}
              className="rounded border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white hover:bg-white/10 transition-colors"
            >
              Resetar Zoom
            </button>
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
        <div className="relative h-[calc(90vh-4rem)] overflow-auto bg-[radial-gradient(circle_at_50%_50%,hsl(var(--primary))/0.05,transparent_70%)]">
          <svg
            className="absolute inset-0"
            style={{
              width: "100%",
              height: "100%",
              minHeight: "800px",
            }}
          >
            {/* Linhas de conexão */}
            {departments.map((dept) => {
              const deptId = dept.departmentId || dept.id || "";
              if (!deptId) return null;
              const deptPos = nodePositions[`dept-${deptId}`];
              if (!deptPos) return null;

              return dept.sectors?.map((sector) => {
                const sectorPos = nodePositions[`sector-${sector.id}`];
                if (!sectorPos) return null;

                return (
                  <line
                    key={`line-dept-${deptId}-sector-${sector.id}`}
                    x1={deptPos.x + deptPos.width / 2}
                    y1={deptPos.y + deptPos.height}
                    x2={sectorPos.x + sectorPos.width / 2}
                    y2={sectorPos.y}
                    stroke="hsl(var(--primary))"
                    strokeWidth="2"
                    strokeOpacity="0.3"
                  />
                );
              });
            })}

            {departments.map((dept) => {
              const deptId = dept.departmentId || dept.id || "";
              if (!deptId) return null;
              return dept.sectors?.map((sector) => {
                const sectorPos = nodePositions[`sector-${sector.id}`];
                if (!sectorPos) return null;

                return sector.positions?.map((position) => {
                  const posPos = nodePositions[`position-${position.id}`];
                  if (!posPos) return null;

                  return (
                    <line
                      key={`line-sector-${sector.id}-position-${position.id}`}
                      x1={sectorPos.x + sectorPos.width / 2}
                      y1={sectorPos.y + sectorPos.height}
                      x2={posPos.x + posPos.width / 2}
                      y2={posPos.y}
                      stroke="hsl(var(--primary))"
                      strokeWidth="1.5"
                      strokeOpacity="0.2"
                    />
                  );
                });
              });
            })}
          </svg>

          {/* Nós */}
          <div
            className="absolute inset-0"
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              transformOrigin: "top left",
            }}
          >
            {/* Departamentos */}
            {departments.map((dept) => {
              const pos = nodePositions[`dept-${dept.departmentId}`];
              if (!pos) return null;
              const Icon = getNodeIcon("department");
              const isSelected = selectedNode === `dept-${dept.departmentId}`;

              return (
                <motion.div
                  key={`dept-${dept.departmentId}`}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={cn(
                    "absolute cursor-pointer rounded border-2 p-3 transition-all",
                    getNodeColor("department", dept.status),
                    isSelected && "ring-2 ring-[hsl(var(--primary))] ring-offset-2 ring-offset-black",
                  )}
                  style={{
                    left: `${pos.x}px`,
                    top: `${pos.y}px`,
                    width: `${pos.width}px`,
                    minHeight: `${pos.height}px`,
                  }}
                  onClick={() => setSelectedNode(isSelected ? null : `dept-${deptId}`)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="flex items-start gap-2">
                    <Icon className="h-4 w-4 shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate">{dept.name}</p>
                      <p className="text-xs opacity-70 font-mono">{dept.code}</p>
                      {dept.sectors && dept.sectors.length > 0 && (
                        <p className="text-[10px] opacity-50 mt-1">
                          {dept.sectors.length} setor(es)
                        </p>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}

            {/* Setores */}
            {departments.map((dept) => {
              const deptId = dept.departmentId || dept.id || "";
              if (!deptId) return null;
              return dept.sectors?.map((sector) => {
                const pos = nodePositions[`sector-${sector.id}`];
                if (!pos) return null;
                const Icon = getNodeIcon("sector");
                const isSelected = selectedNode === `sector-${sector.id}`;

                return (
                  <motion.div
                    key={`sector-${sector.id}`}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={cn(
                      "absolute cursor-pointer rounded border-2 p-2.5 transition-all",
                      getNodeColor("sector", sector.status),
                      isSelected && "ring-2 ring-[hsl(var(--primary))] ring-offset-2 ring-offset-black",
                    )}
                    style={{
                      left: `${pos.x}px`,
                      top: `${pos.y}px`,
                      width: `${pos.width}px`,
                      minHeight: `${pos.height}px`,
                    }}
                    onClick={() => setSelectedNode(isSelected ? null : `sector-${sector.id}`)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <div className="flex items-start gap-2">
                      <Icon className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold truncate">{sector.name}</p>
                        <p className="text-[10px] opacity-70 font-mono">{sector.code}</p>
                        {sector.positions && sector.positions.length > 0 && (
                          <p className="text-[10px] opacity-50 mt-0.5">
                            {sector.positions.length} cargo(s)
                          </p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              });
            })}

            {/* Cargos */}
            {departments.map((dept) => {
              const deptId = dept.departmentId || dept.id || "";
              if (!deptId) return null;
              return dept.sectors?.map((sector) => {
                return sector.positions?.map((position) => {
                  const pos = nodePositions[`position-${position.id}`];
                  if (!pos) return null;
                  const Icon = getNodeIcon("position");
                  const isSelected = selectedNode === `position-${position.id}`;

                  return (
                    <motion.div
                      key={`position-${position.id}`}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className={cn(
                        "absolute cursor-pointer rounded border p-2 transition-all",
                        getNodeColor("position", position.status),
                        isSelected && "ring-2 ring-[hsl(var(--primary))] ring-offset-2 ring-offset-black",
                      )}
                      style={{
                        left: `${pos.x}px`,
                        top: `${pos.y}px`,
                        width: `${pos.width}px`,
                        minHeight: `${pos.height}px`,
                      }}
                      onClick={() => setSelectedNode(isSelected ? null : `position-${position.id}`)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <div className="flex items-start gap-1.5">
                        <Icon className="h-3 w-3 shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium truncate">{position.name}</p>
                          <p className="text-[10px] opacity-70 font-mono">{position.code}</p>
                        </div>
                      </div>
                    </motion.div>
                  );
                });
              });
            })}
          </div>
        </div>

        {/* Legenda */}
        <div className="absolute bottom-4 left-4 flex gap-3 rounded border border-white/10 bg-black/60 p-3 backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded border border-blue-500/30 bg-blue-500/20" />
            <span className="text-xs text-white/70">Departamento</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded border border-purple-500/30 bg-purple-500/20" />
            <span className="text-xs text-white/70">Setor</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded border border-green-500/30 bg-green-500/20" />
            <span className="text-xs text-white/70">Cargo</span>
          </div>
          <div className="ml-2 border-l border-white/10 pl-3">
            <p className="text-[10px] text-white/50">Arraste para mover • Scroll para zoom</p>
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
}




