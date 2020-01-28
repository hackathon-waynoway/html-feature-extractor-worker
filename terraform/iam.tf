# Task Role - Permissions for application in container.  Access to S3, SQS
# Execuction Role - Permissions for ECS to download image from ECR and upload logs to Cloudwatch
resource "aws_iam_role" "task_role" {
  name = "${var.application}-container-task-role"
  path = "/"

  assume_role_policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": "sts:AssumeRole",
      "Principal": {
        "Service": "ecs-tasks.amazonaws.com"
      },
      "Effect": "Allow",
      "Sid": ""
    }
  ]
}
EOF
}

resource "aws_iam_policy" "task_role_policy" {
  name = "${var.application}-container-task-policy"
  path = "/"

  policy = <<EOF
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "AllowReadFromSQS",
            "Effect": "Allow",
            "Action": [
                "sqs:ReceiveMessage",
                "sqs:ChangeMessageVisibility",
                "sqs:DeleteMessage",
                "sqs:GetQueueAttributes",
                "sqs:SetQueueAttributes"
            ],
            "Resource": "${aws_sqs_queue.input.arn}"
        },
        {
            "Sid": "AllowWriteToS3",
            "Effect": "Allow",
            "Action": [
              "s3:PutObject"
            ],
            "Resource": [
                "${aws_s3_bucket.output.arn}/*"
            ]
        }
    ]
}
EOF
}

resource "aws_iam_role_policy_attachment" "task_role_policy_attachment" {
  role       = "${aws_iam_role.task_role.name}"
  policy_arn = "${aws_iam_policy.task_role_policy.arn}"
}

resource "aws_iam_role" "task_execution_role" {
  name = "${var.application}-container-task-execution-role"
  path = "/"

  assume_role_policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": "sts:AssumeRole",
      "Principal": {
        "Service": "ecs-tasks.amazonaws.com"
      },
      "Effect": "Allow",
      "Sid": ""
    }
  ]
}
EOF
}

resource "aws_iam_role_policy_attachment" "task_execution_role_policy_attachment" {
  role       = "${aws_iam_role.task_execution_role.name}"
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

