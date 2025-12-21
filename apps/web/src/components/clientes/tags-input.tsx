"use client";

import { useState, useRef, useEffect } from "react";
import { X, Plus, Tag } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Input, Button } from "@morina/ui";

export interface Tag {
  id: string;
  name: string;
  color?: string;
}

interface TagsInputProps {
  tags: Tag[];
  availableTags: Tag[];
  onTagsChange: (tags: Tag[]) => void;
  onCreateTag?: (name: string, color?: string) => Promise<Tag>;
  onRemoveTag?: (tagId: string) => void;
  className?: string;
  placeholder?: string;
  maxTags?: number;
}

const DEFAULT_COLORS = [
  "#3B82F6", // blue
  "#10B981", // green
  "#F59E0B", // amber
  "#EF4444", // red
  "#8B5CF6", // purple
  "#EC4899", // pink
  "#06B6D4", // cyan
  "#84CC16", // lime
];

export function TagsInput({
  tags,
  availableTags,
  onTagsChange,
  onCreateTag,
  onRemoveTag,
  className = "",
  placeholder = "Adicionar tag...",
  maxTags,
}: TagsInputProps) {
  const [inputValue, setInputValue] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Filtrar tags disponíveis que ainda não foram adicionadas
  const filteredSuggestions = availableTags.filter(
    (tag) => !tags.some((t) => t.id === tag.id)
  );

  // Filtrar sugestões baseado no input
  const matchingSuggestions = filteredSuggestions.filter((tag) =>
    tag.name.toLowerCase().includes(inputValue.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleAddTag = (tag: Tag) => {
    if (maxTags && tags.length >= maxTags) {
      return;
    }
    if (!tags.some((t) => t.id === tag.id)) {
      onTagsChange([...tags, tag]);
      setInputValue("");
      setShowSuggestions(false);
    }
  };

  const handleRemoveTag = (tagId: string) => {
    if (onRemoveTag) {
      onRemoveTag(tagId);
    } else {
      onTagsChange(tags.filter((t) => t.id !== tagId));
    }
  };

  const handleCreateTag = async () => {
    if (!inputValue.trim() || !onCreateTag) return;
    if (maxTags && tags.length >= maxTags) return;

    // Verificar se já existe
    const existing = availableTags.find(
      (t) => t.name.toLowerCase() === inputValue.trim().toLowerCase()
    );
    if (existing) {
      handleAddTag(existing);
      return;
    }

    setIsCreating(true);
    try {
      const randomColor = DEFAULT_COLORS[Math.floor(Math.random() * DEFAULT_COLORS.length)];
      const newTag = await onCreateTag(inputValue.trim(), randomColor);
      handleAddTag(newTag);
    } catch (error) {
      console.error("Erro ao criar tag:", error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (matchingSuggestions.length > 0) {
        handleAddTag(matchingSuggestions[0]);
      } else if (inputValue.trim() && onCreateTag) {
        void handleCreateTag();
      }
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
      inputRef.current?.blur();
    }
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Tags existentes */}
      <div className="flex flex-wrap gap-2 mb-2">
        <AnimatePresence>
          {tags.map((tag) => (
            <motion.div
              key={tag.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
              style={{
                backgroundColor: tag.color
                  ? `${tag.color}20`
                  : "var(--muted-soft)",
                color: tag.color || "inherit",
                border: `1px solid ${tag.color ? `${tag.color}40` : "transparent"}`,
              }}
            >
              <Tag className="h-3 w-3" />
              <span>{tag.name}</span>
              <button
                onClick={() => handleRemoveTag(tag.id)}
                className="hover:opacity-70 transition-opacity ml-0.5"
                type="button"
              >
                <X className="h-3 w-3" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Input para adicionar tags */}
      <div className="relative">
        <Input
          ref={inputRef}
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            setShowSuggestions(true);
          }}
          onFocus={() => setShowSuggestions(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={isCreating || (maxTags ? tags.length >= maxTags : false)}
          className="w-full"
        />

        {/* Sugestões */}
        <AnimatePresence>
          {showSuggestions && (matchingSuggestions.length > 0 || (inputValue.trim() && onCreateTag)) && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute z-50 w-full mt-1 bg-[var(--bg)] border border-[color-mix(in oklab,var(--muted-soft)_20%,transparent)] rounded-lg shadow-lg max-h-60 overflow-y-auto"
            >
              {matchingSuggestions.length > 0 && (
                <div className="p-2">
                  <p className="text-xs text-[color-mix(in oklab,var(--muted-soft)_70%,var(--fg)_30%)] px-2 py-1 mb-1">
                    Tags disponíveis
                  </p>
                  {matchingSuggestions.map((tag) => (
                    <button
                      key={tag.id}
                      onClick={() => handleAddTag(tag)}
                      className="w-full text-left px-2 py-1.5 rounded hover:bg-[color-mix(in oklab,var(--muted-soft)_10%,transparent)] transition-colors flex items-center gap-2"
                      type="button"
                    >
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: tag.color || "#3B82F6" }}
                      />
                      <span className="text-sm">{tag.name}</span>
                    </button>
                  ))}
                </div>
              )}
              {inputValue.trim() && onCreateTag && (
                <div className="p-2 border-t border-[color-mix(in oklab,var(--muted-soft)_20%,transparent)]">
                  <button
                    onClick={handleCreateTag}
                    disabled={isCreating}
                    className="w-full text-left px-2 py-1.5 rounded hover:bg-[color-mix(in oklab,var(--muted-soft)_10%,transparent)] transition-colors flex items-center gap-2 text-sm"
                    type="button"
                  >
                    <Plus className="h-4 w-4" />
                    {isCreating ? "Criando..." : `Criar tag "${inputValue.trim()}"`}
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}


