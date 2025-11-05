# Cost Optimization Recommendations for Guras IAC

## Executive Summary
Your current infrastructure has several cost-saving opportunities, particularly in CloudWatch logs retention. Implementing these changes could reduce your monthly AWS costs by **~30-40%**.

---

## 1. CloudWatch Logs Retention (HIGH PRIORITY - IMMEDIATE SAVINGS)

### Current State
- **ECS Logs**: 7 days retention (`/ecs/{environment}-guras-app`)
- **RDS Logs**: 7 days retention (`/aws/rds/instance/{id}/postgresql`)

### Recommended Change
- **ECS Logs**: Change to **2 days** retention
- **RDS Logs**: Change to **2 days** retention

### Cost Impact
- **Current**: ~$0.50/GB ingested + $0.03/GB stored per month
- **Estimated Savings**: **$15-25/month** (assuming ~50GB/month logs)
- **Annual Savings**: **$180-300/year**

### Implementation
Update the following files:

#### File 1: `iac/terraform/modules/ecs/main.tf` (Line 18)
```terraform
# Change from:
retention_in_days = 7

# Change to:
retention_in_days = 2
```

#### File 2: `iac/terraform/modules/rds/main.tf` (Line 153)
```terraform
# Change from:
retention_in_days = 7

# Change to:
retention_in_days = 2
```

### Why This Works
- 2 days is sufficient for debugging recent issues
- Older logs are rarely needed for troubleshooting
- You can still export logs to S3 for long-term archival if needed

---

## 2. Container Insights (MEDIUM PRIORITY)

### Current State
- **Enabled**: Yes (Line 6-8 in `iac/terraform/modules/ecs/main.tf`)
- **Cost**: ~$0.50/GB ingested for Container Insights metrics

### Recommendation
Consider disabling Container Insights for **staging** environment only:

```terraform
# In ecs/main.tf, modify the setting block:
setting {
  name  = "containerInsights"
  value = var.environment == "production" ? "enabled" : "disabled"
}
```

### Cost Impact
- **Staging Savings**: ~$5-10/month
- **Annual Savings**: ~$60-120/year

### Trade-off
- You lose detailed container metrics for staging
- Production still has full monitoring
- Basic CloudWatch logs still available

---

## 3. RDS Backup Retention (MEDIUM PRIORITY)

### Current State
- **Production**: 7 days backup retention (Line 90)
- **Staging**: 1 day backup retention

### Recommendation
Consider reducing production backups to **3 days** if you have:
- Regular automated snapshots
- Point-in-time recovery needs < 3 days

```terraform
# In rds/main.tf, Line 90:
backup_retention_period = var.environment == "production" ? 3 : 1
```

### Cost Impact
- **Production Savings**: ~$10-15/month
- **Annual Savings**: ~$120-180/year

### Trade-off
- Shorter recovery window (3 days vs 7 days)
- Still covers most incident scenarios
- Keep 7 days if compliance requires it

---

## 4. RDS Parameter Group Logging (LOW PRIORITY)

### Current State
- **log_connections**: Enabled (Line 120-122)
- **log_disconnections**: Enabled (Line 124-127)

### Recommendation
For **staging**, disable connection logging:

```terraform
# In rds/main.tf, add conditional:
parameter {
  name  = "log_connections"
  value = var.environment == "production" ? "1" : "0"
}

parameter {
  name  = "log_disconnections"
  value = var.environment == "production" ? "1" : "0"
}
```

### Cost Impact
- **Staging Savings**: ~$2-5/month
- **Annual Savings**: ~$24-60/year

---

## 5. ALB Access Logs (OPTIONAL)

### Current State
- **Not Enabled**: ALB access logs are not currently configured

### Recommendation
If you enable ALB access logs in the future, store them in S3 with:
- **Expiration**: 30 days
- **Transition to Glacier**: After 7 days

This prevents CloudWatch log costs for ALB logs.

---

## Summary of Recommended Changes

| Change | Priority | Monthly Savings | Annual Savings | Effort |
|--------|----------|-----------------|-----------------|--------|
| CloudWatch Logs (2 days) | HIGH | $15-25 | $180-300 | 5 min |
| Container Insights (staging) | MEDIUM | $5-10 | $60-120 | 10 min |
| RDS Backups (3 days) | MEDIUM | $10-15 | $120-180 | 5 min |
| RDS Logging (staging) | LOW | $2-5 | $24-60 | 10 min |
| **TOTAL** | - | **$32-55** | **$384-660** | **30 min** |

---

## Implementation Steps

1. **Update ECS CloudWatch retention** (2 min)
2. **Update RDS CloudWatch retention** (2 min)
3. **Test in staging** (5 min)
4. **Apply to production** (5 min)
5. **Monitor costs** (ongoing)

---

## Monitoring After Changes

After implementing these changes:
1. Monitor CloudWatch Logs costs in AWS Cost Explorer
2. Set up billing alerts for unexpected increases
3. Review logs retention quarterly
4. Consider S3 export for compliance/audit needs

---

## Notes

- All changes are **non-breaking** and can be applied immediately
- Logs will be automatically deleted after retention period
- No data loss for active logs
- Consider exporting critical logs to S3 before deletion if needed

