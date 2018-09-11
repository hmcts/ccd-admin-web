// Infrastructural variables
variable "product" {
  type = "string"
}

variable "raw_product" {
  default = "ccd" // jenkins-library overrides product for PRs and adds e.g. pr-118-ccd
}

variable "component" {
  type = "string"
}

variable "location" {
  default = "UK South"
}

variable "env" {
  type = "string"
  description = "(Required) The environment in which to deploy the application infrastructure."
}

variable "ilbIp" {}

variable "subscription" {}

variable "vault_section" {
  default = "test"
}

variable "external_host_name" {
  type = "string"
  default = ""
}

variable "idam_api_url" {
  default = "http://betaDevBccidamAppLB.reform.hmcts.net"
}

variable "idam_service_name" {
  default = "ccd_admin"
}

variable "authentication_web_url" {
  default = "https://idam-test.dev.ccidam.reform.hmcts.net"
}

variable "node_env" {
  default = "production"
}

variable "use_csrf_protection" {
  default = "true"
}

variable "security_referrer_policy" {
  default = "origin"
}

variable "hpkp_max_age" {
  default = "2592000"
}

variable "hpkp_sha256s" {
  default = "Set-proper-SHA256s"
}

variable "capacity" {
  default = "1"
}

variable "https_only" {
  default = "true"
}

variable "common_tags" {
  type = "map"
}

variable "asp_name" {
  type = "string"
  description = "App Service Plan (ASP) to use for the webapp, 'use_shared' to make use of the shared ASP"
  default = "use_shared"
}

variable "asp_rg" {
  type = "string"
  description = "App Service Plan (ASP) resource group for 'asp_name', 'use_shared' to make use of the shared resource group"
  default = "use_shared"
}
