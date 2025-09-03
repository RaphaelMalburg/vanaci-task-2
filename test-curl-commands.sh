#!/bin/bash

# Test script for pharmacy agent tools using curl
# Run these commands in separate terminal windows

echo "🧪 Testing Agent Tools with curl..."

# Test 1: Product Search
echo "🔍 Testing Product Search..."
curl -X POST http://localhost:3007/api/ai-chat \
  -H "Content-Type: application/json" \
  -d '{"message":"buscar dipirona","sessionId":"test-session-123"}'

echo -e "\n\n🛒 Testing Add to Cart..."
curl -X POST http://localhost:3007/api/ai-chat \
  -H "Content-Type: application/json" \
  -d '{"message":"adicionar 2 dipirona","sessionId":"test-session-123"}'

echo -e "\n\n👀 Testing View Cart..."
curl -X POST http://localhost:3007/api/ai-chat \
  -H "Content-Type: application/json" \
  -d '{"message":"ver carrinho","sessionId":"test-session-123"}'

echo -e "\n\n🧭 Testing Navigation..."
curl -X POST http://localhost:3007/api/ai-chat \
  -H "Content-Type: application/json" \
  -d '{"message":"ir para produtos","sessionId":"test-session-123"}'

echo -e "\n\n🧹 Testing Clear Cart..."
curl -X POST http://localhost:3007/api/ai-chat \
  -H "Content-Type: application/json" \
  -d '{"message":"limpar carrinho","sessionId":"test-session-123"}'

echo -e "\n\n✅ All tests completed!"