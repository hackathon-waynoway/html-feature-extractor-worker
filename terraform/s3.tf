resource "aws_s3_bucket" "output" {
  bucket = "${var.application}-output"
  acl = "public-read"

  lifecycle_rule {
    id      = "expiration"
    enabled = true

    expiration {
      days = 30
    }
  }

  policy = <<EOF
{
    "Version": "2008-10-17",
    "Statement": [
        {
            "Sid": "PublicReadForGetBucketObjects",
            "Effect": "Allow",
            "Principal": {
                "AWS": "*"
            },
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::${var.application}-output/*"
        }
    ]
}
EOF
}
