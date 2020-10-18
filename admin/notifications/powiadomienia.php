<?php //route[{ADMIN}powiadomienia]

?>

<?php startSection("head"); ?>

<title>Wysyłki</title>

<style>

</style>

<script>
    /*domload(() => {
        setFormData(
            <?php echo json_encode(
                getSetting("general", "company", [])
            ); ?>, `#daneFirmyForm`);
    });*/

    function savePowiadomienia() {
        /*var form = $(`#daneFirmyForm`);

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
        });*/
    }
</script>

<?php startSection("header"); ?>

<div class="custom-toolbar">
    <div class="title">
        Wysyłki
    </div>
    <div>
        <button onclick="savePowiadomienia()" class="btn primary">Zapisz <i class="fas fa-save"></i></button>
    </div>
</div>

<?php startSection("content"); ?>

<div id="daneFirmyForm" class="desktopRow spaceColumns" data-form>
    <div>
        <div class="form-header">Ogólne</div>

        <div class="field-title">Email</div>
        <input type="text" class="field" name="main_email" data-validate="email">

    </div>

    <div>

    </div>
</div>

<?php include "admin/default_page.php"; ?>