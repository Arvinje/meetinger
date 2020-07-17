provider "aws" {
  alias   = "eu-central-1"
  region  = "eu-central-1"
}

variable "project_name" {
  type    = string
}

terraform {
  backend "s3" {
    bucket          = "terraform-minutes"
    key             = "global/s3/terraform.tfstate"
    region          = "eu-central-1"

    dynamodb_table  = "terraform-minutes"
    encrypt         = true
  }
}

resource "aws_s3_bucket" "terraform_state" {
  bucket = "terraform-minutes"

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
  }
}

resource "aws_dynamodb_table" "terraform_locks" {
  name         = "terraform-minutes"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "LockID"
  attribute {
    name = "LockID"
    type = "S"
  }

  tags = {
    Project = var.project_name
  }
}

resource "aws_cognito_user_pool" "cognito_pool" {
  name = "${var.project_name}_user_pool"

  auto_verified_attributes = [
    "email"
  ]

  password_policy {
    minimum_length    = 10
    require_lowercase = false
    require_numbers   = false
    require_symbols   = false
    require_uppercase = false
  }

  tags = {
    Project = var.project_name
  }
}

resource "aws_cognito_user_pool_client" "cognito_client_web" {
  name = "${var.project_name}_user_pool_client_web"

  user_pool_id = aws_cognito_user_pool.cognito_pool.id
}

resource "aws_ssm_parameter" "cognito_pool_iss" {
  name        = "/cognito-user-pool/${var.project_name}/iss"
  description = "Endpoint to get public keys of ${var.project_name} user pool."
  type        = "SecureString"
  value       = "https://${aws_cognito_user_pool.cognito_pool.endpoint}"

  tags = {
    Project = var.project_name
  }
}

resource "aws_dynamodb_table" "main" {
  name         = "minutes-main"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "PK"
  range_key = "SK"
  
  attribute {
    name = "PK"
    type = "S"
  }
  
  attribute {
    name = "SK"
    type = "S"
  }
  
  attribute {
    name = "GSI1PK"
    type = "S"
  }
  
  attribute {
    name = "GSI1SK"
    type = "S"
  }
  
  attribute {
    name = "GSI2PK"
    type = "S"
  }
  
  attribute {
    name = "GSI2SK"
    type = "S"
  }

  global_secondary_index {
    name = "GSI1"
    hash_key = "GSI1PK"
    range_key = "GSI1SK"
    projection_type = "ALL"
  }
  
  global_secondary_index {
    name = "GSI2"
    hash_key = "GSI2PK"
    range_key = "GSI2SK"
    projection_type = "ALL"
  }

  tags = {
    Project = var.project_name
  }
}

resource "aws_ssm_parameter" "main_table_arn" {
  name        = "/dynamodb/${var.project_name}/main_table_arn"
  description = "The Main table's ARN"
  type        = "SecureString"
  value       = aws_dynamodb_table.main.arn

  tags = {
    Project = var.project_name
  }
}

resource "aws_ssm_parameter" "main_table_name" {
  name        = "/dynamodb/${var.project_name}/main_table_name"
  description = "The Main table's name"
  type        = "SecureString"
  value       = "minutes-main"

  tags = {
    Project = var.project_name
  }
}