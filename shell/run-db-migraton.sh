#!/bin/sh

node_modules/db-migrate/bin/db-migrate up -e $NODE_ENV
