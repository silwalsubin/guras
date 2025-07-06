terraform {
  backend "s3" {
    bucket         = "guras-terraform-state-staging"
    key            = "terraform.tfstate"
    region         = "us-east-1"
    dynamodb_table = "guras-terraform-locks"
    encrypt        = true
  }
} 