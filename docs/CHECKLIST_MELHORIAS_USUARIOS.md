# CHECKLIST DE MELHORIAS — USUÁRIOS

> Status: em curso. Ponto de partida para continuar priorizando melhorias.

## Referências obrigatórias
- Design System já pronto (`packages/ui`), com tokens, temas e componentes padronizados.
- Telas de **Ficha de Custo de Aviamentos** servem como padrão visual/funcional para formularários complexos (header, layout, estados de salvamento, feedback).
- Padrão de página: `StandardFormPage` + `useAutoSave` (atalhos, indicador de auto-save, markDirty).

## Pendências críticas (backend)
- Upload/foto: apenas `avatarUrl` é aceito; não há fluxo de upload/armazenamento de imagem.

## Pendências frontend imediatas
- Validar upload/salvamento da foto do usuário (hoje só URL).
- Manter padrão visual do Design System (usar Ficha de Custo de Aviamentos como espelho).

## Concluído até aqui (resumo)
- Aplicado Design System e animações no formulário de usuário.
- Auto-save de rascunho (30s, expira em 24h, restauração com confirmação).
- Atalhos: Ctrl/Cmd+S para salvar, Esc para voltar.
- Indicador de progresso inteligente (peso maior em campos obrigatórios).
- Confetti e feedback visual ao salvar/criar.
- Backend e repo já persistem CPF/telefone/datas/observações/avatar (`apps/api/src/modules/users/http/create-user.route.ts`, `update-user.route.ts`, Prisma model `User`).
- GET `/users/:id` agora retorna CPF/telefone/datas/observações/avatar.
- Permissões iniciais aplicadas no pós-criação via `/permissions/bulk-assign` (hook `useUser` + `permissionsApi.assignPermissionsToUser`).
