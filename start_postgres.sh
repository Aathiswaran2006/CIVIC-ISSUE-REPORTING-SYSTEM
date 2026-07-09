#!/bin/bash
set -e

# Create pguser if it doesn't exist
if ! id "pguser" &>/dev/null; then
    useradd -m -s /bin/bash pguser
fi

# Create pgdata and pglogs if not exist
mkdir -p /tmp/pgdata /tmp/pglogs
chown -R pguser:pguser /tmp/pgdata /tmp/pglogs

# Initialize DB if not initialized
if [ ! -f /tmp/pgdata/PG_VERSION ]; then
    su pguser -c "/usr/lib/postgresql/15/bin/initdb -D /tmp/pgdata"
    # Allow local password-less connections for simplicity
    echo "host all all 127.0.0.1/32 trust" >> /tmp/pgdata/pg_hba.conf
    echo "local all all trust" >> /tmp/pgdata/pg_hba.conf
fi

# Stop if running
if /usr/lib/postgresql/15/bin/pg_isready -h localhost -p 5432; then
    echo "Postgres is already running."
else
    echo "Starting Postgres..."
    su pguser -c "/usr/lib/postgresql/15/bin/postgres -D /tmp/pgdata -p 5432 -c unix_socket_directories='/tmp' > /tmp/pglogs/postgresql.log 2>&1 &"
    sleep 3
    # Wait for ready
    until /usr/lib/postgresql/15/bin/pg_isready -h localhost -p 5432 -d postgres; do
        echo "Waiting for postgres..."
        sleep 1
    done
    echo "Postgres started!"
fi

# Create civic_portal database if not exists
if ! /usr/lib/postgresql/15/bin/psql -h localhost -U pguser -d postgres -tAc "SELECT 1 FROM pg_database WHERE datname='civic_portal'" | grep -q 1; then
    /usr/lib/postgresql/15/bin/psql -h localhost -U pguser -d postgres -c "CREATE DATABASE civic_portal"
    /usr/lib/postgresql/15/bin/psql -h localhost -U pguser -d postgres -c "CREATE USER postgres WITH SUPERUSER PASSWORD 'postgres'"
    echo "Database civic_portal and user postgres created successfully!"
fi
