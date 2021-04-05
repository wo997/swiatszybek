<?php //route[{ADMIN}/zaawansowane]

?>

<?php startSection("head_content"); ?>

<title>Zaawansowane</title>

<script>
    const advanced_settings = <?= json_encode(getSetting(["general", "advanced"])); ?>
</script>

<?php startSection("header"); ?>

<div class="custom_toolbar">
    <span class="title breadcrumbs">
        <div class="crumb">
            Ustawienia zaawansowane
        </div>
    </span>
    <button class="btn primary save_advanced_settings_btn">Zapisz <i class="fas fa-save"></i></button>
</div>

<?php startSection("body_content"); ?>

<div id="advancedSettingsForm">
    <span class="label">Certyfikat SSL</span>
    <p-checkbox data-name="ssl"></p-checkbox>
    <span class="label">Tryb developmentu</span>
    <p-checkbox data-name="dev_mode"></p-checkbox>
    <span class="label">Tryb debugowania</span>
    <p-checkbox data-name="debug_mode"></p-checkbox>
    <span class="label">Domena sklepu</span>
    <input type="text" class="field" data-name="domain">

</div>

<br><br>

<b>Takie tam informacje dla developera:</b><br>
<?= json_encode(getSetting([]), JSON_PRETTY_PRINT) ?>

<?php include "bundles/admin/templates/default.php"; ?>