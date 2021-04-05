<?php //route[{ADMIN}/wysylki]

?>

<?php startSection("head_content"); ?>

<title>Wysyłki</title>

<?php startSection("header"); ?>

<div class="custom_toolbar">
    <span class="title breadcrumbs">
        <div class="crumb">
            Wysyłki
        </div>
    </span>
    <div>
        <button onclick="saveWysylki()" class="btn primary">Zapisz <i class="fas fa-save"></i></button>
    </div>
</div>

<?php startSection("body_content"); ?>

<deliveries-config-comp class="main"></deliveries-config-comp>

<?php include "bundles/admin/templates/default.php"; ?>