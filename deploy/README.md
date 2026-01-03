# Deploy e Infraestrutura

Este diretório contém todos os arquivos relacionados a deploy, segurança e infraestrutura.

## 📁 Estrutura de Diretórios

```
deploy/
├── backup/              # Scripts de backup e restore
│   ├── backup.sh       # Criar backup completo
│   └── restore.sh      # Restaurar de backup
├── nginx/              # Configuração do Nginx
│   ├── nginx.conf      # Configuração principal
│   └── conf.d/         # Configurações de servidor
├── postgres/           # Scripts de replicação PostgreSQL
│   ├── master-init.sh  # Inicialização do master
│   └── replica-init.sh # Inicialização da réplica
├── security/           # Configurações de segurança
│   ├── security-headers.conf  # Headers de segurança
│   ├── rate-limiting.conf    # Rate limiting
│   └── secrets-manager.sh     # Gerenciamento de secrets
└── strategies/         # Estratégias de deploy
    ├── blue-green-deploy.sh  # Blue-green deployment
    ├── canary-deploy.sh      # Canary deployment
    └── smoke-tests.sh        # Testes pós-deploy
```

## 🚀 Deploy Rápido

### Deploy Padrão
```bash
make deploy
```

### Blue-Green Deployment
```bash
make deploy:blue-green
```

### Canary Deployment
```bash
make deploy:canary
```

## 🔒 Segurança

### Validar Configuração
```bash
make security:validate
```

### Gerar Secrets
```bash
make security:secrets:generate
```

## 💾 Backup

### Criar Backup
```bash
make backup
```

### Restaurar Backup
```bash
make restore BACKUP=./backups/arquivo.tar.gz
```

## 📝 Versionamento

### Ver Versão
```bash
make version
```

### Incrementar Versão
```bash
make version:patch   # 0.0.1
make version:minor   # 0.1.0
make version:major   # 1.0.0
```

## 📚 Documentação

- [README.SECURITY.md](../README.SECURITY.md) - Guia rápido de segurança
- [docs/SECURITY.md](../docs/SECURITY.md) - Segurança detalhada
- [docs/DEPLOYMENT_STRATEGIES.md](../docs/DEPLOYMENT_STRATEGIES.md) - Estratégias de deploy
