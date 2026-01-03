"use client";

import { Button } from "@morina/ui";
import { ArrowLeft, CheckSquare, FileText, Download } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { AllowedGuard } from "@/components/auth/allowed-guard";

export function UsersChecklistClient() {
  const router = useRouter();
  const [checklistContent, setChecklistContent] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Carregar o conteúdo do checklist
    fetch("/docs/CHECKLIST_MELHORIAS_USUARIOS.md")
      .then((res) => {
        if (!res.ok) {
          // Se não encontrar, usar conteúdo estático como fallback
          return null;
        }
        return res.text();
      })
      .then((text) => {
        if (text) {
          setChecklistContent(text);
        } else {
          // Fallback: conteúdo básico
          setChecklistContent(getFallbackContent());
        }
        setLoading(false);
      })
      .catch(() => {
        setChecklistContent(getFallbackContent());
        setLoading(false);
      });
  }, []);

  const getFallbackContent = () => {
    return `# 📋 CHECKLIST COMPLETO - SISTEMA DE CADASTRO DE USUÁRIOS

## 🎯 Objetivo

Criar um sistema de cadastro de usuários completo, moderno e robusto, seguindo os padrões de design system já estabelecidos na tela de Ficha de Custo de Aviamento.

O checklist completo está disponível em: /docs/CHECKLIST_MELHORIAS_USUARIOS.md

## 📊 Resumo do Status

### ✅ Implementado
- Estrutura básica do formulário
- Validações básicas (CPF, email, senha)
- Máscaras de input (CPF, telefone)
- Upload de foto (frontend)
- Seleção de departamento/setor/cargo
- Interface de permissões (frontend)

### ⚠️ Parcialmente Implementado
- Foto de perfil (upload funciona mas não salva)
- Permissões iniciais (interface existe mas não aplica)
- Validações (básicas funcionam, avançadas faltam)

### ❌ Não Implementado
- Campos extras no banco (CPF, telefone, etc)
- Auto-save de rascunhos
- Wizard/stepper
- Preview antes de salvar
- Design system completo (ficha de custo)
- Busca de CPF via API
- Confetti celebration
- Indicador de progresso
- Histórico de rascunhos

Consulte o arquivo completo para mais detalhes.`;
  };

  // Converter markdown básico para HTML (versão simples)
  const renderMarkdown = (text: string) => {
    // Dividir em linhas
    const lines = text.split('\n');
    let html = '';
    let inParagraph = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      if (!line) {
        if (inParagraph) {
          html += '</p>';
          inParagraph = false;
        }
        continue;
      }

      // Headers
      if (line.startsWith('### ')) {
        if (inParagraph) { html += '</p>'; inParagraph = false; }
        html += `<h3 class='text-xl font-bold text-white/90 mt-6 mb-3'>${line.substring(4)}</h3>`;
      } else if (line.startsWith('## ')) {
        if (inParagraph) { html += '</p>'; inParagraph = false; }
        html += `<h2 class='text-2xl font-bold text-white mt-8 mb-4 border-b border-white/10 pb-2'>${line.substring(3)}</h2>`;
      } else if (line.startsWith('# ')) {
        if (inParagraph) { html += '</p>'; inParagraph = false; }
        html += `<h1 class='text-3xl font-bold text-white mb-6'>${line.substring(2)}</h1>`;
      }
      // Checkbox lists
      else if (line.match(/^- \[(x|X)\] /)) {
        if (inParagraph) { html += '</p>'; inParagraph = false; }
        const content = line.replace(/^- \[(x|X)\] /, '');
        html += `<div class='flex items-start gap-2 mb-2'><svg class='h-5 w-5 text-green-400 mt-0.5 flex-shrink-0' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' /></svg><span class='text-white/80'>${content}</span></div>`;
      } else if (line.match(/^- \[ \] /)) {
        if (inParagraph) { html += '</p>'; inParagraph = false; }
        const content = line.replace(/^- \[ \] /, '');
        html += `<div class='flex items-start gap-2 mb-2'><div class='h-5 w-5 border-2 border-white/30 rounded mt-0.5 flex-shrink-0'/><span class='text-white/80'>${content}</span></div>`;
      }
      // Regular lists
      else if (line.startsWith('- ')) {
        if (inParagraph) { html += '</p>'; inParagraph = false; }
        html += `<div class='text-white/80 mb-2 pl-4'>${line.substring(2)}</div>`;
      }
      // Regular text
      else {
        if (!inParagraph) {
          html += '<p class=\'text-white/70 mb-4 leading-relaxed\'>';
          inParagraph = true;
        } else {
          html += ' ';
        }
        // Processar formatação inline
        let processedLine = line
          .replace(/\*\*(.*?)\*\*/g, "<strong class='font-semibold text-white'>$1</strong>")
          .replace(/\*(.*?)\*/g, "<em class='italic text-white/80'>$1</em>")
          .replace(/`([^`]+)`/g, "<code class='bg-white/10 px-2 py-1 rounded text-sm font-mono text-[hsl(var(--primary))]'>$1</code>");
        html += processedLine;
      }
    }

    if (inParagraph) {
      html += '</p>';
    }

    return html;
  };

  if (loading) {
    return (
      <div className="relative min-h-screen p-6 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <AllowedGuard I="read" a="User" redirectTo="/admin">
      <div className="relative min-h-screen p-6 space-y-8">
        {/* Header Futurista */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-[hsl(var(--primary)/0.15)] via-transparent to-[hsl(var(--accent)/0.15)] blur-3xl -z-10" />

          <div className="relative flex items-center justify-between p-8 rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 via-white/[0.02] to-transparent backdrop-blur-xl shadow-2xl">
            {/* Tech corner accents */}
            <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-[hsl(var(--primary)/0.6)]" />
            <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-[hsl(var(--primary)/0.6)]" />
            <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-[hsl(var(--primary)/0.6)]" />
            <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-[hsl(var(--primary)/0.6)]" />

            <div className="relative z-10 flex-1">
              <div className="flex items-center gap-4 mb-3">
                <CheckSquare className="h-8 w-8 text-[hsl(var(--primary))]" />
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-white to-white/80 bg-clip-text text-transparent tracking-tight">
                    Checklist de Melhorias - Cadastro de Usuários
                  </h1>
                  <p className="text-sm text-white/60 font-medium mt-1">
                    Análise completa, pendências e funcionalidades do sistema de cadastro
                  </p>
                </div>
              </div>
            </div>

            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                className="bg-white/10 hover:bg-white/20 border border-white/20 text-white backdrop-blur-sm cursor-pointer h-[48px] px-4"
                onClick={() => router.push("/admin/users")}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
            </motion.div>
          </div>
        </motion.div>

        {/* Conteúdo do Checklist */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="relative p-8 rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.08] via-white/[0.03] to-transparent backdrop-blur-xl shadow-xl"
        >
          <div className="prose prose-invert max-w-none">
            <div
              className="checklist-content [&_h1]:text-3xl [&_h1]:font-bold [&_h1]:text-white [&_h1]:mb-6 [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-white [&_h2]:mt-8 [&_h2]:mb-4 [&_h2]:border-b [&_h2]:border-white/10 [&_h2]:pb-2 [&_h3]:text-xl [&_h3]:font-bold [&_h3]:text-white/90 [&_h3]:mt-6 [&_h3]:mb-3"
              dangerouslySetInnerHTML={{ __html: renderMarkdown(checklistContent) }}
            />
          </div>

          {/* Botão para visualizar arquivo completo */}
          <div className="mt-8 pt-8 border-t border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2 text-white/60 text-sm">
              <FileText className="h-4 w-4" />
              <span>Arquivo completo: docs/CHECKLIST_MELHORIAS_USUARIOS.md</span>
            </div>
            <Button
              className="bg-white/10 hover:bg-white/20 border border-white/20 text-white backdrop-blur-sm cursor-pointer"
              onClick={() => window.open("/docs/CHECKLIST_MELHORIAS_USUARIOS.md", "_blank")}
            >
              <Download className="h-4 w-4 mr-2" />
              Abrir Documento Completo
            </Button>
          </div>
        </motion.div>
      </div>
    </AllowedGuard>
  );
}

