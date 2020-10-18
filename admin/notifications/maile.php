<?php //route[{ADMIN}maile]

$main_email = $app["company_data"]["main_email"];

?>

<?php startSection("head"); ?>

<title>Maile</title>

<style>

</style>

<script>
    domload(() => {
        setFormData(
            <?= json_encode(
                getSetting("general", "emails", [])
            ); ?>, `#maileForm`);
    });

    function savePowiadomienia() {
        var form = $(`#maileForm`);

        if (!validateForm(form)) {
            return;
        }

        var params = {
            company: getFormData(form),
        };

        /*xhr({
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
        Maile
    </div>
    <div>
        <button onclick="savePowiadomienia()" class="btn primary">Zapisz <i class="fas fa-save"></i></button>
    </div>
</div>

<?php startSection("content"); ?>

<div id="maileForm" class="desktopRow spaceColumns" data-form>
    <div>
        <div class="form-header">Zamówienia</div>

        <div class="field-title">E-mail do zamówień (brak dla głównego)</div>
        <input type="text" class="field" name="orders_email" data-validate="email|optional" placeholder="<?= $main_email ?>">

        <div class="emails">
        </div>

        <div>

        </div>
    </div>

    <?php include "admin/default_page.php"; ?>