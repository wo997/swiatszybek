<?php //route[{ADMIN}/zaawansowane]

?>

<?php Templates::startSection("head"); ?>

<title>Zaawansowane</title>

<script>
    const advanced_settings = <?= json_encode(getSetting(["general", "advanced"])); ?>
</script>

<?php Templates::startSection("header"); ?>

<div class="custom_toolbar">
    <span class="title breadcrumbs">
        <div class="crumb">
            Ustawienia zaawansowane
        </div>
    </span>
    <button class="btn primary save_btn mla">Zapisz <i class="fas fa-save"></i></button>
</div>

<?php Templates::startSection("admin_page_body"); ?>

<div id="advancedSettingsForm">
    <span class="label mt0">Certyfikat SSL</span>
    <p-checkbox data-name="ssl"></p-checkbox>

    <span class="label">Tryb developmentu</span>
    <p-checkbox data-name="dev_mode"></p-checkbox>

    <span class="label">Tryb debugowania</span>
    <p-checkbox data-name="debug_mode"></p-checkbox>

    <span class="label">Domena sklepu</span>
    <input type="text" class="field" data-name="domain">

    <span class="label">Przekierowanie WWW</span>
    <div class="radio_group boxes hide_checks semi_bold flex" data-name="www_redirect">
        <div class="checkbox_area">
            <p-checkbox data-value=""></p-checkbox>
            <span>Brak przekierowania</span>
        </div>
        <div class="checkbox_area">
            <p-checkbox data-value="www"></p-checkbox>
            <span>WWW</span>
        </div>
        <div class="checkbox_area">
            <p-checkbox data-value="nowww"></p-checkbox>
            <span>Bez WWW</span>
        </div>
    </div>


</div>

<br><br>

<!-- <b>Takie tam informacje dla developera:</b><br> -->
<?= "" //json_encode(getSetting([]), JSON_PRETTY_PRINT) 
?>

<?php include "bundles/admin/templates/default.php"; ?>