provider "aws" {
  region = "eu-central-1"
}

module "cognito" {
  source = "../../../modules/cognito"

  PROJECT_NAME = var.project_name
  ENVIRONMENT  = var.dev_stage
}

module "main_dynamodb_table" {
  source = "../../../modules/dynamodb"

  PROJECT_NAME = var.project_name
  ENVIRONMENT  = var.dev_stage
}

module "sns_topics" {
  source = "../../../modules/sns"

  PROJECT_NAME = var.project_name
  ENVIRONMENT  = var.dev_stage
}

module "email_sender" {
  source = "../../../modules/email_sender"

  PROJECT_NAME = var.project_name
  ENVIRONMENT  = var.dev_stage
}
