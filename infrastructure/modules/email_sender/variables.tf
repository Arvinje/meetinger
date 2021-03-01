variable "PROJECT_NAME" {}

variable "ENVIRONMENT" {}

variable "SES_TEMPLATES" {
  type = map(object({
    subject = string
    html    = string
    text    = string
  }))

  default = {
    AttendeeJoined = {
      subject = "See you at {{meetingTitle}}!"
      html    = "<h1>See you at {{meetingTitle}}!</h1><h3>{{meetingStartsAt}}</h3>"
      text    = "See you at {{meetingTitle}}!\r\n{{meetingStartsAt}}"
    }
  }
}