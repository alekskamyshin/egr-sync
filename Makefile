APP_NAME := egr

.PHONY: help install run run-docker test-db-up test-db-init test-db-run test-db-down test-db-all test-db-check

help:
	@printf "Targets:\n"
	@printf "  install       Install npm dependencies\n"
	@printf "  run           Run locally with .env\n"
	@printf "  run-docker     Build and run app container (external DB)\n"
	@printf "  test-db-up     Start Postgres 17 test container\n"
	@printf "  test-db-init   Initialize schema in test DB\n"
	@printf "  test-db-run    Run app against test DB container\n"
	@printf "  test-db-all    Init DB and run app\n"
	@printf "  test-db-check  Run validation query in test DB\n"
	@printf "  test-db-down   Stop and remove test DB container + volume\n"

install:
	npm install

run:
	node src/index.js

run-docker:
	docker compose up --build

test-db-up:
	docker compose -f docker-compose.test.yml up -d db

test-db-init: test-db-up
	docker compose -f docker-compose.test.yml exec -T db psql -U postgres -d egr -f /scripts/db_create.sql

test-db-run:
	docker compose -f docker-compose.test.yml run --rm app

test-db-check: test-db-up
	docker compose -f docker-compose.test.yml exec -T db psql -U postgres -d egr -f /scripts/db_test.sql

test-db-down:
	docker compose -f docker-compose.test.yml down -v

test-db-all: test-db-up test-db-init test-db-run test-db-check test-db-down

