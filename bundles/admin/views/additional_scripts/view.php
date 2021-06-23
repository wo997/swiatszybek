<?php //route[{ADMIN}/dodatkowe-skrypty]

?>

<?php Templates::startSection("head"); ?>

<title>Dodatkowe skrypty</title>

<script>
    const additional_scripts = <?= json_encode(getSetting(["general", "additional_scripts"])); ?>
</script>

<?php Templates::startSection("header"); ?>

<div class="custom_toolbar">
    <span class="title breadcrumbs">
        <div class="crumb">
            Dodatkowe skrypty
        </div>
    </span>
    <button class="btn primary save_btn mla">Zapisz <i class="fas fa-save"></i></button>
</div>

<?php Templates::startSection("admin_page_body"); ?>

<div id="additionalScriptsForm">
    <span class="label">Skrypty w headerze</span>
    <textarea type="text" class="field" data-name="header" style="height:500px"></textarea>

    <span class="label">Skrypty w footerze</span>
    <textarea type="text" class="field" data-name="footer" style="height:500px"></textarea>
</div>

<?php include "bundles/admin/templates/default.php"; ?>