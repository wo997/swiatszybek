<?php //route[{ADMIN}dane-firmy]

?>

<?php startSection("head_content"); ?>

<script>
    const daneFirmy = <?= json_encode(getSetting("general", "company", [])); ?>
</script>

<title>Dane firmy</title>

<?php startSection("header"); ?>

<div class="custom-toolbar">
    <div class="title">
        Dane firmy
    </div>
    <div>
        <button onclick="saveDaneFirmy()" class="btn primary">Zapisz <i class="fas fa-save"></i></button>
    </div>
</div>

<?php startSection("body_content"); ?>

<div id="daneFirmyForm" class="desktopRow spaceColumns" data-form>
    <div>
        <div class="form-header">Ogólne</div>

        <div class="field-title">Email</div>
        <input type="text" class="field" name="main_email" data-validate="email">

        <div class="field-title">Nazwa nadawcy maila</div>
        <input type="text" class="field" name="email_sender">

        <div class="field-title">Nr telefonu</div>
        <input type="text" class="field" name="main_phone">

        <div class="field-title">Nazwa firmy</div>
        <input type="text" class="field" name="company_name">

        <div class="field-title">Godziny otwarcia (słownie)</div>
        <input type="text" class="field" name="opening_hours">
    </div>

    <div>
        <div class="form-header">Adres firmy</div>

        <div class="field-title">Kod pocztowy</div>
        <input type="text" class="field" name="postal_code">

        <div class="field-title">Miasto</div>
        <input type="text" class="field" name="city">

        <div class="field-title">Nazwa ulicy</div>
        <input type="text" class="field" name="street_name">

        <div class="field-title">Nr ulicy</div>
        <input type="text" class="field" name="street_number">

        <div class="field-title">Adres fanpage</div>
        <input type="text" class="field" name="fb_fanpage_url" data-validate="url|optional">
    </div>
</div>

<?php include "admin/page_template.php"; ?>