resource "aws_ecs_cluster" "cluster" {
  name = "${var.application}"
}

resource "aws_ecs_task_definition" "task_definition" {
  family                   = "${var.application}"
  task_role_arn            = "${aws_iam_role.task_role.arn}"
  execution_role_arn       = "${aws_iam_role.task_execution_role.arn}"
  cpu                      = "512"
  memory                   = "2048"
  requires_compatibilities = ["FARGATE"]
  network_mode             = "awsvpc"

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
        "value": "${var.AWS_REGION}"
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
    "logConfiguration": {
        "logDriver": "awslogs",
        "secretOptions": null,
        "options": {
            "awslogs-group": "${aws_cloudwatch_log_group.log_group.name}",
            "awslogs-region": "${var.AWS_REGION}",
            "awslogs-stream-prefix": "ecs"
        }
    },
    "cpu": 0,
    "privileged": null,
    "memoryReservation": null,
    "memory": null,
    "healthCheck": null
  }
]
DEFINITION
}

resource "aws_ecs_service" "service" {
  name          = "${var.application}"
  cluster       = "${aws_ecs_cluster.cluster.arn}"
  desired_count = "0"
  launch_type   = "FARGATE"

  network_configuration {
    subnets          = ["subnet-37c64c52"]
    assign_public_ip = true
    
  }

  task_definition = "${aws_ecs_task_definition.task_definition.arn}"

  lifecycle {
    ignore_changes = ["desired_count"]
  }
}
