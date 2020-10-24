provider "aws" {
  region  = "eu-central-1"
}

module "cognito" {
  source = "../../../modules/cognito"
  
  PROJECT_NAME  = var.project_name
  ENVIRONMENT   = var.dev_stage
}

module "main_dynamodb_table" {
  source = "../../../modules/dynamodb"
  
  PROJECT_NAME  = var.project_name
  ENVIRONMENT   = var.dev_stage
}
