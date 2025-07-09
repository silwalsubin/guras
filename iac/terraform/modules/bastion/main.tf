# Bastion Host for RDS Access
resource "aws_instance" "bastion" {
  ami           = "ami-0c02fb55956c7d316"  # Amazon Linux 2 AMI in us-east-1
  instance_type = "t3.micro"
  subnet_id     = var.public_subnets[0]  # Place in first public subnet
  key_name      = aws_key_pair.bastion.key_name

  vpc_security_group_ids = [aws_security_group.bastion.id]

  user_data = <<-EOF
              #!/bin/bash
              yum update -y
              yum install -y postgresql15
              EOF

  tags = {
    Name = "${var.environment}-guras-bastion"
  }
}

# Key pair for bastion host
resource "aws_key_pair" "bastion" {
  key_name   = "${var.environment}-guras-bastion-key"
  public_key = var.bastion_public_key
}

# Security group for bastion host
resource "aws_security_group" "bastion" {
  name_prefix = "${var.environment}-bastion-"
  vpc_id      = var.vpc_id

  # SSH access from your IP only
  ingress {
    protocol    = "tcp"
    from_port   = 22
    to_port     = 22
    cidr_blocks = var.allowed_ssh_cidrs
  }

  # All outbound traffic
  egress {
    protocol    = "-1"
    from_port   = 0
    to_port     = 0
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.environment}-bastion-sg"
  }
}

# Outputs
output "bastion_public_ip" {
  description = "Public IP of the bastion host"
  value       = aws_instance.bastion.public_ip
}

output "bastion_private_ip" {
  description = "Private IP of the bastion host"
  value       = aws_instance.bastion.private_ip
} 