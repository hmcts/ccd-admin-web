provider "azurerm" {
  version = "1.22.1"
}

locals {
  app_full_name = "${var.product}-${var.component}"

  is_frontend = "${var.external_host_name != "" ? "1" : "0"}"
  external_host_name = "${var.external_host_name != "" ? var.external_host_name : "null"}"

  ase_name = "core-compute-${var.env}"

  local_env = "${(var.env == "preview" || var.env == "spreview") ? (var.env == "preview" ) ? "aat" : "saat" : var.env}"
  local_ase = "${(var.env == "preview" || var.env == "spreview") ? (var.env == "preview" ) ? "core-compute-aat" : "core-compute-saat" : local.ase_name}"

  env_ase_url = "${local.local_env}.service.${local.local_ase}.internal"

  s2s_url = "http://rpe-service-auth-provider-${local.env_ase_url}"

  def_store_url = "http://ccd-definition-store-api-${local.env_ase_url}"
  userprofile_url = "http://ccd-user-profile-api-${local.env_ase_url}"

  // Vault name
  previewVaultName = "${var.raw_product}-aat"
  nonPreviewVaultName = "${var.raw_product}-${var.env}"
  vaultName = "${(var.env == "preview" || var.env == "spreview") ? local.previewVaultName : local.nonPreviewVaultName}"

  // Shared Resource Group
  previewResourceGroup = "${var.raw_product}-shared-aat"
  nonPreviewResourceGroup = "${var.raw_product}-shared-${var.env}"
  sharedResourceGroup = "${(var.env == "preview" || var.env == "spreview") ? local.previewResourceGroup : local.nonPreviewResourceGroup}"

  sharedAppServicePlan = "${var.raw_product}-${var.env}"
  sharedASPResourceGroup = "${var.raw_product}-shared-${var.env}"
}

data "azurerm_key_vault" "ccd_shared_key_vault" {
  name = "${local.vaultName}"
  resource_group_name = "${local.sharedResourceGroup}"
}

data "azurerm_key_vault" "s2s_vault" {
  name = "s2s-${local.local_env}"
  resource_group_name = "rpe-service-auth-provider-${local.local_env}"
}

data "azurerm_key_vault_secret" "idam_service_key" {
  name = "microservicekey-ccd-admin"
  key_vault_id = "${data.azurerm_key_vault.s2s_vault.id}"
}

data "azurerm_key_vault_secret" "oauth2_client_secret" {
  name = "ccd-admin-web-oauth2-client-secret"
  key_vault_id = "${data.azurerm_key_vault.ccd_shared_key_vault.id}"
}

resource azurerm_key_vault_secret "idam_service_secret" {
  name = "microservicekey-ccd-admin"
  value = "${data.azurerm_key_vault_secret.idam_service_key.value}"
  key_vault_id = "${data.azurerm_key_vault.ccd_shared_key_vault.id}"
}

module "ccd-admin-web" {
  source = "git@github.com:hmcts/cnp-module-webapp?ref=master"
  product = "${local.app_full_name}"
  location = "${var.location}"
  appinsights_location = "${var.location}"
  env = "${var.env}"
  ilbIp = "${var.ilbIp}"
  subscription = "${var.subscription}"
  is_frontend = "${local.is_frontend}"
  additional_host_name = "${local.external_host_name}"
  capacity = "${var.capacity}"
  https_only = "${var.https_only}"
  common_tags  = "${var.common_tags}"
  asp_name = "${(var.asp_name == "use_shared") ? local.sharedAppServicePlan : var.asp_name}"
  asp_rg = "${(var.asp_rg == "use_shared") ? local.sharedASPResourceGroup : var.asp_rg}"
  website_local_cache_sizeinmb = 800
  appinsights_instrumentation_key = "${var.appinsights_instrumentation_key}"

  app_settings = {
    // Node specific vars
    WEBSITE_NODE_DEFAULT_VERSION = "~12"
    USE_CSRF_PROTECTION = "${var.use_csrf_protection}"
    SECURITY_REFERRER_POLICY = "${var.security_referrer_policy}"
    SECURE_AUTH_COOKIE_ENABLED = "true"
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
    IDAM_ADMIN_WEB_SERVICE_KEY = "${data.azurerm_key_vault_secret.idam_service_key.value}"
    IDAM_SERVICE_NAME = "${var.idam_service_name}"

    IDAM_OAUTH2_TOKEN_ENDPOINT = "${var.idam_api_url}/oauth2/token"
    IDAM_OAUTH2_LOGOUT_ENDPOINT = "${var.idam_api_url}/session/:token"
    IDAM_OAUTH2_CLIENT_ID = "ccd_admin"
    IDAM_OAUTH2_AW_CLIENT_SECRET = "${data.azurerm_key_vault_secret.oauth2_client_secret.value}"

    ADMINWEB_LOGIN_URL = "${var.authentication_web_url}/login"
    ADMINWEB_IMPORT_URL = "${local.def_store_url}/import"
    ADMINWEB_JURISDICTIONS_URL = "${local.def_store_url}/api/data/jurisdictions"
    ADMINWEB_USER_PROFILE_URL = "${local.userprofile_url}/users"
    ADMINWEB_SAVE_USER_PROFILE_URL = "${local.userprofile_url}/users/save"
    ADMINWEB_USER_ROLE_URL = "${local.def_store_url}/api/user-role"
    ADMIN_ALL_USER_ROLES_URL = "${local.def_store_url}/api/user-roles"
    ADMINWEB_CREATE_DEFINITION_URL = "${local.def_store_url}/api/draft"
    ADMINWEB_UPDATE_DEFINITION_URL = "${local.def_store_url}/api/draft/save"
    ADMINWEB_DELETE_DEFINITION_URL = "${local.def_store_url}/api/draft"
    ADMINWEB_DEFINITIONS_URL = "${local.def_store_url}/api/drafts"
    ADMINWEB_WHOAMI_URL = "${local.def_store_url}/api/idam/profile"
    ADMINWEB_AUTHORIZATION_URL = "${local.def_store_url}/api/idam/adminweb/authorization"
    ADMINWEB_IMPORT_AUDITS_URL = "${local.def_store_url}/api/import-audits"
    ADMINWEB_ROLES_WHITELIST = "ccd-import,ccd-import-validate"
  }
}
