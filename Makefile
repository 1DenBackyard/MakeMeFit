.PHONY: deploy deploy-staging deploy-prod help

DEPLOY_HOST ?= your-server-ip
DEPLOY_USER ?= deploy
SSH_KEY ?= ~/.ssh/makemefit_deploy
BRANCH ?= main

help:
	@echo "Available commands:"
	@echo "  make deploy              - Deploy to server (set DEPLOY_HOST)"
	@echo "  make deploy-staging      - Deploy to staging server"
	@echo "  make deploy-prod         - Deploy to production server"
	@echo ""
	@echo "Environment variables:"
	@echo "  DEPLOY_HOST             - Server IP or domain (default: your-server-ip)"
	@echo "  DEPLOY_USER             - SSH user (default: deploy)"
	@echo "  SSH_KEY                 - SSH key path (default: ~/.ssh/makemefit_deploy)"
	@echo "  BRANCH                   - Git branch (default: main)"

deploy:
	@echo "🚀 Deploying to $(DEPLOY_USER)@$(DEPLOY_HOST)..."
	@./scripts/deploy.sh

deploy-staging:
	@$(MAKE) deploy DEPLOY_HOST=staging.your-domain.com

deploy-prod:
	@$(MAKE) deploy DEPLOY_HOST=your-domain.com
