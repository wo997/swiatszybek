<?php //route[{ADMIN}/wysylki]

?>

<?php startSection("head_content"); ?>

<title>Wysyłki</title>

<script>
    let carriers_data = <?= json_encode(DB::fetchArr("SELECT * FROM carrier")) ?>;
</script>

<?php startSection("header"); ?>

<div class="custom_toolbar">
    <span class="title breadcrumbs">
        <div class="crumb">
            Wysyłki
        </div>
    </span>
    <div>
        <button class="btn primary save_btn">Zapisz <i class="fas fa-save"></i></button>
    </div>
</div>

<?php startSection("body_content"); ?>

<deliveries-config-comp class="main"></deliveries-config-comp>

<?php include "bundles/admin/templates/default.php"; ?>