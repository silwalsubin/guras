# Application Load Balancer
resource "aws_lb" "main" {
  name               = "${var.environment}-guras-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [var.alb_security_group_id]
  subnets            = var.public_subnets

  enable_deletion_protection = var.environment == "production"

  tags = {
    Name = "${var.environment}-guras-alb"
  }
}

# Target Group
resource "aws_lb_target_group" "app" {
  name        = "${var.environment}-guras-tg"
  port        = 80
  protocol    = "HTTP"
  vpc_id      = var.vpc_id
  target_type = "ip"

  health_check {
    enabled             = true
    healthy_threshold   = 2
    interval            = 30
    matcher             = "200"
    path                = "/health"
    port                = "traffic-port"
    protocol            = "HTTP"
    timeout             = 5
    unhealthy_threshold = 2
  }

  tags = {
    Name = "${var.environment}-guras-tg"
  }
}

# ALB Listener
resource "aws_lb_listener" "http" {
  load_balancer_arn = aws_lb.main.arn
  port              = "80"
  protocol          = "HTTP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.app.arn
  }

  tags = {
    Name = "${var.environment}-guras-listener"
  }
}

# ALB Listener Rule for HTTPS (placeholder for future SSL certificate)
resource "aws_lb_listener" "https" {
  count             = var.environment == "production" ? 1 : 0
  load_balancer_arn = aws_lb.main.arn
  port              = "443"
  protocol          = "HTTPS"
  ssl_policy        = "ELBSecurityPolicy-2016-08"
  # certificate_arn   = var.certificate_arn  # Uncomment when SSL certificate is available

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.app.arn
  }

  tags = {
    Name = "${var.environment}-guras-listener-https"
  }
} 