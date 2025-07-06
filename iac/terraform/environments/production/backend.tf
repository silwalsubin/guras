terraform {
  backend "s3" {
    bucket         = "guras-terraform-state-production"
    key            = "terraform.tfstate"
    region         = "us-east-1"
    dynamodb_table = "guras-terraform-locks"
    encrypt        = true
  }
} 