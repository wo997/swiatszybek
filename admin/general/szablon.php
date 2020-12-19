<?php //route[{ADMIN}szablon]

?>

<?php startSection("head_content"); ?>

<title>Szablon</title>

<style>

</style>

<script>
    useTool("preview");

    domload(() => {
        setFormData(
            <?= json_encode([
                "colors" => getSetting("theme", "general", ["colors"])
            ]); ?>, `#themeForm`);
    });

    function saveTheme() {
        var form = $(`#themeForm`);

        if (!validateForm(form)) {
            return;
        }

        var params = {
            data: getFormData(form)
        };

        xhr({
            url: STATIC_URLS["ADMIN"] + "save_theme",
            params: params,
            success: () => {
                setFormInitialState(form);
            }
        });
    }

    function showPreview() {
        /*var form = $(`#themeForm`);

        if (!validateForm(form)) {
            return;
        }

        var data = getFormData(form);

        data.theme = $(`[name="theme"]`).getValue();

        window.preview.open("/", data);*/
    }
</script>

<?php startSection("header"); ?>

<div class="custom-toolbar">
    <div class="title">
        Szablon
    </div>
    <div>
        <button onclick="showPreview()" class="btn primary">Podgląd <i class="fas fa-eye"></i></button>
        <button onclick="saveTheme()" class="btn primary">Zapisz <i class="fas fa-save"></i></button>
    </div>
</div>

<?php startSection("body_content"); ?>

<div id="themeForm" data-form>
    <div data-form="colors">
        <div class="field-title">
            Kolor motywu
        </div>
        <input type='text' class='field inline jscolor' name="primary-clr">

        <div class="field-title">
            Kolor kup teraz
        </div>
        <input type='text' class='field inline jscolor' name="buynow-clr">
        <br><br>
        <div>Te pod spodem to nie wiem po co no ale niech będą</div>
        <div class="field-title">
            Lekki szary
        </div>
        <input type='text' class='field inline jscolor' name="subtle-font-clr">

        <div class="field-title">
            Lekki szary tło
        </div>
        <input type='text' class='field inline jscolor' name="subtle-background-clr">



    </div>
</div>

<?php include "admin/page_template.php"; ?>