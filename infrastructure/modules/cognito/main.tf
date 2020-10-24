resource "aws_cognito_user_pool" "this" {
  name = "${var.PROJECT_NAME}_user_pool_${var.ENVIRONMENT}"

  auto_verified_attributes = [
    "email"
  ]
  
  alias_attributes = [
    "email"
  ]

  username_configuration {
    case_sensitive = false
  }

  schema {
    name                      = "email"
    attribute_data_type       = "String"
    developer_only_attribute  = false
    mutable                   = true
    required                  = true
    string_attribute_constraints {
      min_length = 6
      max_length = 100
    }
  }

  password_policy {
    minimum_length    = 10
    require_lowercase = false
    require_numbers   = false
    require_symbols   = false
    require_uppercase = false
  }

  tags = {
    Project = var.PROJECT_NAME
    Stage   = var.ENVIRONMENT
  }
}

resource "aws_cognito_user_pool_client" "web_client" {
  name = "${var.PROJECT_NAME}-${var.ENVIRONMENT}-user-pool-client-web"

  user_pool_id = aws_cognito_user_pool.this.id
}

resource "aws_ssm_parameter" "cognito_pool_iss" {
  name        = "/cognito-user-pool/${var.PROJECT_NAME}/${var.ENVIRONMENT}/iss"
  description = "Endpoint to get public keys of ${var.PROJECT_NAME} @ ${var.ENVIRONMENT} user pool."
  type        = "SecureString"
  value       = "https://${aws_cognito_user_pool.this.endpoint}"
  overwrite   = true

  tags = {
    Project = var.PROJECT_NAME
    Stage   = var.ENVIRONMENT
  }
}
