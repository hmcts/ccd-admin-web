provider "vault" {
  address = "https://vault.reform.hmcts.net:6200"
}

locals {
  is_frontend = "${var.external_host_name != "" ? "1" : "0"}"
  external_host_name = "${var.external_host_name != "" ? var.external_host_name : "null"}"

  ase_name = "${data.terraform_remote_state.core_apps_compute.ase_name[0]}"

  local_env = "${(var.env == "preview" || var.env == "spreview") ? (var.env == "preview" ) ? "aat" : "saat" : var.env}"
  local_ase = "${(var.env == "preview" || var.env == "spreview") ? (var.env == "preview" ) ? "core-compute-aat" : "core-compute-saat" : local.ase_name}"

  env_ase_url = "${local.local_env}.service.${local.local_ase}.internal"

  s2s_url = "http://rpe-service-auth-provider-${local.env_ase_url}"
  def_store_url = "http://ccd-definition-store-api-${local.env_ase_url}"
  userprofile_url = "http://ccd-user-profile-api-${local.env_ase_url}"

  // Vault name
  previewVaultName = "${var.raw_product}-shared-aat"
  nonPreviewVaultName = "${var.raw_product}-shared-${var.env}"
  vaultName = "${(var.env == "preview" || var.env == "spreview") ? local.previewVaultName : local.nonPreviewVaultName}"

  // Shared Resource Group
  previewResourceGroup = "${var.raw_product}-shared-aat"
  nonPreviewResourceGroup = "${var.raw_product}-shared-${var.env}"
  sharedResourceGroup = "${(var.env == "preview" || var.env == "spreview") ? local.previewResourceGroup : local.nonPreviewResourceGroup}"

  // Storage Account
  previewStorageAccountName = "${var.raw_product}sharedaat"
  nonPreviewStorageAccountName = "${var.raw_product}shared${var.env}"
  storageAccountName = "${(var.env == "preview" || var.env == "spreview") ? local.previewStorageAccountName : local.nonPreviewStorageAccountName}"
}

data "azurerm_key_vault" "ccd_shared_key_vault" {
  name = "${local.vaultName}"
  resource_group_name = "${local.vaultName}"
}

data "vault_generic_secret" "idam_service_key" {
  path = "secret/${var.vault_section}/ccidam/service-auth-provider/api/microservice-keys/ccd-admin"
}

data "vault_generic_secret" "oauth2_client_secret" {
  path = "secret/${var.vault_section}/ccidam/idam-api/oauth2/client-secrets/ccd-admin"
}

module "ccd-admin-web" {
  source = "git@github.com:hmcts/moj-module-webapp?ref=master"
  product = "${var.product}-${var.component}"
  location = "${var.location}"
  env = "${var.env}"
  ilbIp = "${var.ilbIp}"
  subscription = "${var.subscription}"
  is_frontend = "${local.is_frontend}"
  additional_host_name = "${local.external_host_name}"
  capacity = "${var.capacity}"
  https_only = "${var.https_only}"
  common_tags  = "${var.common_tags}"

  app_settings = {
    // Node specific vars
    USE_CSRF_PROTECTION = "${var.use_csrf_protection}"
    SECURITY_REFERRER_POLICY = "${var.security_referrer_policy}"
    HPKP_MAX_AGE = "${var.hpkp_max_age}"
    HPKP_SHA256S = "${var.hpkp_sha256s}"
    NODE_ENV = "${var.node_env}"
    UV_THREADPOOL_SIZE = "64"
    NODE_CONFIG_DIR = "D:\\home\\site\\wwwroot\\config"
    TS_BASE_URL = "./src/main"

    // Logging vars
    REFORM_TEAM = "${var.product}"
    REFORM_SERVICE_NAME = "${var.component}"
    REFORM_ENVIRONMENT = "${var.env}"

    // Application vars
    // IDAM
    IDAM_BASE_URL = "${var.idam_api_url}"
    IDAM_S2S_URL = "${local.s2s_url}"
    IDAM_ADMIN_WEB_SERVICE_KEY = "${data.vault_generic_secret.idam_service_key.data["value"]}"
    IDAM_SERVICE_NAME = "${var.idam_service_name}"
    IDAM_LOGOUT_URL = "${var.authentication_web_url}/login/logout"

    IDAM_OAUTH2_TOKEN_ENDPOINT = "${var.idam_api_url}/oauth2/token"
    IDAM_OAUTH2_CLIENT_ID = "ccd_admin"
    IDAM_OAUTH2_AW_CLIENT_SECRET = "${data.vault_generic_secret.oauth2_client_secret.data["value"]}"

    ADMINWEB_LOGIN_URL = "${var.authentication_web_url}/login"
    ADMINWEB_IMPORT_URL = "${local.def_store_url}/import"
    ADMINWEB_JURISDICTIONS_URL = "${local.def_store_url}/api/data/jurisdictions"
    ADMINWEB_USER_PROFILE_URL = "${local.userprofile_url}/users"
    ADMINWEB_SAVE_USER_PROFILE_URL = "${local.userprofile_url}/users/save"
  }
}
