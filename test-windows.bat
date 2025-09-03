@echo off
echo 🧪 Testing Agent Tools with curl...

echo.
echo 🔍 Testing Product Search...
curl -X POST http://localhost:3007/api/ai-chat ^
  -H "Content-Type: application/json" ^
  -d "{\"message\":\"buscar dipirona\",\"sessionId\":\"test-session-123\"}"

echo.
echo.
echo 🛒 Testing Add to Cart...
curl -X POST http://localhost:3007/api/ai-chat ^
  -H "Content-Type: application/json" ^
  -d "{\"message\":\"adicionar 2 dipirona\",\"sessionId\":\"test-session-123\"}"

echo.
echo.
echo 👀 Testing View Cart...
curl -X POST http://localhost:3007/api/ai-chat ^
  -H "Content-Type: application/json" ^
  -d "{\"message\":\"ver carrinho\",\"sessionId\":\"test-session-123\"}"

echo.
echo.
echo 🧭 Testing Navigation...
curl -X POST http://localhost:3007/api/ai-chat ^
  -H "Content-Type: application/json" ^
  -d "{\"message\":\"ir para produtos\",\"sessionId\":\"test-session-123\"}"

echo.
echo.
echo 🧹 Testing Clear Cart...
curl -X POST http://localhost:3007/api/ai-chat ^
  -H "Content-Type: application/json" ^
  -d "{\"message\":\"limpar carrinho\",\"sessionId\":\"test-session-123\"}"

echo.
echo.
echo ✅ All tests completed!
pause