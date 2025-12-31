"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@morina/ui";
import {
    Building2,
    ChevronDown,
    ChevronRight,
    User,
    Users,
} from "lucide-react";
import { useState } from "react";

interface DepartmentNode {
    id: string;
    name: string;
    code: string;
    level: number;
    manager?: { name: string };
    users: Array<{ id: string; name: string }>;
    children: DepartmentNode[];
    sectors?: Array<{
        id: string;
        name: string;
        coordinator?: { name: string };
        users: number;
    }>;
}

interface HierarchyTreeProps {
    data: DepartmentNode[];
    onNodeClick?: (node: DepartmentNode) => void;
}

function TreeNode({
    node,
    onNodeClick,
    level = 0,
}: {
    node: DepartmentNode;
    onNodeClick?: (node: DepartmentNode) => void;
    level?: number;
}) {
    const [isExpanded, setIsExpanded] = useState(level < 2); // Expandir primeiros 2 níveis
    const hasChildren = node.children && node.children.length > 0;
    const hasSectors = node.sectors && node.sectors.length > 0;

    const indentation = level * 24;

    return (
        <div className="space-y-2">
            {/* Departamento */}
            <div
                className="flex items-center gap-2 group cursor-pointer hover:bg-white/5 rounded-lg p-2 transition-colors"
                style={{ marginLeft: `${indentation}px` }}
                onClick={() => onNodeClick?.(node)}
            >
                {/* Expand/Collapse */}
                {hasChildren || hasSectors ? (
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 flex-shrink-0"
                        onClick={(e) => {
                            e.stopPropagation();
                            setIsExpanded(!isExpanded);
                        }}
                    >
                        {isExpanded ? (
                            <ChevronDown className="h-4 w-4" />
                        ) : (
                            <ChevronRight className="h-4 w-4" />
                        )}
                    </Button>
                ) : (
                    <div className="w-6" />
                )}

                {/* Icon */}
                <div
                    className={`flex items-center justify-center w-8 h-8 rounded-lg ${level === 0
                        ? "bg-blue-500"
                        : level === 1
                            ? "bg-purple-500"
                            : "bg-green-500"
                        }`}
                >
                    <Building2 className="h-4 w-4 text-white" />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <span className="font-semibold truncate text-white">{node.name}</span>
                        <Badge variant="outline" className="text-xs">
                            {node.code}
                        </Badge>
                        {level > 0 && (
                            <Badge variant="secondary" className="text-xs">
                                Nível {node.level}
                            </Badge>
                        )}
                    </div>
                    {node.manager && (
                        <p className="text-xs text-white/50">
                            Gerente: {node.manager.name}
                        </p>
                    )}
                </div>

                {/* Stats */}
                <div className="flex items-center gap-4 flex-shrink-0">
                    {node.users && node.users.length > 0 && (
                        <div className="flex items-center gap-1 text-xs text-white/50">
                            <Users className="h-3 w-3" />
                            <span>{node.users.length}</span>
                        </div>
                    )}
                    {hasSectors && (
                        <Badge variant="secondary" className="text-xs">
                            {node.sectors!.length} setores
                        </Badge>
                    )}
                </div>
            </div>

            {/* Children - Subdepartamentos */}
            {isExpanded && hasChildren && (
                <div className="space-y-2">
                    {node.children.map((child) => (
                        <TreeNode
                            key={child.id}
                            node={child}
                            onNodeClick={onNodeClick}
                            level={level + 1}
                        />
                    ))}
                </div>
            )}

            {/* Setores */}
            {isExpanded && hasSectors && (
                <div
                    className="space-y-1"
                    style={{ marginLeft: `${indentation + 48}px` }}
                >
                    {node.sectors!.map((sector) => (
                        <div
                            key={sector.id}
                            className="flex items-center gap-2 p-2 hover:bg-white/5 rounded-lg transition-colors"
                        >
                            <div className="flex items-center justify-center w-6 h-6 rounded bg-indigo-500/20">
                                <div className="w-2 h-2 rounded-full bg-indigo-500" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <span className="text-sm font-medium truncate text-white">
                                    {sector.name}
                                </span>
                                {sector.coordinator && (
                                    <p className="text-xs text-white/50">
                                        Coord.: {sector.coordinator.name}
                                    </p>
                                )}
                            </div>
                            <div className="flex items-center gap-1 text-xs text-white/50">
                                <User className="h-3 w-3" />
                                <span>{sector.users}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export function HierarchyTree({ data, onNodeClick }: HierarchyTreeProps) {
    if (!data || data.length === 0) {
        return (
            <div className="bg-white/5 border border-white/10 rounded-lg">
                <div className="p-12 text-center">
                    <Building2 className="h-12 w-12 mx-auto mb-4 text-white/30" />
                    <p className="text-white/50">
                        Nenhuma estrutura organizacional configurada
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white/5 border border-white/10 rounded-lg">
            <div className="p-6">
                <div className="space-y-2">
                    {data.map((node) => (
                        <TreeNode
                            key={node.id}
                            node={node}
                            onNodeClick={onNodeClick}
                            level={0}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}

export type { DepartmentNode, HierarchyTreeProps };
