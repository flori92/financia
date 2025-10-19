#!/bin/bash

# 🚀 BMS - Execute Critical Fixes
# This script applies all critical fixes and prepares for production

set -e

echo "╔═══════════════════════════════════════════════════════╗"
echo "║   🚀 BMS - Critical Fixes Execution                  ║"
echo "╚═══════════════════════════════════════════════════════╝"
echo ""

cd bms/api-gateway

echo "📦 Step 1: Clean build cache..."
rm -rf dist node_modules/.cache
echo "✅ Cache cleaned"
echo ""

echo "🔨 Step 2: Rebuild project..."
npm run build
echo "✅ Build complete"
echo ""

echo "🗄️  Step 3: Generate migration..."
npm run typeorm migration:generate -- -n AddRBACTables
echo "✅ Migration generated"
echo ""

echo "🗄️  Step 4: Run migrations..."
npm run typeorm migration:run
echo "✅ Migrations applied"
echo ""

echo "🌱 Step 5: Seed permissions..."
npm run seed
echo "✅ Permissions seeded"
echo ""

echo "╔═══════════════════════════════════════════════════════╗"
echo "║   ✅ ALL CRITICAL FIXES APPLIED                      ║"
echo "╚═══════════════════════════════════════════════════════╝"
echo ""
echo "🚀 Next: Start the server with 'npm run start:dev'"
echo "📚 See: BMS_CRITICAL_FIXES_AND_NEXT_STEPS.md"
