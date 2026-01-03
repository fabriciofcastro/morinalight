"use client";

import { Building2, ChevronRight, GitFork } from "lucide-react";
import type { BranchHierarchy } from "@/types/branch-hierarchy";
import { BRANCH_TYPE_LABELS } from "@/types/branch-hierarchy";

interface BranchHierarchyTreeProps {
    hierarchy: BranchHierarchy[];
    highlightId?: string;
    onSelect?: (branch: BranchHierarchy) => void;
}

function TreeNode({
    branch,
    level = 0,
    isLast = false,
    highlightId,
    onSelect,
}: {
    branch: BranchHierarchy;
    level?: number;
    isLast?: boolean;
    highlightId?: string;
    onSelect?: (branch: BranchHierarchy) => void;
}) {
    const hasChildren = branch.children && branch.children.length > 0;
    const isHighlighted = branch.id === highlightId;

    return (
        <div>
            <div
                className={`flex items-center gap-2 p-3 rounded-lg transition-colors ${isHighlighted
                    ? "bg-blue-500/20 border border-blue-500/30"
                    : "hover:bg-white/5 border border-transparent"
                    } ${onSelect ? "cursor-pointer" : ""}`}
                style={{ marginLeft: `${level * 24}px` }}
                onClick={() => onSelect?.(branch)}
            >
                {/* Connector line */}
                {level > 0 && (
                    <div className="flex items-center">
                        <div
                            className={`w-4 h-px ${isLast ? "bg-white/20" : "bg-white/20"}`}
                        />
                    </div>
                )}

                {/* Icon */}
                <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center ${branch.active ? "bg-green-500/20" : "bg-gray-500/20"
                        }`}
                >
                    <Building2
                        className={`w-4 h-4 ${branch.active ? "text-green-400" : "text-gray-400"
                            }`}
                    />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <span className="font-medium text-white truncate">
                            {branch.name}
                        </span>
                        <span className="text-xs text-white/50">({branch.code})</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-white/50 mt-0.5">
                        <span>{BRANCH_TYPE_LABELS[branch.type]}</span>
                        {hasChildren && (
                            <>
                                <span>•</span>
                                <span className="flex items-center gap-1">
                                    <GitFork className="w-3 h-3" />
                                    {branch.children?.length || 0} filha{(branch.children?.length || 0) > 1 ? "is" : ""}
                                </span>
                            </>
                        )}
                    </div>
                </div>

                {/* Level indicator */}
                <div className="text-xs font-mono text-white/30 px-2 py-1 rounded bg-white/5">
                    N{level}
                </div>
            </div>

            {/* Children */}
            {hasChildren && (
                <div className="mt-1">
                    {branch.children!.map((child, idx) => (
                        <TreeNode
                            key={child.id}
                            branch={child}
                            level={level + 1}
                            isLast={idx === branch.children!.length - 1}
                            highlightId={highlightId}
                            onSelect={onSelect}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

export function BranchHierarchyTree({
    hierarchy,
    highlightId,
    onSelect,
}: BranchHierarchyTreeProps) {
    if (hierarchy.length === 0) {
        return (
            <div className="text-center py-12">
                <Building2 className="w-16 h-16 mx-auto text-gray-500 mb-4" />
                <p className="text-gray-400">Nenhuma estrutura hierárquica definida</p>
            </div>
        );
    }

    return (
        <div className="space-y-2">
            {hierarchy.map((branch, idx) => (
                <TreeNode
                    key={branch.id}
                    branch={branch}
                    level={0}
                    isLast={idx === hierarchy.length - 1}
                    highlightId={highlightId}
                    onSelect={onSelect}
                />
            ))}
        </div>
    );
}
