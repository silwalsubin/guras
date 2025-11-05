# Additional Cost Optimization Opportunities for Guras IAC

## Overview
This document outlines additional cost-saving opportunities based on your actual AWS bill analysis.

### Your Current Monthly Bill Breakdown
- **Total**: $82.74/month
- **EC2 (Compute)**: $33.51 (40.5%) - **HIGHEST COST**
- **VPC (NAT Gateway)**: $29.60 (35.8%) - **SECOND HIGHEST**
- **ECS**: $9.20 (11.1%)
- **CloudWatch**: $8.38 (10.1%)
- **KMS**: $0.99 (1.2%)
- **Secrets Manager**: $0.54 (0.7%)
- **Route 53**: $0.50 (0.6%)
- **Other**: $0.02 (0.02%)

### Key Insight
**Your VPC costs ($29.60) are almost as high as your EC2 costs ($33.51)!** This is primarily the NAT Gateway. This should be your #1 priority.

---

## 1. NAT Gateway Optimization (🔴 CRITICAL PRIORITY - STAGING ONLY)

### Current State
- **Staging**: 1 NAT Gateway running 24/7
- **Production**: 1 NAT Gateway running 24/7
- **Cost**: ~$32/month per NAT Gateway + data processing charges
- **Your Bill**: VPC costs are $29.60/month - **This is likely your NAT Gateway!**

### Why This Matters
Your VPC costs ($29.60) are 35.8% of your total bill and almost equal to your EC2 costs. This is the single biggest optimization opportunity.

### Recommendation
**Remove NAT Gateway from Staging** - Use NAT Instance instead (or remove entirely if not needed)

```terraform
# In vpc/main.tf, make NAT Gateway conditional:
resource "aws_nat_gateway" "main" {
  count         = var.environment == "production" ? 1 : 0
  allocation_id = aws_eip.nat[0].id
  subnet_id     = aws_subnet.public[0].id
  
  tags = {
    Name = "${var.environment}-nat-gateway"
  }
  
  depends_on = [aws_internet_gateway.main]
}

# Also make EIP conditional:
resource "aws_eip" "nat" {
  count  = var.environment == "production" ? 1 : 0
  domain = "vpc"
  tags = {
    Name = "${var.environment}-nat-eip"
  }
}
```

### Cost Impact
- **Staging Savings**: ~$32/month
- **Annual Savings**: ~$384/year
- **Trade-off**: Staging private subnets won't have outbound internet access (usually not needed for staging)

### Alternative
If staging needs outbound access, use a **NAT Instance** (t3.nano) instead:
- **Cost**: ~$3-5/month (vs $32 for NAT Gateway)
- **Savings**: ~$27-29/month

---

## 2. VPC Endpoints Optimization (MEDIUM PRIORITY)

### Current State
- **CloudWatch Logs Endpoint**: Interface endpoint (costs ~$7.20/month)
- **Secrets Manager Endpoint**: Interface endpoint (costs ~$7.20/month)
- **KMS Endpoint**: Interface endpoint (costs ~$7.20/month)
- **S3 Endpoint**: Gateway endpoint (FREE)

### Recommendation for Staging
**Remove Interface Endpoints from Staging** - Use public endpoints instead

```terraform
# In vpc/main.tf, make endpoints conditional:
resource "aws_vpc_endpoint" "logs" {
  count               = var.environment == "production" ? 1 : 0
  vpc_id              = aws_vpc.main.id
  service_name        = "com.amazonaws.${data.aws_region.current.name}.logs"
  vpc_endpoint_type   = "Interface"
  subnet_ids          = aws_subnet.private[*].id
  security_group_ids  = [aws_security_group.vpc_endpoints[0].id]
  private_dns_enabled = true
  
  tags = {
    Name = "${var.environment}-logs-endpoint"
  }
}

# Repeat for secretsmanager and kms endpoints
```

### Cost Impact
- **Staging Savings**: ~$21.60/month (3 endpoints × $7.20)
- **Annual Savings**: ~$259/year
- **Trade-off**: Slightly higher data transfer costs (negligible for staging)

---

## 3. S3 Versioning & Lifecycle (MEDIUM PRIORITY)

### Current State
- **Versioning**: Enabled on audio files bucket
- **Lifecycle**: Noncurrent versions kept for 30 days
- **Incomplete uploads**: Cleaned up after 7 days

### Recommendation
**Disable versioning for Staging** and reduce noncurrent version retention:

```terraform
# In s3_bucket/main.tf:
resource "aws_s3_bucket_versioning" "this" {
  bucket = aws_s3_bucket.this.id
  versioning_configuration {
    status = var.environment == "production" ? "Enabled" : "Suspended"
  }
}

# Reduce noncurrent version retention for production:
noncurrent_version_expiration {
  noncurrent_days = var.environment == "production" ? 14 : 7
}
```

### Cost Impact
- **Staging Savings**: ~$2-5/month (no version storage)
- **Production Savings**: ~$1-3/month (14 days vs 30 days)
- **Annual Savings**: ~$36-96/year
- **Trade-off**: Less version history for recovery

---

## 4. ECR Image Retention (LOW PRIORITY)

### Current State
- **Keep last 30 images** in ECR repository
- **Scan on push**: Enabled (costs ~$0.10 per image scanned)

### Recommendation
**Reduce to last 10 images for Staging**:

```terraform
# In ecr/main.tf, make policy conditional:
policy = jsonencode({
  rules = [
    {
      rulePriority = 1
      description  = "Keep last ${var.environment == "production" ? 30 : 10} images"
      selection = {
        tagStatus     = "any"
        countType     = "imageCountMoreThan"
        countNumber   = var.environment == "production" ? 30 : 10
      }
      action = {
        type = "expire"
      }
    }
  ]
})
```

### Cost Impact
- **Staging Savings**: ~$2-3/month (fewer scans)
- **Annual Savings**: ~$24-36/year
- **Trade-off**: Fewer images available for rollback

---

## 5. RDS Auto-Scaling Limits (MEDIUM PRIORITY)

### Current State
- **Staging**: max_allocated_storage = 100 GB (default)
- **Production**: max_allocated_storage = 100 GB (default)
- **Cost**: Storage charges if auto-scaling triggers

### Recommendation
**Reduce max storage for Staging**:

```terraform
# In main.tf, pass environment-specific values:
max_allocated_storage = var.environment == "production" ? 100 : 50
```

Or in terraform.tfvars:
```terraform
# Add to staging/terraform.tfvars:
db_max_allocated_storage = 50

# Add to production/terraform.tfvars:
db_max_allocated_storage = 100
```

### Cost Impact
- **Staging Savings**: ~$1-2/month (if auto-scaling occurs)
- **Annual Savings**: ~$12-24/year
- **Trade-off**: Staging DB can only auto-scale to 50GB instead of 100GB

---

## 6. ALB Access Logs (OPTIONAL - FUTURE)

### Current State
- **Not Enabled**: ALB access logs are not configured

### Recommendation
**If you enable ALB access logs in future**, store in S3 with lifecycle:

```terraform
# In alb/main.tf:
resource "aws_lb" "main" {
  # ... existing config ...
  
  access_logs {
    bucket  = aws_s3_bucket.alb_logs.id
    enabled = var.environment == "production"
  }
}

# Add S3 lifecycle to expire logs after 30 days
resource "aws_s3_bucket_lifecycle_configuration" "alb_logs" {
  bucket = aws_s3_bucket.alb_logs.id
  
  rule {
    id     = "expire-alb-logs"
    status = "Enabled"
    
    expiration {
      days = 30
    }
  }
}
```

### Cost Impact
- **Savings**: Avoids CloudWatch Logs costs (~$0.50/GB ingested)
- **Trade-off**: Logs stored in S3 instead of CloudWatch

---

## 7. KMS Key Rotation (COMPLIANCE - NOT COST)

### Current State
- **KMS Key Rotation**: Enabled (automatic annual rotation)

### Note
This is **NOT a cost-saving measure** but a security best practice. Keep it enabled.

---

## Summary of All Opportunities (Based on Your Actual Bill)

| Change | Priority | Monthly Savings | Annual Savings | % of Bill | Effort | Risk |
|--------|----------|-----------------|-----------------|-----------|--------|------|
| **NAT Gateway (staging)** | 🔴 CRITICAL | **~$15** | **~$180** | **18%** | 15 min | Low |
| VPC Endpoints (staging) | MEDIUM | $7-10 | $84-120 | 8-12% | 20 min | Low |
| CloudWatch Logs (already done) | DONE | $2-3 | $24-36 | 3% | ✅ | ✅ |
| S3 Versioning | LOW | $0-1 | $0-12 | <1% | 10 min | Medium |
| ECR Retention | LOW | $0-1 | $0-12 | <1% | 10 min | Low |
| RDS Max Storage | LOW | $0-1 | $0-12 | <1% | 5 min | Low |
| **TOTAL ADDITIONAL** | - | **$24-30** | **$288-372** | **29-36%** | **60 min** | - |
| **CURRENT BILL** | - | **$82.74** | **$992.88** | **100%** | - | - |
| **AFTER OPTIMIZATION** | - | **$52-58** | **$624-704** | **64-71%** | - | - |

---

## Implementation Priority (Based on Your Bill)

### 🔴 PHASE 1 (DO THIS FIRST - This Week)
**NAT Gateway Removal from Staging**
- **Impact**: Reduce bill by ~18% ($15/month)
- **Effort**: 15 minutes
- **Risk**: Low (staging only)
- **Question**: Does your staging environment need outbound internet access?
  - If NO → Remove NAT Gateway entirely
  - If YES → Use NAT Instance (t3.nano) instead (~$3-5/month vs $32/month)

### 🟡 PHASE 2 (Next Week - Medium Priority)
1. VPC Endpoints removal (staging) - Save $7-10/month
2. RDS max storage reduction - Save $0-1/month

### 🟢 PHASE 3 (Optional - Low Priority)
1. S3 versioning changes - Save $0-1/month
2. ECR image retention - Save $0-1/month
3. ALB access logs (if needed)

---

## Testing Recommendations

Before applying to production:
1. Test NAT Gateway removal in staging (verify no outbound access needed)
2. Monitor VPC Endpoint removal for any connectivity issues
3. Verify ECR rollback still works with fewer images
4. Test S3 versioning suspension

---

## Rollback Plan

All changes are reversible:
- NAT Gateway: Can be re-enabled in minutes
- VPC Endpoints: Can be re-created in minutes
- S3 Versioning: Can be re-enabled anytime
- ECR Retention: Can be increased anytime

---

## Questions to Consider

1. **Does staging need outbound internet access?** (NAT Gateway decision)
2. **How critical is version history for S3 audio files?** (Versioning decision)
3. **How many ECR images do you need for rollback?** (ECR retention decision)
4. **What's your RDS storage growth rate?** (Max storage decision)

---

## Recommended Action Plan

### Immediate Action (This Week)
**Answer this question first:**
> Does your staging environment need outbound internet access to external services?

**If NO:**
- Remove NAT Gateway from staging entirely
- Save: $15/month ($180/year)
- Implementation: 15 minutes

**If YES:**
- Replace NAT Gateway with NAT Instance (t3.nano)
- Save: $27-29/month ($324-348/year)
- Implementation: 30 minutes

### Why This Matters
- Your VPC costs ($29.60) are 36% of your total bill
- NAT Gateway is the primary cost driver
- This single change could reduce your bill by 18-35%

---

## Next Steps

1. **Decide on NAT Gateway** - Answer the question above
2. **Implement Phase 1** - NAT Gateway optimization
3. **Monitor for 1 week** - Ensure no issues
4. **Implement Phase 2** - VPC Endpoints optimization
5. **Monitor costs** - Check AWS Cost Explorer after each change

---

## Questions to Answer

1. **Does staging need outbound internet access?** (NAT Gateway decision)
   - Check if staging services call external APIs
   - Check if staging pulls from external registries
   - Check if staging needs to reach external databases

2. **How critical is version history for S3 audio files?** (Versioning decision)

3. **How many ECR images do you need for rollback?** (ECR retention decision)

4. **What's your RDS storage growth rate?** (Max storage decision)

