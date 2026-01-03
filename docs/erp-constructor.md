Plano dos Próximos Épicos
1. Estrutura Organizacional & Cadastros Avançados (Prioridade Máxima)
Arquitetura & Fundamentos
Definir modelo de Organizations/Tenants (tabelas Organization, UserOrganizationRole), regras de isolamento e multi-tenant nos repositórios.
Implementar Roles/Permissões base (admin, gestor, operador) e políticas de acesso no Fastify (hooks + decorators).
Cadastro de Usuários
Fluxo completo: convite (email/token), registro, autenticação (por ora JWT simples) e gestão de perfis.
UI para onboarding e gerenciamento de equipe (convites pendentes, reenvio, desativação).
Catálogo Avançado
Produtos com atributos ricos (SKU, variações tamanho/cor, ficha técnica, anexos).
Modelagem de Categorias/Subcategorias hierárquicas + interface de administração.
Fornecedores & Oficinas
CRUD de fornecedores, oficinas e associações com produtos/ordens.
Campos para compliance (documentação fiscal, certificados) e integração futura.
Não-funcionais
Validações fortes (Zod), rate limiting básico, logs estruturados com tracing ID e padronização de erros.
2. Realtime + UI
Frontend passa a consumir /notifications/feed para estado inicial; WebSocket apenas injeta novos eventos (dedup + merge).
Cache em client (React Query ou equivalente) com persistência (localStorage) para sobreviver a refresh.
Feedback visual: badges de notificações, toasts em tempo real, timeline incremental.
Métricas adicionais no gateway (eventos entregues vs. perdidos, reconexões).
3. Estratégia de Dados
Formalizar migrações Prisma (migrate dev/deploy) com versionamento e seeds realistas (produtos demo, fornecedores, categorias).
Scripts em package.json/Makefile (make prisma-migrate, pnpm --filter @morina/api prisma migrate deploy).
Políticas multi-tenant via migrations (chaves compostas orgId + ..., índices).
Backups/Snapshots locais (docker volume + script) para replicar ambiente.
4. CI/CD & Staging
Habilitar pipeline GitHub Actions com secrets (DATABASE_URL, REDIS_URL, REALTIME_SECRET).
Job paralelo para pnpm --filter web test:e2e contra ambiente local em contêiner (services: no workflow).
Deploy automatizado para staging (GitHub Actions -> Render/Fly/Heroku) com docker compose ou buildpack.
Gates: lint + tests obrigatórios antes de deploy, branch protection com status checks.
Posso começar pela épica 1 já estruturando modelo de dados e roteiros de implementação, ou detalho plano tático por sprint para cada item. Indique a ordem desejada.