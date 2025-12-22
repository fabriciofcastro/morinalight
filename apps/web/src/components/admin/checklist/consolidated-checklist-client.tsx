"use client";

import { Button, GlassCard } from "@morina/ui";
import { ArrowLeft, BookOpen, Download } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export function ConsolidatedChecklistClient() {
  const router = useRouter();
  const [checklistContent, setChecklistContent] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Carregar o conteúdo do checklist consolidado
    fetch("/docs/Diretrizes/CHECKLIST-CONSOLIDADO-COMPLETO.md")
      .then((res) => {
        if (!res.ok) {
          return null;
        }
        return res.text();
      })
      .then((text) => {
        if (text) {
          setChecklistContent(text);
        } else {
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
    return `# 📋 CHECKLIST CONSOLIDADO COMPLETO - MORINA

> **Checklist único consolidado com todas as demandas do sistema MORINA**
> Última atualização: 2025-01-19

## 📊 Status Geral do Sistema

**Progresso Real:** 86% ⬆️  
**Última Revisão:** 2025-01-19  
**Atualização:** 2025-01-19 (13 tarefas críticas concluídas - 3 telas padronizadas, bug corrigido, template Zod criado)  
**Sessão Atual:** Padronização de telas + Templates de padronização

O checklist completo está disponível em: /docs/Diretrizes/CHECKLIST-CONSOLIDADO-COMPLETO.md

## 📊 Resumo do Status

### ✅ Implementado
- FASE 0: Fundamentos (95%)
- FASE 1: Base Organizacional (93%)
- FASE 2: Controle de Acesso (95%)
- FASE 3: Design System (95%)
- FASE 4: Telas Base (87%)
- Sistema de Usuários (100% ✅)

### ⚠️ Em Andamento
- FASE 5: Melhorias UX/UI (0%)
- FASE 6: Recursos Avançados (0%)

Consulte o arquivo completo para mais detalhes.`;
  };

  // Converter markdown básico para HTML (versão simples)
  const renderMarkdown = (text: string) => {
    const lines = text.split('\n');
    let html = '';
    let inParagraph = false;
    let inList = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      if (!line) {
        if (inParagraph) {
          html += '</p>';
          inParagraph = false;
        }
        if (inList) {
          html += '</ul>';
          inList = false;
        }
        continue;
      }

      // Headers
      if (line.startsWith('#### ')) {
        if (inParagraph) { html += '</p>'; inParagraph = false; }
        if (inList) { html += '</ul>'; inList = false; }
        html += `<h4 class='text-lg font-semibold text-white/90 mt-4 mb-2'>${line.substring(5)}</h4>`;
      } else if (line.startsWith('### ')) {
        if (inParagraph) { html += '</p>'; inParagraph = false; }
        if (inList) { html += '</ul>'; inList = false; }
        html += `<h3 class='text-xl font-bold text-white/90 mt-6 mb-3'>${line.substring(4)}</h3>`;
      } else if (line.startsWith('## ')) {
        if (inParagraph) { html += '</p>'; inParagraph = false; }
        if (inList) { html += '</ul>'; inList = false; }
        html += `<h2 class='text-2xl font-bold text-white mt-8 mb-4 border-b border-white/10 pb-2'>${line.substring(3)}</h2>`;
      } else if (line.startsWith('# ')) {
        if (inParagraph) { html += '</p>'; inParagraph = false; }
        if (inList) { html += '</ul>'; inList = false; }
        html += `<h1 class='text-3xl font-bold text-white mb-6'>${line.substring(2)}</h1>`;
      }
      // Checkboxes
      else if (line.startsWith('- [x]')) {
        if (inParagraph) { html += '</p>'; inParagraph = false; }
        if (!inList) { html += '<ul class="list-none space-y-2 my-4">'; inList = true; }
        const text = line.substring(5).trim();
        html += `<li class="flex items-start gap-2 text-white/80"><span class="w-5 h-5 rounded-full bg-green-400/20 border-2 border-green-400 flex items-center justify-center mt-0.5 flex-shrink-0"><span class="w-2 h-2 rounded-full bg-green-400"></span></span> <span>${text}</span></li>`;
      } else if (line.startsWith('- [ ]')) {
        if (inParagraph) { html += '</p>'; inParagraph = false; }
        if (!inList) { html += '<ul class="list-none space-y-2 my-4">'; inList = true; }
        const text = line.substring(5).trim();
        html += `<li class="flex items-start gap-2 text-white/60"><span class="w-5 h-5 border-2 border-white/30 rounded mt-0.5 flex-shrink-0"></span> <span>${text}</span></li>`;
      }
      // List items
      else if (line.startsWith('- ')) {
        if (inParagraph) { html += '</p>'; inParagraph = false; }
        if (!inList) { html += '<ul class="list-disc list-inside space-y-1 my-4 text-white/80">'; inList = true; }
        html += `<li>${line.substring(2)}</li>`;
      }
      // Bold text
      else if (line.includes('**')) {
        if (!inParagraph) { html += '<p class="text-white/80 my-2">'; inParagraph = true; }
        html += line.replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>') + ' ';
      }
      // Regular paragraph
      else {
        if (!inParagraph && !inList) {
          html += '<p class="text-white/80 my-2">';
          inParagraph = true;
        }
        html += line + ' ';
      }
    }

    if (inParagraph) html += '</p>';
    if (inList) html += '</ul>';

    return html;
  };

  const handleDownload = () => {
    const blob = new Blob([checklistContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'CHECKLIST-CONSOLIDADO-COMPLETO.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <GlassCard className="mb-6 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.back()}
                className="text-white/80 hover:text-white"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
              <div className="flex items-center gap-3">
                <BookOpen className="w-8 h-8 text-[var(--primary)]" />
                <div>
                  <h1 className="text-2xl font-bold text-white">Checklist Consolidado</h1>
                  <p className="text-white/60 text-sm">Todas as demandas do sistema MORINA</p>
                </div>
              </div>
            </div>
            <Button
              onClick={handleDownload}
              className="bg-[var(--primary)] hover:bg-[var(--primary)]/90 text-white"
            >
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
          </div>
        </GlassCard>

        {/* Content */}
        <GlassCard className="p-8">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--primary)]"></div>
            </div>
          ) : (
            <div
              className="prose prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: renderMarkdown(checklistContent) }}
            />
          )}
        </GlassCard>
      </motion.div>
    </div>
  );
}

