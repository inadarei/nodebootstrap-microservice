default: start

project := nb-demo
service := ms-nodebootstrap-example
NODE_ENV ?= development
COMMIT_HASH = $(shell git rev-parse --verify HEAD)

COMPOSE = docker compose -p $(project)

.PHONY: start
start:
	$(COMPOSE) up -d

.PHONY: stop
stop:
	$(COMPOSE) down

.PHONY: restart
restart: stop start

.PHONY: logs
logs:
	$(COMPOSE) logs -f $(service)

.PHONY: logs-db
logs-db:
	$(COMPOSE) logs -f $(service)-db

.PHONY: ps
ps:
	$(COMPOSE) ps

.PHONY: build
build:
	$(COMPOSE) build --no-cache

.PHONY: clean
clean: stop build start

.PHONY: watch
watch:
	$(COMPOSE) watch

.PHONY: shell
shell:
	$(COMPOSE) exec $(service) sh

.PHONY: add
add:
	$(COMPOSE) exec $(service) npm install -S $(package)

.PHONY: add-dev
add-dev:
	$(COMPOSE) exec $(service) npm install -D $(package)

.PHONY: migrate
migrate:
	$(COMPOSE) exec $(service) npm run migrate

.PHONY: migrate-down
migrate-down:
	$(COMPOSE) exec $(service) npm run migrate:down

.PHONY: test
test: start test-exec

.PHONY: test-exec
test-exec:
	$(COMPOSE) exec $(service) npm test

.PHONY: test-coverage
test-coverage: start
	$(COMPOSE) exec $(service) npm run test:coverage

.PHONY: lint
lint:
	$(COMPOSE) exec $(service) npm run lint

.PHONY: lint-fix
lint-fix:
	$(COMPOSE) exec $(service) npm run lint:fix

.PHONY: format
format:
	$(COMPOSE) exec $(service) npm run format

.PHONY: commit-hash
commit-hash:
	@echo $(COMMIT_HASH)

.PHONY: build-release
build-release:
	docker build --target release -t local/$(service):$(COMMIT_HASH) .

.PHONY: run-release
run-release:
	docker run -d --name $(service)_$(COMMIT_HASH) --env-file .env -p 5501:5501 local/$(service):$(COMMIT_HASH)
	docker logs -f $(service)_$(COMMIT_HASH)
