# Route53 A record for the main domain
resource "aws_route53_record" "app" {
  zone_id = var.route53_zone_id
  name    = var.domain_name
  type    = "A"

  alias {
    name                   = var.alb_dns_name
    zone_id                = var.alb_zone_id
    evaluate_target_health = true
  }
}

# Route53 A record for staging subdomain
resource "aws_route53_record" "staging" {
  count   = var.environment == "staging" ? 1 : 0
  zone_id = var.route53_zone_id
  name    = "staging.${var.domain_name}"
  type    = "A"

  alias {
    name                   = var.alb_dns_name
    zone_id                = var.alb_zone_id
    evaluate_target_health = true
  }
}

# Route53 A record for production subdomain
resource "aws_route53_record" "production" {
  count   = var.environment == "production" ? 1 : 0
  zone_id = var.route53_zone_id
  name    = "production.${var.domain_name}"
  type    = "A"

  alias {
    name                   = var.alb_dns_name
    zone_id                = var.alb_zone_id
    evaluate_target_health = true
  }
} 