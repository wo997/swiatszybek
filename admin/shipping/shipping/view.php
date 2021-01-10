<?php //route[{ADMIN}wysylki]

?>

<?php startSection("head_content"); ?>

<title>Wysyłki</title>

<?php startSection("header"); ?>

<div class="custom-toolbar">
    <div class="title">
        Wysyłki
    </div>
    <div>
        <button onclick="saveWysylki()" class="btn primary">Zapisz <i class="fas fa-save"></i></button>
    </div>
</div>

<?php startSection("body_content"); ?>

<div id="daneFirmyForm" class="desktopRow spaceColumns" data-form>
    <div>
        <div class="form-header">Ogólne</div>

        <div class="field-title">Email</div>
        <input type="text" class="field" name="main_email" data-validate="email">

    </div>

    <div>

    </div>
</div>

<?php include "admin/page_template.php"; ?>