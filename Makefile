.DEFAULT_GOAL := help

project := nb-demo
service := ms-nodebootstrap-example
COMPOSE = docker compose -p $(project)
COMMIT_HASH = $(shell git rev-parse --verify HEAD 2>/dev/null)

##@ Lifecycle

.PHONY: start
start: ## Start app + database containers (detached)
	$(COMPOSE) up -d

.PHONY: stop
stop: ## Stop all containers (preserves data volume)
	$(COMPOSE) down

.PHONY: restart
restart: stop start ## Stop then start

.PHONY: ps
ps: ## Show container status
	$(COMPOSE) ps

.PHONY: build
build: ## Rebuild Docker images (no cache)
	$(COMPOSE) build --no-cache

.PHONY: clean
clean: stop build start ## Full rebuild: stop, rebuild images, start

.PHONY: nuke
nuke: ## DESTRUCTIVE — stop and delete the database volume (wipes all data)
	$(COMPOSE) down -v

.PHONY: watch
watch: ## Live-sync source changes into the running container
	$(COMPOSE) watch

##@ Logs & shells

.PHONY: logs
logs: ## Tail the app service logs
	$(COMPOSE) logs -f $(service)

.PHONY: logs-db
logs-db: ## Tail the database logs
	$(COMPOSE) logs -f $(service)-db

.PHONY: shell
shell: ## Open a shell in the app container
	$(COMPOSE) exec $(service) sh

.PHONY: db-shell
db-shell: ## Open a psql shell in the database container
	$(COMPOSE) exec $(service)-db sh -c 'psql -U "$$POSTGRES_USER" "$$POSTGRES_DB"'

##@ Dependencies

.PHONY: install
install: ## Install deps on the host (uses package-lock.json)
	npm ci

.PHONY: add
add: ## Add a runtime dep in the container (usage: make add package=NAME)
	$(COMPOSE) exec $(service) npm install --save $(package)

.PHONY: add-dev
add-dev: ## Add a dev dep in the container (usage: make add-dev package=NAME)
	$(COMPOSE) exec $(service) npm install --save-dev $(package)

.PHONY: audit
audit: ## Run npm audit
	npm audit

.PHONY: outdated
outdated: ## Show outdated packages
	npm outdated || true

##@ Database

.PHONY: migrate
migrate: ## Apply pending migrations
	$(COMPOSE) exec $(service) npm run migrate

.PHONY: migrate-down
migrate-down: ## Roll back the most recent migration
	$(COMPOSE) exec $(service) npm run migrate:down

##@ Quality

.PHONY: test
test: start test-exec ## Ensure containers are up, then run tests

.PHONY: test-exec
test-exec: ## Run the test suite (assumes containers running)
	$(COMPOSE) exec $(service) npm test

.PHONY: test-watch
test-watch: ## Run tests in watch mode
	$(COMPOSE) exec $(service) npm run test:watch

.PHONY: test-coverage
test-coverage: start ## Run tests with coverage report
	$(COMPOSE) exec $(service) npm run test:coverage

.PHONY: lint
lint: ## Run ESLint
	$(COMPOSE) exec $(service) npm run lint

.PHONY: lint-fix
lint-fix: ## Run ESLint with autofix
	$(COMPOSE) exec $(service) npm run lint:fix

.PHONY: format
format: ## Format source with Prettier
	$(COMPOSE) exec $(service) npm run format

.PHONY: format-check
format-check: ## Check formatting without writing changes
	$(COMPOSE) exec $(service) npm run format:check

##@ Release

.PHONY: commit-hash
commit-hash: ## Print the current git commit SHA
	@echo $(COMMIT_HASH)

.PHONY: build-release
build-release: ## Build the production (release) Docker image
	docker build --target release -t local/$(service):$(COMMIT_HASH) .

.PHONY: run-release
run-release: ## Run the production image locally (after build-release)
	docker run -d --name $(service)_$(COMMIT_HASH) --env-file .env -p 5501:5501 local/$(service):$(COMMIT_HASH)
	docker logs -f $(service)_$(COMMIT_HASH)

##@ Help

.PHONY: help
help: ## Show this help message
	@awk 'BEGIN { \
	    FS = ":.*##"; \
	    printf "\n\033[1mUsage:\033[0m \033[36mmake <target>\033[0m\n"; \
	  } \
	  /^[a-zA-Z_0-9-]+:.*?##/ { \
	    printf "  \033[36m%-16s\033[0m %s\n", $$1, $$2; \
	  } \
	  /^##@/ { \
	    printf "\n\033[1m%s\033[0m\n", substr($$0, 5); \
	  }' $(MAKEFILE_LIST)
	@printf "\n"
