resource "aws_s3_bucket" "output" {
  bucket = "${var.application}-output"

  lifecycle_rule {
    id      = "expiration"
    enabled = true

    expiration {
      days = 30
    }
  }
}
