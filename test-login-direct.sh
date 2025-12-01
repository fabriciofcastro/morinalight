#!/bin/bash

echo "Testing login endpoint directly..."
echo ""

# Test with curl
echo "Sending POST request to http://localhost:3333/auth/login"
echo "Credentials: admin@morina.com / Admin@123"
echo ""

curl -v -X POST http://localhost:3333/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@morina.com","password":"Admin@123"}' \
  2>&1

echo ""
echo ""
echo "Done!"
