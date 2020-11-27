default: start

project:=nb-demo
service:=ms-nodebootstrap-example
NODE_ENV?=dev
COMMIT_HASH = $(shell git rev-parse --verify HEAD)

.PHONY: start
start: 
	docker-compose -p ${project} up -d

.PHONY: stop
stop: 
	docker-compose -p ${project} down

.PHONY: restart
restart: stop start

.PHONY: logs
logs: 
	docker-compose -p ${project} logs -f ${service}

.PHONY: logs-db
logs-db: 
	docker-compose -p ${project} logs -f ${service}-db

.PHONY: ps
ps: 
	docker-compose -p ${project} ps

.PHONY: build
build:
	docker-compose -p ${project} build --no-cache

.PHONY: clean
clean: stop build start

.PHONY: add
add: install-package-in-container build

.PHONY: install-package-in-container
install-package-in-container:
	docker-compose -p ${project} exec ${service} npm install -S ${package}

.PHONY: add-dev
add-dev: install-dev-package-in-container build

.PHONY: install-dev-package-in-container
install-dev-package-in-container: start
	docker-compose -p ${project} exec ${service} npm install -D ${package}

.PHONY: migration-create
migration-create: start
	docker-compose -p ${project} exec ${service} node_modules/db-migrate/bin/db-migrate create ${name} --sql-file

.PHONY: migrate
migrate: start
	docker-compose -p ${project} exec ${service} node_modules/db-migrate/bin/db-migrate up -e ${NODE_ENV}

.PHONY: shell
shell:
	docker-compose -p ${project} exec ${service} sh

.PHONY: test
test: start test-exec

.PHONY: test-exec
test-exec:
	docker-compose -p ${project} exec ${service} npm run test

.PHONY: lint-fix
lint-fix: start
	docker-compose -p ${project} exec ${service} npm run lint:fix

.PHONY: test-cov
test-cov:
	docker-compose -p ${project} exec ${service} npm run test-cov

.PHONY: commit-hash
commit-hash:
	@echo $(COMMIT_HASH)

.PHONY: build-release
build-release:
	docker build --target release -t local/${service}:${COMMIT_HASH} .

.PHONY: run-release
run-release:
	docker run -d --name ${service}_${COMMIT_HASH} -p :5501 local/${service}:${COMMIT_HASH}
	docker logs -f ${service}_${COMMIT_HASH}
