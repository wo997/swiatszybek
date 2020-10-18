<?php //route[{ADMIN}zaawansowane]

?>

<?php startSection("head"); ?>

<title>Zaawansowane</title>

<style>

</style>

<script>
    domload(() => {
        setFormData(
            <?php echo json_encode(
                getSetting("general", "advanced", [])
            ); ?>, `#zaawansowaneForm`);
    });

    function saveZawansowane() {
        var form = $(`#zaawansowaneForm`);

        if (!validateForm(form)) {
            return;
        }

        var params = {
            advanced: getFormData(form),
        };

        xhr({
            url: STATIC_URLS["ADMIN"] + "save_zaawansowane",
            params: params,
            success: () => {
                setFormInitialState(form);
            }
        });
    }
</script>

<?php startSection("header"); ?>

<div class="custom-toolbar">
    <span class="title">Zaawansowane</span>
    <button class="btn primary" onclick="saveZawansowane()">Zapisz <i class="fa fa-save"></i></button>
</div>

<?php startSection("content"); ?>

<div id="zaawansowaneForm">
    <label class="checkbox-wrapper field-title block">
        Certyfikat SSL
        <input type="checkbox" name="ssl">
        <div class="checkbox"></div>
    </label>

    <label class="checkbox-wrapper field-title block">
        Tryb developmentu
        <input type="checkbox" name="dev_mode">
        <div class="checkbox"></div>
    </label>

    <label class="checkbox-wrapper field-title block">
        Tryb debugowania
        <input type="checkbox" name="debug_mode">
        <div class="checkbox"></div>
    </label>

    <span class="field-title">Domena witryny</span>
    <input type="text" class="field" name="domain">
</div>

<?php include "admin/default_page.php"; ?>