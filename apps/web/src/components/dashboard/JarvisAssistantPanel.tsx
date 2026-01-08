"use client";

import { motion } from "framer-motion";
import { ArrowRight, Command, Sparkles, Terminal } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { AppActions, AppSubjects } from "@morina/shared-kernel";

type Suggestion = {
  id: string;
  title: string;
  description: string;
  href: string;
  permission?: { action: AppActions; subject: AppSubjects };
};

const SUGGESTIONS: Suggestion[] = [
  {
    id: "s1",
    title: "Cadastrar cliente",
    description: "Abrir fluxo de novo cliente.",
    href: "/admin/clients/new",
    permission: { action: "create", subject: "Client" },
  },
  {
    id: "s2",
    title: "Novo produto",
    description: "Adicionar item ao catálogo.",
    href: "/admin/products/new",
    permission: { action: "create", subject: "Product" },
  },
  {
    id: "s3",
    title: "Revisar permissões",
    description: "Conferir RBAC e perfis.",
    href: "/admin/roles/list",
    permission: { action: "manage", subject: "Role" },
  },
  {
    id: "s4",
    title: "Estrutura organizacional",
    description: "Departamentos, setores e cargos.",
    href: "/settings/organizational-structure",
    permission: { action: "manage", subject: "Organization" },
  },
];

function normalize(input: string) {
  return input.trim().toLowerCase();
}

import { useAbility } from "@/lib/auth/CaslContext";

export function JarvisAssistantPanel() {
  const router = useRouter();
  const [cmd, setCmd] = useState("");
  const [output, setOutput] = useState<string | null>(null);
  const ability = useAbility();

  const filteredSuggestions = useMemo(() => {
    return SUGGESTIONS.filter(s => {
      if (!s.permission) return true;
      return ability.can(s.permission.action, s.permission.subject);
    });
  }, [ability]);

  const nextAction = useMemo(() => {
    const h = new Date().getHours();
    if (h < 11)
      return { title: "Checagem de Operação", hint: "Abrir dashboard e validar indicadores." };
    if (h < 15)
      return { title: "Ações Comerciais", hint: "Clientes, pedidos e comissões pendentes." };
    return { title: "Fechamento do Dia", hint: "Relatórios, auditoria e sincronização." };
  }, []);

  function openCmdK(query?: string) {
    try {
      if (query) window.sessionStorage.setItem("morina:cmdkQuery", query);
    } catch {
      // ignore
    }
    router.push("/dashboard?cmdk=1");
  }

  function run(raw: string) {
    const input = normalize(raw);
    if (!input) return;

    // comandos
    if (input === "help" || input === "ajuda" || input === "?") {
      setOutput(
        "Comandos: dashboard | clientes | catalogo | comissoes | settings | admin roles | buscar <termo> | cmdk",
      );
      return;
    }

    if (input === "cmdk" || input === "buscar" || input === "search") {
      setOutput("Abrindo busca do menu…");
      openCmdK();
      return;
    }

    if (input.startsWith("buscar ")) {
      const q = raw.trim().slice("buscar ".length).trim();
      setOutput(q ? `Buscando no menu: "${q}"…` : "Abrindo busca do menu…");
      openCmdK(q || undefined);
      return;
    }

    const routes: Record<string, string> = {
      dashboard: "/dashboard",
      clientes: "/admin/clients/list",
      client: "/admin/clients/list",
      catalogo: "/admin/products/list",
      catalog: "/admin/products/list",
      comissoes: "/admin/commissions/list",
      commissions: "/admin/commissions/list",
      settings: "/settings/company",
      "admin roles": "/admin/roles/list",
      roles: "/admin/roles/list",
      permissoes: "/admin/permissions/list",
      permissions: "/admin/permissions/list",
    };

    const exact = routes[input];
    if (exact) {
      setOutput(`Executando: ${input} → ${exact}`);
      router.push(exact);
      return;
    }

    // fallback: abrir cmdk com o texto
    setOutput(`Não reconhecido. Sugestão: abrir busca com "${raw.trim()}".`);
    openCmdK(raw.trim());
  }

  return (
    <motion.aside
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="relative overflow-hidden rounded-2xl border border-white/5 bg-white/[0.02] p-6 backdrop-blur-2xl"
    >
      {/* HUD Glow */}
      <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-blue-500/[0.03] blur-[60px]" />
      
      {/* corners */}
      <div className="absolute left-0 top-0 h-4 w-4 border-l border-t border-blue-500/30" />
      <div className="absolute right-0 top-0 h-4 w-4 border-r border-t border-blue-500/30" />
      <div className="absolute bottom-0 left-0 h-4 w-4 border-b border-l border-blue-500/30" />
      <div className="absolute bottom-0 right-0 h-4 w-4 border-b border-r border-blue-500/30" />

      <div className="relative flex items-start justify-between gap-4 z-10">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-mono tracking-[0.32em] text-blue-400/80 uppercase">
            <Sparkles className="h-3 w-3" aria-hidden="true" />
            Assistente
          </div>
          <div className="mt-2 text-lg font-bold text-white tracking-tight">MORINA AI</div>
          <div className="mt-1 text-xs text-white/40 font-mono tracking-wide">Relatórios e sugestões em tempo real</div>
        </div>
        <button
          type="button"
          onClick={() => openCmdK()}
          className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-[10px] font-mono tracking-[0.22em] text-white/60 hover:bg-white/10 hover:text-white transition-all active:scale-95 duration-200"
        >
          <Command className="h-3.5 w-3.5" aria-hidden="true" />
          CMD+K
        </button>
      </div>

      {/* Próxima ação */}
      <div className="relative mt-6 border-t border-white/5 pt-5 z-10">
        <div className="flex items-center gap-2 text-[10px] font-mono tracking-[0.24em] text-white/30 uppercase">
          <Terminal className="h-3 w-3" aria-hidden="true" />
          Sugestão de Ação
        </div>
        <div className="mt-3 rounded-xl border border-white/5 bg-white/[0.02] p-3">
            <div className="text-sm font-medium text-blue-100">{nextAction.title}</div>
            <div className="mt-1 text-xs leading-relaxed text-white/50">{nextAction.hint}</div>
        </div>
      </div>

      {/* Sugestões */}
      <div className="relative mt-6 border-t border-white/5 pt-5 z-10">
        <div className="text-[10px] font-mono tracking-[0.24em] text-white/30 uppercase mb-3">Acesso Rápido</div>
        <div className="grid gap-2">
          {filteredSuggestions.slice(0, 4).map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => router.push(s.href)}
              className="group flex w-full items-center justify-between gap-4 rounded-lg border border-white/5 bg-white/[0.02] px-3 py-2.5 text-left hover:border-white/10 hover:bg-white/5 transition-all duration-200"
            >
              <div className="min-w-0">
                <div className="text-xs font-medium text-white/90 group-hover:text-white transition-colors">{s.title}</div>
              </div>
              <ArrowRight
                className="h-3.5 w-3.5 text-white/20 group-hover:text-white/60 group-hover:translate-x-0.5 transition-all"
                aria-hidden="true"
              />
            </button>
          ))}
        </div>
      </div>

      {/* Console */}
      <div className="relative mt-6 border-t border-white/5 pt-5 z-10">
        <div className="flex items-center justify-between text-[10px] font-mono tracking-[0.24em] text-white/30 uppercase">
          <span>Terminal</span>
          <span className="text-white/20">v2.4.0</span>
        </div>

        <div className="mt-3 flex items-center gap-2 rounded-lg border border-white/10 bg-black/40 px-3 py-2 shadow-inner">
          <span className="text-[10px] font-mono text-blue-500">{">"}</span>
          <input
            value={cmd}
            onChange={(e) => setCmd(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                run(cmd);
                setCmd("");
              }
            }}
            placeholder="Digite um comando..."
            className="w-full bg-transparent text-xs font-mono text-white placeholder:text-white/20 outline-none"
            aria-label="Console de comandos"
          />
        </div>

        {output ? (
          <div className="mt-3 rounded border border-white/10 bg-white/5 px-3 py-2 text-[10px] font-mono text-white/60">
            {output}
          </div>
        ) : null}
      </div>
    </motion.aside>
  );
}
