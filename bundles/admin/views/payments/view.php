<?php //route[{ADMIN}/platnosci]

?>

<?php Templates::startSection("head_content"); ?>

<script>
    const payments_data = <?= json_encode(getSetting(["general", "payments"], "[]")); ?>
</script>

<title>Płatności</title>

<?php Templates::startSection("header"); ?>

<div class="custom_toolbar">
    <span class="title breadcrumbs">
        <div class="crumb">
            Płatności
        </div>
    </span>
    <div class="mla">
        <button class="btn primary save_payments_btn">Zapisz <i class="fas fa-save"></i></button>
    </div>
</div>

<?php Templates::startSection("admin_page_body"); ?>

<div id="paymentsForm" class="desktop_row space_columns">
    <div>
        <div class="medium">Przelewy24</div>

        <div class="label">Merchant ID</div>
        <input class="field" data-name="p24_merchant_id">

        <div class="label">Pos ID (jeśli brak - przepisz Merchant ID)</div>
        <input class="field" data-name="p24_pos_id">

        <div class="label">CRC</div>
        <input class="field" data-name="p24_crc">

        <div class="label">Klucz do raportów (zwroty)</div>
        <input class="field" data-name="p24_reports_key">

        <div class="label">Tryb testowy</div>
        <p-checkbox data-name="p24_test_mode"></p-checkbox>
    </div>
</div>

<?php include "bundles/admin/templates/default.php"; ?>