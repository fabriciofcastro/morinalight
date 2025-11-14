.PHONY: help build up down restart logs ps health backup deploy test

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Available targets:'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  %-15s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

# Development
dev: ## Start development environment
	pnpm dev

dev:stack: ## Start development stack with Docker
	docker compose up --build

# Production
build: ## Build production images
	docker compose -f docker-compose.prod.yml build

up: ## Start production services
	docker compose -f docker-compose.prod.yml up -d

down: ## Stop production services
	docker compose -f docker-compose.prod.yml down

restart: ## Restart production services
	docker compose -f docker-compose.prod.yml restart

# Monitoring
logs: ## Show logs from all services
	docker compose -f docker-compose.prod.yml logs -f

ps: ## Show status of all services
	docker compose -f docker-compose.prod.yml ps

health: ## Run health check
	./deploy/monitor.sh

# Backup and restore
backup: ## Create backup of databases
	./deploy/backup/backup.sh

restore: ## Restore from backup (usage: make restore BACKUP=path/to/backup.tar.gz)
	@if [ -z "$(BACKUP)" ]; then \
		echo "Erro: Especifique o arquivo de backup. Uso: make restore BACKUP=path/to/backup.tar.gz"; \
		exit 1; \
	fi
	./deploy/backup/restore.sh $(BACKUP)

# Deployment
deploy: ## Deploy to production
	./deploy/deploy.sh production

deploy:blue-green: ## Blue-green deployment
	./deploy/strategies/blue-green-deploy.sh

deploy:canary: ## Canary deployment
	./deploy/strategies/canary-deploy.sh

rollback: ## Rollback to previous version
	./deploy/rollback.sh

# Versioning
version: ## Show current version
	./scripts/version.sh show

version:patch: ## Increment patch version (0.0.1)
	./scripts/version.sh patch

version:minor: ## Increment minor version (0.1.0)
	./scripts/version.sh minor

version:major: ## Increment major version (1.0.0)
	./scripts/version.sh major

# Security
security:validate: ## Validate security configuration
	./deploy/security/secrets-manager.sh validate

security:secrets:generate: ## Generate secrets template
	./deploy/security/secrets-manager.sh generate

# Testing
test: ## Run tests
	pnpm test

test:e2e: ## Run E2E tests
	pnpm test:e2e

# Database
db:migrate: ## Run database migrations
	docker compose -f docker-compose.prod.yml exec api-1 pnpm --filter @morina/api exec prisma migrate deploy

db:seed: ## Seed database
	docker compose -f docker-compose.prod.yml exec api-1 pnpm --filter @morina/api exec prisma db seed

# Cleanup
clean: ## Remove containers and volumes
	docker compose -f docker-compose.prod.yml down -v

clean:all: ## Remove everything including images
	docker compose -f docker-compose.prod.yml down -v --rmi all

kill:port: ## Kill process on port (usage: make kill:port PORT=3333)
	@if [ -z "$(PORT)" ]; then \
		echo "Erro: Especifique a porta. Uso: make kill:port PORT=3333"; \
		exit 1; \
	fi
	./scripts/kill-port.sh $(PORT)
