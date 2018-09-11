output "ccd_admin_web_endpoint" {
  value = "${module.ccd-admin-web.gitendpoint}"
}

output "vaultUri" {
  value = "${data.azurerm_key_vault.ccd_shared_key_vault.vault_uri}"
}

output "vaultName" {
  value = "${local.vaultName}"
}
