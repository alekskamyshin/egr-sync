# EGR XML ETL

Streaming ETL pipeline that parses EGR registry XML files and upserts company registry records into Postgres. It uses a SAX parser for memory-efficient XML processing and batches inserts inside transactions.

## Quickstart

```bash
npm install
cp .env.example .env
psql -h <host> -U <user> -d <db> -f scripts/db_create.sql
node src/index.js
```

By default, the app reads XML files from `FILE_DIR` and processes each file sequentially.

## Environment variables

| Name | Description | Example |
| --- | --- | --- |
| `PG_USERNAME` | Postgres user | `postgres` |
| `PG_PASSWORD` | Postgres password | `postgres` |
| `PG_HOST` | Postgres host | `localhost` |
| `PG_PORT` | Postgres port | `5432` |
| `PG_DBNAME` | Postgres database name | `egr` |
| `FILE_DIR` | Directory with XML files | `./input` |
| `CONCURRENCY` | Number of files processed in parallel | `4` |

## Database schema

Create the table and indexes using `scripts/db_create.sql`.

## Sample input

An example XML file is available at `samples/egr_sample.xml`.

For a quick local demo, set `FILE_DIR=./samples` in `.env`.

## Notes

- Current parsing logic processes only records with `ИПВклМСП` (individual entrepreneurs). Organizations are skipped.
- Inserts are idempotent by `doc_id` using `ON CONFLICT DO UPDATE`.

## Docker (app only)

This compose file assumes Postgres is external and already initialized.

```bash
make run-docker
```

Mount your input files into `./input` on the host. The container reads them from `/data/input` via `FILE_DIR`.

## Test database (Postgres 17)

Spin up a disposable Postgres container for local testing, without exposing ports on the host:

```bash
make test-db-all
```
