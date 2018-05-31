// Infrastructural variables
variable "product" {
  type = "string"
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

variable "s2s_url" {
  default = "http://betaDevBccidamS2SLB.reform.hmcts.net"
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
