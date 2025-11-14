#!/bin/bash
set -e

# Wait for master to be ready
until pg_isready -h postgres-master -p 5432 -U $POSTGRES_USER; do
  echo "Waiting for master to be ready..."
  sleep 2
done

# Remove existing data directory contents
rm -rf /var/lib/postgresql/data/*

# Create base backup from master
PGPASSWORD=$POSTGRES_REPLICATION_PASSWORD pg_basebackup \
  -h postgres-master \
  -D /var/lib/postgresql/data \
  -U $POSTGRES_REPLICATION_USER \
  -v \
  -P \
  -W

# Create recovery configuration
cat > /var/lib/postgresql/data/postgresql.conf <<EOF
primary_conninfo = 'host=postgres-master port=5432 user=$POSTGRES_REPLICATION_USER password=$POSTGRES_REPLICATION_PASSWORD'
promote_trigger_file = '/tmp/postgresql.trigger'
hot_standby = on
EOF

# Create standby signal
touch /var/lib/postgresql/data/standby.signal

echo "Replica initialization completed"

