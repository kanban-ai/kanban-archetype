#!/bin/sh

echo "Starting entrypoint script..."
echo "Current directory: $(pwd)"


echo "Listing API directory content:"
echo "Changed to API directory: $(pwd)"

MIGRATION_SUCCESS=false

# Check if migrations should be skipped
if [ "$SKIP_MIGRATIONS" = "true" ]; then
  echo "⚠️  SKIP_MIGRATIONS=true - Starting without database migrations"
  MIGRATION_SUCCESS=true
elif [ -f "/app/migration.sh" ]; then
  echo "Running migrations..."
  echo "File permissions for migration.sh:"
  ls -la /app/migration.sh

  # Execute the migration script and capture output
  MIGRATION_OUTPUT=$(sh /app/migration.sh executar 2>&1)
  MIGRATION_EXIT_CODE=$?

  # Print the migration output
  echo "$MIGRATION_OUTPUT"

  # Check for common error patterns in the output, in addition to the exit code
  if [ $MIGRATION_EXIT_CODE -eq 0 ] && ! echo "$MIGRATION_OUTPUT" | grep -i -E 'error|fail|unable|no such file|cannot find|not found|exception|rejected' > /dev/null; then
    echo "Migrations applied successfully!"
    MIGRATION_SUCCESS=true
  else
    echo "Migration failed! Exit code: $MIGRATION_EXIT_CODE"
    echo "FATAL: Cannot start application without successful database migration"
    exit 1
  fi
else
  echo "FATAL: migration.sh script not found!"
  exit 1
fi

# Only start the application if migrations were successful
if [ "$MIGRATION_SUCCESS" = true ]; then
  echo "Starting application..."
  find public/ -exec touch {} \;
  cd /app && node dist/src/main
else
  echo "FATAL: Not starting application due to migration failure"
  exit 1
fi 