#!/bin/bash

# Script to create .env files from templates

echo "Creating backend/.env file..."
cat > backend/.env << 'EOF'
# App
APP_NAME=MakeMeFit API
APP_VERSION=0.1.0
DEBUG=false

# Database
DATABASE_URL=postgresql+asyncpg://makemefit:makemefit@localhost:5432/makemefit

# Telegram
TELEGRAM_BOT_TOKEN=
TELEGRAM_BOT_USERNAME=

# LLM Provider (OpenAI-compatible)
LLM_PROVIDER=openai
LLM_API_KEY=
LLM_BASE_URL=
LLM_MODEL=gpt-4o-mini
LLM_MODEL_FULL=gpt-4o
LLM_STREAMING=true

# Payments
PAYMENT_PROVIDER_TOKEN=

# Security
SECRET_KEY=
RATE_LIMIT_PER_MINUTE=10

# Admin
ADMIN_SECRET=

# PDF Storage
PDF_STORAGE_PATH=/tmp/pdfs
EOF

echo "Creating frontend/.env file..."
cat > frontend/.env << 'EOF'
VITE_API_URL=http://localhost:8000
EOF

echo "✅ .env files created!"
echo ""
echo "⚠️  Please fill in the following required values in backend/.env:"
echo "   - TELEGRAM_BOT_TOKEN"
echo "   - TELEGRAM_BOT_USERNAME"
echo "   - LLM_API_KEY"
echo "   - LLM_BASE_URL (if using custom OpenAI-compatible endpoint)"
echo "   - SECRET_KEY (min 32 characters)"
echo "   - PAYMENT_PROVIDER_TOKEN"
echo ""
echo "Note: LLM_PROVIDER name doesn't matter - system uses LLM_BASE_URL if provided."
