terraform {
  backend "s3" {
    bucket = "terraform-state-meetinger-dev"
    key    = "global/s3/terraform.tfstate"
    region = "eu-central-1"

    dynamodb_table = "terraform-state-meetinger-dev"
    encrypt        = true
  }
}

resource "aws_s3_bucket" "terraform_state_dev" {
  bucket = "terraform-state-meetinger-dev"

  versioning {
    enabled = true
  }

  server_side_encryption_configuration {
    rule {
      apply_server_side_encryption_by_default {
        sse_algorithm = "AES256"
      }
    }
  }

  tags = {
    Project = var.project_name
    Stage   = var.dev_stage
  }
}

resource "aws_dynamodb_table" "terraform_state_locks_dev" {
  name         = "terraform-state-meetinger-dev"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "LockID"
  attribute {
    name = "LockID"
    type = "S"
  }

  tags = {
    Project = var.project_name
    Stage   = var.dev_stage
  }
}
