<?php //route[{ADMIN}/dane-firmy]

?>

<?php Templates::startSection("head_content"); ?>

<script>
    const company_info = <?= json_encode(getSetting(["general", "company"])); ?>
</script>

<title>Dane firmy</title>

<?php Templates::startSection("header"); ?>

<div class="custom_toolbar">
    <span class="title breadcrumbs">
        <div class="crumb">
            Dane firmy
        </div>
    </span>
    <div class="mla">
        <button class="btn primary save_btn">Zapisz <i class="fas fa-save"></i></button>
    </div>
</div>

<?php Templates::startSection("admin_page_body"); ?>

<div id="companyInfoForm" class="desktop_row space_columns">
    <div>
        <div class="medium">Ogólne</div>

        <div class="label">Email główny</div>
        <input class="field" data-name="main_email" data-validate="email">

        <div class="label">Nazwa sklepu</div>
        <input class="field" data-name="shop_name">

        <!-- <div class="label">Nr telefonu</div>
        <input class="field" data-name="main_phone"> -->

        <!-- <div class="label">Nazwa firmy</div>
        <input class="field" data-name="company_name"> -->

        <!-- <div class="label">Godziny otwarcia (słownie)</div>
        <input class="field" data-name="opening_hours"> -->
    </div>

    <br>

    <div class="hidden">
        <div class="medium text_error">Adres firmy</div>

        <div class="label">Kod pocztowy</div>
        <input class="field" data-name="post_code">

        <div class="label">Miasto</div>
        <input class="field" data-name="city">

        <div class="label">Nazwa ulicy</div>
        <input class="field" data-name="street">

        <div class="label">Nr ulicy</div>
        <input class="field" data-name="building_number">

        <div class="label">Nr mieszkania</div>
        <input class="field" data-name="flat_number">

        <!-- <div class="label">Adres fanpage</div>
        <input class="field" data-name="fb_fanpage_url" data-validate="url|optional"> -->
    </div>
</div>

<?php include "bundles/admin/templates/default.php"; ?>