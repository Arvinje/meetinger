resource "aws_sqs_queue" "emails_to_send" {
  name = "${var.PROJECT_NAME}-${var.ENVIRONMENT}-EmailsToSend"

  tags = {
    Project = var.PROJECT_NAME
    Stage   = var.ENVIRONMENT
  }
}

resource "aws_ssm_parameter" "emails_to_send_queue_arn" {
  name        = "/sqs/${var.PROJECT_NAME}/${var.ENVIRONMENT}/EmailsToSendQueue_arn"
  description = "EmailsToSendQueue SQS's ARN for ${var.PROJECT_NAME} @ ${var.ENVIRONMENT}"
  type        = "SecureString"
  value       = aws_sqs_queue.emails_to_send.arn
  overwrite   = true

  tags = {
    Project = var.PROJECT_NAME
    Stage   = var.ENVIRONMENT
  }
}

resource "aws_ssm_parameter" "emails_to_send_queue_url" {
  name        = "/sqs/${var.PROJECT_NAME}/${var.ENVIRONMENT}/EmailsToSendQueue_url"
  description = "EmailsToSendQueue SQS's URL for ${var.PROJECT_NAME} @ ${var.ENVIRONMENT}"
  type        = "SecureString"
  value       = aws_sqs_queue.emails_to_send.id
  overwrite   = true

  tags = {
    Project = var.PROJECT_NAME
    Stage   = var.ENVIRONMENT
  }
}