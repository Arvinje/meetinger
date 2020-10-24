resource "aws_dynamodb_table" "main" {
  name         = "${var.PROJECT_NAME}-${var.ENVIRONMENT}-main"
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
    Project = var.PROJECT_NAME
    Stage   = var.ENVIRONMENT
  }
}

resource "aws_ssm_parameter" "main_table_arn" {
  name        = "/dynamodb/${var.PROJECT_NAME}/${var.ENVIRONMENT}/main_table_arn"
  description = "The Main table's ARN for ${var.PROJECT_NAME} @ ${var.ENVIRONMENT}"
  type        = "SecureString"
  value       = aws_dynamodb_table.main.arn
  overwrite   = true

  tags = {
    Project = var.PROJECT_NAME
    Stage   = var.ENVIRONMENT
  }
}

resource "aws_ssm_parameter" "main_table_name" {
  name        = "/dynamodb/${var.PROJECT_NAME}/${var.ENVIRONMENT}/main_table_name"
  description = "The Main table's name for ${var.PROJECT_NAME} @ ${var.ENVIRONMENT}"
  type        = "SecureString"
  value       = aws_dynamodb_table.main.name
  overwrite   = true

  tags = {
    Project = var.PROJECT_NAME
    Stage   = var.ENVIRONMENT
  }
}