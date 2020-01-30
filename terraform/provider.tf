provider "aws" {
  region  = "${var.AWS_REGION}"
  profile = "${var.AWS_PROFILE}"
  version = "~> 2.27.0"
}

variable "AWS_REGION" {}

variable "AWS_PROFILE" {}