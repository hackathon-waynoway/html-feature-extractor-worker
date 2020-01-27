provider "aws" {
  region  = "${var.region}"
  profile = "${var.profile}"
  version = "~> 2.27.0"
}

variable "region" {}

variable "profile" {}