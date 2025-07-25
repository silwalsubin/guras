# SSL Certificate using AWS Certificate Manager
resource "aws_acm_certificate" "main" {
  domain_name       = var.domain_name
  subject_alternative_names = ["${var.environment}.${var.domain_name}", "api.${var.domain_name}"]
  validation_method = "DNS"

  lifecycle {
    create_before_destroy = true
  }

  tags = {
    Name = "${var.environment}-guras-ssl-cert"
  }
}

# Route53 records for certificate validation
resource "aws_route53_record" "cert_validation" {
  for_each = {
    for dvo in aws_acm_certificate.main.domain_validation_options : dvo.domain_name => {
      name   = dvo.resource_record_name
      record = dvo.resource_record_value
      type   = dvo.resource_record_type
    }
  }

  allow_overwrite = true
  name            = each.value.name
  records         = [each.value.record]
  ttl             = 300
  type            = each.value.type
  zone_id         = var.route53_zone_id
}

# Certificate validation with timeout
resource "aws_acm_certificate_validation" "main" {
  certificate_arn         = aws_acm_certificate.main.arn
  validation_record_fqdns = [for record in aws_route53_record.cert_validation : record.fqdn]
  
  timeouts {
    create = "10m"
  }
} 