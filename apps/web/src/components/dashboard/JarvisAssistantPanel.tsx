"use client";

import { motion } from "framer-motion";
import { ArrowRight, Command, Sparkles, Terminal } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

type Suggestion = {
  id: string;
  title: string;
  description: string;
  href: string;
};

const SUGGESTIONS: Suggestion[] = [
  {
    id: "s1",
    title: "Cadastrar cliente",
    description: "Abrir fluxo de novo cliente.",
    href: "/clients/new",
  },
  {
    id: "s2",
    title: "Novo produto",
    description: "Adicionar item ao catálogo.",
    href: "/catalog/new",
  },
  {
    id: "s3",
    title: "Revisar permissões",
    description: "Conferir RBAC e perfis.",
    href: "/admin/roles",
  },
  {
    id: "s4",
    title: "Estrutura organizacional",
    description: "Departamentos, setores e cargos.",
    href: "/settings/organizational-structure",
  },
];

function normalize(input: string) {
  return input.trim().toLowerCase();
}

export function JarvisAssistantPanel() {
  const router = useRouter();
  const [cmd, setCmd] = useState("");
  const [output, setOutput] = useState<string | null>(null);

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
      clientes: "/clients",
      client: "/clients",
      catalogo: "/catalog",
      catalog: "/catalog",
      comissoes: "/commissions",
      commissions: "/commissions",
      settings: "/settings/company",
      "admin roles": "/admin/roles",
      roles: "/admin/roles",
      permissoes: "/admin/permissions",
      permissions: "/admin/permissions",
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
      className="relative overflow-hidden border border-white/10 bg-white/3 p-5 backdrop-blur-xl"
    >
      {/* corners */}
      <div className="absolute left-0 top-0 h-4 w-4 border-l-2 border-t-2 border-[hsl(var(--primary)/0.55)]" />
      <div className="absolute right-0 top-0 h-4 w-4 border-r-2 border-t-2 border-[hsl(var(--primary)/0.55)]" />
      <div className="absolute bottom-0 left-0 h-4 w-4 border-b-2 border-l-2 border-[hsl(var(--primary)/0.45)]" />
      <div className="absolute bottom-0 right-0 h-4 w-4 border-b-2 border-r-2 border-[hsl(var(--primary)/0.45)]" />

      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-mono tracking-[0.32em] text-[hsl(var(--primary))]">
            <Sparkles className="h-3 w-3" aria-hidden="true" />
            ASSISTENTE
          </div>
          <div className="mt-2 text-lg font-semibold text-white">MORINA</div>
          <div className="mt-1 text-xs text-white/50">Sugestões contextuais + console rápido</div>
        </div>
        <button
          type="button"
          onClick={() => openCmdK()}
          className="inline-flex items-center gap-2 border border-white/10 bg-white/5 px-3 py-2 text-[10px] font-mono tracking-[0.22em] text-white/60 hover:bg-white/8 hover:text-white transition"
        >
          <Command className="h-4 w-4" aria-hidden="true" />
          CMDK
        </button>
      </div>

      {/* Próxima ação */}
      <div className="mt-5 border-t border-white/10 pt-4">
        <div className="flex items-center gap-2 text-[10px] font-mono tracking-[0.24em] text-white/40">
          <Terminal className="h-3 w-3" aria-hidden="true" />
          PROXIMA_ACAO
        </div>
        <div className="mt-2 text-sm font-semibold text-white">{nextAction.title}</div>
        <div className="mt-1 text-xs leading-relaxed text-white/50">{nextAction.hint}</div>
      </div>

      {/* Sugestões */}
      <div className="mt-5 border-t border-white/10 pt-4">
        <div className="text-[10px] font-mono tracking-[0.24em] text-white/40">SUGESTOES</div>
        <div className="mt-3 grid gap-2">
          {SUGGESTIONS.slice(0, 4).map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => router.push(s.href)}
              className="group flex w-full items-center justify-between gap-4 border border-white/10 bg-white/5 px-3 py-3 text-left hover:bg-white/8 transition"
            >
              <div>
                <div className="text-sm font-semibold text-white">{s.title}</div>
                <div className="text-xs text-white/45">{s.description}</div>
              </div>
              <ArrowRight
                className="h-4 w-4 text-white/30 group-hover:text-white/70 group-hover:translate-x-0.5 transition"
                aria-hidden="true"
              />
            </button>
          ))}
        </div>
      </div>

      {/* Console */}
      <div className="mt-5 border-t border-white/10 pt-4">
        <div className="flex items-center justify-between text-[10px] font-mono tracking-[0.24em] text-white/40">
          <span>CONSOLE</span>
          <span className="text-white/25">digite: help</span>
        </div>

        <div className="mt-3 flex items-center gap-2 border border-white/10 bg-black/30 px-3 py-2">
          <span className="text-[10px] font-mono text-[hsl(var(--primary)/0.8)]">{">"}</span>
          <input
            value={cmd}
            onChange={(e) => setCmd(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                run(cmd);
                setCmd("");
              }
            }}
            placeholder="buscar clientes | admin roles | catalogo | help"
            className="w-full bg-transparent text-sm text-white placeholder:text-white/30 outline-none"
            aria-label="Console de comandos"
          />
          <button
            type="button"
            onClick={() => {
              run(cmd);
              setCmd("");
            }}
            className="border border-white/10 bg-white/5 px-2 py-1 text-[10px] font-mono tracking-[0.2em] text-white/60 hover:bg-white/8 hover:text-white transition"
          >
            RUN
          </button>
        </div>

        {output ? (
          <div className="mt-3 border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/55">
            {output}
          </div>
        ) : null}
      </div>
    </motion.aside>
  );
}
