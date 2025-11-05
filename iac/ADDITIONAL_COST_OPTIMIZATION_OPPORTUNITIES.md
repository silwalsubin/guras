# Additional Cost Optimization Opportunities for Guras IAC

## Overview
This document outlines additional cost-saving opportunities beyond the already-implemented optimizations. Review each section and decide which changes align with your needs.

---

## 1. NAT Gateway Optimization (HIGH PRIORITY - STAGING ONLY)

### Current State
- **Staging**: 1 NAT Gateway running 24/7
- **Production**: 1 NAT Gateway running 24/7
- **Cost**: ~$32/month per NAT Gateway + data processing charges

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

## Summary of All Opportunities

| Change | Priority | Monthly Savings | Annual Savings | Effort | Risk |
|--------|----------|-----------------|-----------------|--------|------|
| NAT Gateway (staging) | HIGH | $32 | $384 | 15 min | Low |
| VPC Endpoints (staging) | MEDIUM | $21.60 | $259 | 20 min | Low |
| S3 Versioning | MEDIUM | $2-5 | $36-96 | 10 min | Medium |
| ECR Retention | LOW | $2-3 | $24-36 | 10 min | Low |
| RDS Max Storage | MEDIUM | $1-2 | $12-24 | 5 min | Low |
| **TOTAL ADDITIONAL** | - | **$58.60-63.60** | **$715-799** | **60 min** | - |
| **GRAND TOTAL** (with previous) | - | **$90.60-118.60** | **$1,099-1,459** | **90 min** | - |

---

## Implementation Priority

### Phase 1 (Immediate - Low Risk)
1. NAT Gateway removal (staging)
2. RDS max storage reduction

### Phase 2 (Next Week - Medium Risk)
1. VPC Endpoints removal (staging)
2. ECR image retention reduction

### Phase 3 (Optional - Higher Risk)
1. S3 versioning changes
2. ALB access logs (if needed)

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

## Next Steps

1. Review each section
2. Decide which changes to implement
3. Test in staging first
4. Apply to production
5. Monitor costs in AWS Cost Explorer

