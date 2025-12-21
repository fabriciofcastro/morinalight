# CHECKLIST DE MELHORIAS — USUÁRIOS

> Status: em curso. Ponto de partida para continuar priorizando melhorias.

## Referências obrigatórias
- Design System já pronto (`packages/ui`), com tokens, temas e componentes padronizados.
- Telas de **Ficha de Custo de Aviamentos** servem como padrão visual/funcional para formularários complexos (header, layout, estados de salvamento, feedback).
- Padrão de página: `StandardFormPage` + `useAutoSave` (atalhos, indicador de auto-save, markDirty).

## Pendências críticas (backend)
- Permissões iniciais: falta aplicar no fluxo de criação (campos e API não recebem `initialPermissions`).
- Retorno de dados: GET `/users/:id` não expõe CPF/telefone/datas/observações/avatar — alinhar resposta para o front usar.
- Upload/foto: apenas `avatarUrl` é aceito; não há fluxo de upload/armazenamento de imagem.

## Pendências frontend imediatas
- Front já envia campos pessoais (CPF, telefone, datas, observações, fotoUrl) — reforçar validação e exibição na tela de detalhes.
- Implementar seleção/envio de permissões iniciais se o backend suportar.
- Manter padrão visual do Design System (usar Ficha de Custo de Aviamentos como espelho).
- Validar upload/salvamento da foto do usuário (hoje só URL).

## Concluído até aqui (resumo)
- Aplicado Design System e animações no formulário de usuário.
- Auto-save de rascunho (30s, expira em 24h, restauração com confirmação).
- Atalhos: Ctrl/Cmd+S para salvar, Esc para voltar.
- Indicador de progresso inteligente (peso maior em campos obrigatórios).
- Confetti e feedback visual ao salvar/criar.
- Backend e repo já persistem CPF/telefone/datas/observações/avatar (`apps/api/src/modules/users/http/create-user.route.ts`, `update-user.route.ts`, Prisma model `User`).
