<?php //route[{ADMIN}/integracje-wysylek]

?>

<?php Templates::startSection("head"); ?>

<script>
    const delivery_integrations_data = <?= json_encode(getSetting(["general", "delivery_integrations"], [])); ?>
</script>

<title>Integracje wysyłek</title>

<?php Templates::startSection("header"); ?>

<div class="custom_toolbar">
    <span class="title breadcrumbs">
        <div class="crumb">
            Integracje wysyłek
        </div>
    </span>
    <div class="mla">
        <button class="btn primary save_delivery_integrations_btn">Zapisz <i class="fas fa-save"></i></button>
    </div>
</div>

<?php Templates::startSection("admin_page_body"); ?>

<div id="deliveryIntegrationsForm" class="desktop_row space_columns">
    <div>
        <div class="medium">InPost</div>

        <div class="label">Organization ID</div>
        <input class="field" data-name="inpost_organization_id">

        <div class="label">Token API</div>
        <textarea class="field" data-name="inpost_token" style="height: 100px;"></textarea>

        <div class="label">Tryb testowy</div>
        <p-checkbox data-name="inpost_test_mode"></p-checkbox>
    </div>
</div>

<?php include "bundles/admin/templates/default.php"; ?>