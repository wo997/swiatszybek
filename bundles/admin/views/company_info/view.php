<?php //route[{ADMIN}/dane-firmy]

?>

<?php startSection("head_content"); ?>

<script>
    const company_info = <?= json_encode(getSetting("general", "company", [])); ?>
</script>

<title>Dane firmy</title>

<?php startSection("header"); ?>

<div class="custom_toolbar">
    <span class="title breadcrumbs">
        <div class="crumb">
            Dane firmy
        </div>
    </span>
    <div>
        <button class="btn primary save_company_info_btn">Zapisz <i class="fas fa-save"></i></button>
    </div>
</div>

<?php startSection("body_content"); ?>

<div id="daneFirmyForm">
    <div>
        <div class="medium">Ogólne</div>

        <div class="label">Email</div>
        <input type="text" class="field" data-name="main_email" data-validate="email">

        <div class="label">Nazwa nadawcy maila</div>
        <input type="text" class="field" data-name="email_sender">

        <div class="label">Nr telefonu</div>
        <input type="text" class="field" data-name="main_phone">

        <div class="label">Nazwa firmy</div>
        <input type="text" class="field" data-name="company_name">

        <div class="label">Godziny otwarcia (słownie)</div>
        <input type="text" class="field" data-name="opening_hours">
    </div>

    <br>

    <div>
        <div class="medium">Adres firmy</div>

        <div class="label">Kod pocztowy</div>
        <input type="text" class="field" data-name="post_code">

        <div class="label">Miasto</div>
        <input type="text" class="field" data-name="city">

        <div class="label">Nazwa ulicy</div>
        <input type="text" class="field" data-name="street_name">

        <div class="label">Nr ulicy</div>
        <input type="text" class="field" data-name="street_number">

        <div class="label">Adres fanpage</div>
        <input type="text" class="field" data-name="fb_fanpage_url" data-validate="url|optional">
    </div>
</div>

<?php include "bundles/admin/templates/default.php"; ?>