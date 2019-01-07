output "ccd_admin_web_endpoint" {
  value = "${module.ccd-admin-web.gitendpoint}"
}

output "vaultName" {
  value = "${local.vaultName}"
}
