#!/bin/bash

# Test database connection script
# This will help diagnose connectivity issues

echo "🔍 Testing database connection..."

# Test 1: Basic Flyway info
echo "📊 Test 1: Flyway info command"
flyway -url=jdbc:postgresql://staging-guras-db.cypui6c4kp4c.us-east-1.rds.amazonaws.com:5432/guras_staging -user=guras_admin -password="(jMP*S)OrQ15OpEj" info

echo ""
echo "📊 Test 2: Flyway info with debug"
flyway -url=jdbc:postgresql://staging-guras-db.cypui6c4kp4c.us-east-1.rds.amazonaws.com:5432/guras_staging -user=guras_admin -password="(jMP*S)OrQ15OpEj" info -X

echo ""
echo "📊 Test 3: Flyway validate"
flyway -url=jdbc:postgresql://staging-guras-db.cypui6c4kp4c.us-east-1.rds.amazonaws.com:5432/guras_staging -user=guras_admin -password="(jMP*S)OrQ15OpEj" -locations=filesystem:database/migrations validate

echo ""
echo "✅ Connection tests completed!"
