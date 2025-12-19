"use client";

import { Button, Input, Popover, PopoverContent, PopoverTrigger, Tooltip, TooltipContent, TooltipProvider, TooltipTrigger, cn } from "@morina/ui";
import { Check, Search, User, UserCheck } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { getAuthHeadersWithTenant } from "@/lib/auth-client";

type User = {
  userId: string;
  email: string;
  displayName: string | null;
  avatarUrl: string | null;
  status: "pending" | "active" | "suspended" | "inactive";
};

type UserPickerProps = {
  value?: string | null;
  onChange: (userId: string | null) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  allowClear?: boolean;
  showAvatar?: boolean;
  filterByStatus?: Array<"pending" | "active" | "suspended" | "inactive">;
};

export function UserPicker({
  value,
  onChange,
  placeholder = "Selecione um usuário...",
  className,
  disabled = false,
  allowClear = true,
  showAvatar = true,
  filterByStatus,
}: UserPickerProps) {
  const [open, setOpen] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const headers = {
        ...getAuthHeadersWithTenant(),
        "Content-Type": "application/json",
      };
      // Buscar usuários através da API de membros da organização
      // Por enquanto, usar uma busca genérica
      const response = await fetch("/api/users", { headers });
      if (response.ok) {
        const data = await response.json();
        setUsers(data.itens || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open) {
      void loadUsers();
    }
  }, [open, loadUsers]);

  const selectedUser = useMemo(() => {
    if (!value) return null;
    return users.find((u) => u.userId === value) || null;
  }, [value, users]);

  const filteredUsers = useMemo(() => {
    let result = users;

    // Filtrar por status
    if (filterByStatus && filterByStatus.length > 0) {
      result = result.filter((u) => filterByStatus.includes(u.status));
    }

    // Filtrar por busca
    if (search.trim()) {
      const searchLower = search.toLowerCase();
      result = result.filter(
        (u) =>
          u.email.toLowerCase().includes(searchLower) ||
          (u.displayName && u.displayName.toLowerCase().includes(searchLower)),
      );
    }

    return result;
  }, [users, search, filterByStatus]);

  const handleSelect = (userId: string) => {
    onChange(userId);
    setOpen(false);
    setSearch("");
  };

  const handleClear = () => {
    onChange(null);
    setSearch("");
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className={cn("w-full justify-start", className)}
          disabled={disabled}
        >
          {selectedUser ? (
            <div className="flex items-center gap-2">
              {showAvatar && (
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--secondary))] text-xs font-bold text-white">
                  {(selectedUser.displayName || selectedUser.email).charAt(0).toUpperCase()}
                </div>
              )}
              <span className="truncate">
                {selectedUser.displayName || selectedUser.email}
              </span>
            </div>
          ) : (
            <span className="text-white/50">{placeholder}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="start">
        <div className="p-2">
          <div className="relative mb-2">
            <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar usuário..."
              className="pl-8"
            />
          </div>
        </div>
        <div className="max-h-64 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center text-sm text-white/50">Carregando...</div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-4 text-center text-sm text-white/50">
              {search ? "Nenhum usuário encontrado" : "Nenhum usuário disponível"}
            </div>
          ) : (
            <div className="p-1">
              {filteredUsers.map((user) => {
                const isSelected = value === user.userId;
                return (
                  <button
                    key={user.userId}
                    type="button"
                    onClick={() => handleSelect(user.userId)}
                    className={cn(
                      "flex w-full items-center gap-2 rounded p-2 text-left transition-colors",
                      isSelected
                        ? "bg-[hsl(var(--primary)/0.2)] text-white"
                        : "text-white/70 hover:bg-white/5 hover:text-white",
                    )}
                  >
                    {showAvatar && (
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--secondary))] text-xs font-bold text-white">
                        {(user.displayName || user.email).charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-sm font-medium">
                        {user.displayName || user.email}
                      </p>
                      {user.displayName && (
                        <p className="truncate text-xs text-white/50">{user.email}</p>
                      )}
                    </div>
                    {isSelected && <Check className="h-4 w-4 shrink-0 text-[hsl(var(--primary))]" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>
        {allowClear && selectedUser && (
          <div className="border-t border-white/10 p-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-full"
              onClick={handleClear}
            >
              Limpar seleção
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}


