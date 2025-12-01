#!/bin/bash

echo "Testing login with curl..."
echo ""

curl -s -X POST http://localhost:3333/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@morina.com","password":"Admin@123"}' | jq '.' || \
curl -s -X POST http://localhost:3333/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@morina.com","password":"Admin@123"}'

echo ""
