<?php //route[{ADMIN}/czat]

?>

<?php Templates::startSection("head"); ?>

<script>
    const company_info = <?= json_encode(getSetting(["general", "company"])); ?>
</script>

<title>Czat z klientem</title>

<?php Templates::startSection("header"); ?>

<div class="custom_toolbar">
    <span class="title breadcrumbs">
        <div class="crumb">
            Czat z klientem
        </div>
    </span>
    <div class="mla">
        <button class="btn primary save_btn">Zapisz <i class="fas fa-save"></i></button>
    </div>
</div>

<?php Templates::startSection("admin_page_body"); ?>

Czat tu ziom

<?php include "bundles/admin/templates/default.php"; ?>