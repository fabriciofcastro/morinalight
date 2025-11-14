# Changelog

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/),
e este projeto adere ao [Semantic Versioning](https://semver.org/lang/pt-BR/).

## [0.1.0] - 2024-12-XX

### Adicionado
- Sistema de autenticação JWT
- CRUD completo para Organizações, Usuários, Fornecedores e Produtos
- Sistema de permissões baseado em roles (RBAC)
- Integração com Prisma ORM e PostgreSQL
- Sistema de eventos em tempo real com WebSockets
- Interface web moderna com Next.js e Tailwind CSS
- Sistema de sincronização offline-first
- Indicador de status de conexão
- Animações na tela de login
- Configuração de DevOps com Docker Compose
- Load balancing com Nginx
- Replicação de banco de dados (PostgreSQL Master-Slave)
- Replicação de Redis (Master-Slave)
- Health checks para todos os serviços
- Scripts de deploy automatizados
- Sistema de versionamento semântico
- Estratégias de deploy seguro (blue-green, rollback)
- Headers de segurança aprimorados
- Rate limiting
- Smoke tests automatizados

### Modificado
- Melhorias na UX da tela de login
- Otimização de performance do hook de conexão
- Melhorias no tratamento de erros

### Corrigido
- Correção de problemas de SSR na tela de login
- Correção de tratamento de cookies no Next.js
- Correção de redirecionamento de assets estáticos

