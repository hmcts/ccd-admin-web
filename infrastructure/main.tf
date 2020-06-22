provider "azurerm" {
  version = "2.15.0"
}

data "azurerm_key_vault" "ccd_shared_key_vault" {
  name = "${var.raw_product}-${var.env}"
  resource_group_name = "${var.raw_product}-shared-${var.env}"
}

data "azurerm_key_vault" "s2s_vault" {
  name = "s2s-${var.env}"
  resource_group_name = "rpe-service-auth-provider-${var.env}"
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
