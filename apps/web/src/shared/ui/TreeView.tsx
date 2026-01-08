'use client';

import { cn } from '@/lib/utils';
import { ChevronDown, ChevronRight, File, Folder, LucideIcon } from 'lucide-react';
import React from 'react';

export interface TreeItem {
  id: string;
  label: string;
  icon?: LucideIcon;
  children?: TreeItem[];
  metadata?: Record<string, any>;
}

interface TreeViewProps {
  items: TreeItem[];
  onSelect?: (item: TreeItem) => void;
  className?: string;
  initialExpanded?: boolean;
}

export function TreeView({ items, onSelect, className, initialExpanded = false }: TreeViewProps) {
  return (
    <div className={cn("space-y-1", className)}>
      {items.map((item) => (
        <TreeItemNode 
          key={item.id} 
          item={item} 
          onSelect={onSelect} 
          depth={0} 
          initialExpanded={initialExpanded}
        />
      ))}
    </div>
  );
}

interface TreeItemNodeProps {
  item: TreeItem;
  onSelect?: (item: TreeItem) => void;
  depth: number;
  initialExpanded: boolean;
}

const TreeItemNode = React.memo(function TreeItemNode({ 
  item, 
  onSelect, 
  depth, 
  initialExpanded 
}: TreeItemNodeProps) {
  const [isExpanded, setIsExpanded] = React.useState(initialExpanded);
  const hasChildren = item.children && item.children.length > 0;
  
  const Icon = item.icon || (hasChildren ? Folder : File);

  const handleToggle = React.useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(prev => !prev);
  }, []);

  const handleSelect = React.useCallback(() => {
    onSelect?.(item);
  }, [onSelect, item]);

  return (
    <div className="select-none">
      <div 
        className={cn(
          "flex items-center py-2 px-2 hover:bg-muted/50 rounded-md cursor-pointer transition-colors text-sm",
          depth > 0 && "ml-4 border-l border-muted-foreground/20 pl-4"
        )}
        onClick={handleSelect}
      >
        <div className="flex items-center gap-2 flex-1">
          {hasChildren ? (
            <button 
              onClick={handleToggle}
              className="p-0.5 hover:bg-muted rounded-sm transition-colors"
            >
              {isExpanded ? (
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              ) : (
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              )}
            </button>
          ) : (
            <div className="w-5" />
          )}
          
          <Icon className={cn("w-4 h-4", hasChildren ? "text-primary" : "text-muted-foreground")} />
          <span className="font-medium">{item.label}</span>
          
          {item.metadata?.count !== undefined && (
            <span className="ml-auto text-[10px] bg-muted px-1.5 py-0.5 rounded-full font-mono">
              {item.metadata.count}
            </span>
          )}
        </div>
      </div>
      
      {hasChildren && isExpanded && (
        <div className="mt-1">
          {item.children!.map((child) => (
            <TreeItemNode 
              key={child.id} 
              item={child} 
              onSelect={onSelect} 
              depth={depth + 1}
              initialExpanded={initialExpanded}
            />
          ))}
        </div>
      )}
    </div>
  );
});

