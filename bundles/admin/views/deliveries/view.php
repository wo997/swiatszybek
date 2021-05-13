<?php //route[{ADMIN}/wysylki]

?>

<?php startSection("head_content"); ?>

<title>Wysyłki</title>

<script>
    <?= preloadDeliveryTypes() ?>
    const carriers_data = <?= json_encode(DB::fetchArr("SELECT * FROM carrier")) ?>;
    const deliveries_config = <?= json_encode(getSetting(["general", "deliveries"])) ?>;
</script>

<?php startSection("header"); ?>

<div class="custom_toolbar">
    <span class="title breadcrumbs">
        <div class="crumb">
            Wysyłki
        </div>
    </span>
    <div class="mla">
        <button class="btn primary save_btn">Zapisz <i class="fas fa-save"></i></button>
    </div>
</div>

<?php startSection("admin_page_body"); ?>

<deliveries-config-comp class="main"></deliveries-config-comp>

<?php include "bundles/admin/templates/default.php"; ?>