<?php //route[{ADMIN}/wysylki]

?>

<?php Templates::startSection("head_content"); ?>

<title>Wysyłki</title>

<script>
    <?= preloadDeliveryTypes() ?>
    const carriers_data = <?= json_encode(DB::fetchArr("SELECT * FROM carrier")) ?>;
    const deliveries_config = <?= json_encode(getSetting(["general", "deliveries"])) ?>;
</script>

<?php Templates::startSection("header"); ?>

<div class="custom_toolbar">
    <span class="title breadcrumbs mra">
        <div class="crumb">
            Wysyłki
        </div>
    </span>
    <button class="btn primary save_btn ml1">Zapisz <i class="fas fa-save"></i></button>
</div>

<?php Templates::startSection("admin_page_body"); ?>

<deliveries-config-comp class="main"></deliveries-config-comp>

<?php include "bundles/admin/templates/default.php"; ?>