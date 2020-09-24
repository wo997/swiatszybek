<?php //route[admin/konfiguracja2]

if (!isset($url_params[2])) {
    redirect("/admin/zamowienia");
}
$category = $url_params[2];

?>

<?php startSection("head"); ?>

<title>Konfiguracja</title>

<style>

</style>

<script>
    function save() {
        xhr({
            url: "/admin/save-config/<?= $category ?>",
            params: getFormData($("#configForm")),
            success: (res) => {
                window.location.reload();
            }
        });
    }

    var default_values = <?= json_encode(include "admin/settings/$category/defaults.php") ?>;

    function setDefaults() {
        setFormData(default_values, $("#configForm"), {
            is_load: false
        });
    }
</script>

<?php startSection("header"); ?>

<div class="custom-toolbar">
    <span class="title">Ustawienia</span>

    <button class="btn secondary" onclick="setDefaults()">Przywróć domyślne</button>

    <button class="btn primary" onclick="save()">Zapisz</button>
</div>

<?php startSection("content"); ?>

<div id="configForm" data-form data-warn-before-leave>
    <?php include "admin/settings/$category/form.php" ?>
</div>

<?php include "admin/default_page.php"; ?>