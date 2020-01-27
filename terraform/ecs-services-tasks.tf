resource "aws_ecs_cluster" "cluster" {
  name = "${var.application}"
}

resource "aws_ecs_task_definition" "task_definition" {
  family        = "${var.application}"
  task_role_arn = "${aws_iam_role.task_role.arn}"

  container_definitions = <<DEFINITION
[
  {
    "volumesFrom": [],
    "memory": 2000,
    "extraHosts": null,
    "dnsServers": null,
    "disableNetworking": null,
    "dnsSearchDomains": null,
    "hostname": null,
    "essential": true,
    "entryPoint": null,
    "mountPoints": [],
    "name": "${var.application}",
    "ulimits": null,
    "dockerSecurityOptions": null,
    "environment": [
      {
        "name": "AWS_REGION",
        "value": "${var.region}"
      },
      {
        "name": "SQS_QUEUE_URL",
        "value": "${aws_sqs_queue.input.id}"
      },
      {
        "name": "S3_BUCKET_NAME",
        "value": "${aws_s3_bucket.output.id}"
      }
    ],
    "links": null,
    "workingDirectory": null,
    "readonlyRootFilesystem": null,
    "image": "${aws_ecr_repository.repository.repository_url}:latest",
    "command": null,
    "user": null,
    "dockerLabels": null,
    "logConfiguration": null,
    "cpu": 0,
    "privileged": null,
    "memoryReservation": 750,
    "memory": 2000,
    "healthCheck": null
  }
]
DEFINITION
}

resource "aws_ecs_service" "service" {
  name                               = "${var.application}"
  cluster                            = "${aws_ecs_cluster.cluster.arn}"
  desired_count                      = "1"

  task_definition = "${element(aws_ecs_task_definition.task_definition.*.arn, count.index)}"
}
