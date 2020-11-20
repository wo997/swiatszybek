<?php //route[{ADMIN}zaawansowane]

?>

<?php startSection("head"); ?>

<title>Zaawansowane</title>

<style>

</style>

<script>
    domload(() => {
        setFormData(
            <?= json_encode(
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

    //Darkmode flow
    function toggleDarkmode() {
        if (document.querySelector('#dark-mode').classList.contains("checked")) {
            document.querySelector('#admin').classList.add('dark');
        } else {
            document.querySelector('#admin').classList.remove('dark');
        }
    }
</script>

<?php startSection("header"); ?>

<div class="custom-toolbar">
    <span class="title">Zaawansowane</span>
    <button class="btn primary" onclick="saveZawansowane()">Zapisz <i class="fa fa-save"></i></button>
</div>

<?php startSection("content"); ?>

<div id="zaawansowaneForm">
    <span class="field-title">Certyfikat SSL</span>
    <checkbox name="ssl"></checkbox>

    <span class="field-title">Tryb developmentu</span>
    <checkbox name="dev_mode"></checkbox>

    <span class="field-title">Tryb debugowania</span>
    <checkbox name="debug_mode"></checkbox>

    <span class="field-title">Domena witryny</span>
    <input type="text" class="field" name="domain">

    <br><hr>

    <!-- TODO: Docelowo kazdy użytkownik powinien miec swoje ustawienia -->
    <span class="field-title">Tryb ciemny panelu</span>
    <checkbox onclick="toggleDarkmode()" id="dark-mode" name="darkmode"></checkbox>
</div>

<?php include "admin/page_template.php"; ?>