variable "PROJECT_NAME" {}

variable "ENVIRONMENT" {}

variable "SNS_TOPICS" {
  type    = set(string)
  default = ["MeetingCreated", "AttendeeJoined", "AttendeeLeft", "MeetingChanged"]
}