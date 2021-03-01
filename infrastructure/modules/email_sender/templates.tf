resource "aws_ses_template" "main" {
  for_each = var.SES_TEMPLATES

  name    = "${var.PROJECT_NAME}-${var.ENVIRONMENT}-${each.key}"
  subject = each.value.subject
  html    = each.value.html
  text    = each.value.text
}