<?php //route[{ADMIN}dane-firmy]

?>

<?php startSection("head"); ?>

<title>Dane firmy</title>

<style>

</style>

<script>
    domload(() => {
        setFormData(
            <?= json_encode(
                getSetting("general", "company", [])
            ); ?>, `#daneFirmyForm`);
    });

    function saveDaneFirmy() {
        var form = $(`#daneFirmyForm`);

        if (!validateForm(form)) {
            return;
        }

        var params = {
            company: getFormData(form),
        };

        xhr({
            url: STATIC_URLS["ADMIN"] + "save_dane_firmy",
            params: params,
            success: () => {
                setFormInitialState(form);
            }
        });
    }
</script>

<?php startSection("header"); ?>

<div class="custom-toolbar">
    <div class="title">
        Dane firmy
    </div>
    <div>
        <button onclick="saveDaneFirmy()" class="btn primary">Zapisz <i class="fas fa-save"></i></button>
    </div>
</div>

<?php startSection("content"); ?>

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
    </div>
</div>

<?php include "admin/page_template.php"; ?>