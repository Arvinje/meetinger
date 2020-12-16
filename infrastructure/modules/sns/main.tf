resource "aws_sns_topic" "main" {
  for_each = var.SNS_TOPICS

  name = each.value
  tags = {
    Project = var.PROJECT_NAME
    Stage   = var.ENVIRONMENT
  }
}

resource "aws_ssm_parameter" "sns_topic_arn" {
  for_each = var.SNS_TOPICS

  name        = "/sns/${var.PROJECT_NAME}/${var.ENVIRONMENT}/${each.value}_arn"
  description = "${each.value} topic's ARN for ${var.PROJECT_NAME} @ ${var.ENVIRONMENT}"
  type        = "SecureString"
  value       = aws_sns_topic.main[each.key].arn
  overwrite   = true

  tags = {
    Project = var.PROJECT_NAME
    Stage   = var.ENVIRONMENT
  }
}