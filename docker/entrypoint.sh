#!/bin/sh
set -e

echo "================================================"
echo "🐳 NestJS Application Startup"
echo "================================================"
echo ""

echo "⏳ Waiting for database to be ready..."
sleep 5

echo ""
echo "📊 Database Migrations:"
echo "   ✓ Will run automatically (migrationsRun: true)"
echo ""

if [ "$AUTO_SEED" = "true" ]; then
  echo "🌱 Database Seeds:"
  echo "   ✓ Will run automatically (AUTO_SEED=true)"
else
  echo "🌱 Database Seeds:"
  echo "   ⏭  Skipped (AUTO_SEED=$AUTO_SEED)"
  echo "   💡 To run manually: docker-compose exec server pnpm run seed:run"
fi

echo ""
echo "================================================"
echo "🚀 Starting NestJS application..."
echo "================================================"
echo ""

exec "$@"
