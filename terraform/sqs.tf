resource "aws_sqs_queue" "input" {
  name                       = "${var.application}-queue"
  message_retention_seconds  = 86400
  receive_wait_time_seconds  = 20
  visibility_timeout_seconds = 30
  redrive_policy             = "{\"deadLetterTargetArn\":\"${aws_sqs_queue.deadletter.arn}\",\"maxReceiveCount\":4}"
}

#
# Deadletter queue
#
resource "aws_sqs_queue" "deadletter" {
  name                       = "${var.application}-queue-deadletter"
  receive_wait_time_seconds  = 5
  visibility_timeout_seconds = 30
}
