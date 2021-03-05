<?php //route[/{ADMIN}test-view-1]

?>

<?php startSection("head_content"); ?>

<title>test 2</title>



<?php startSection("header"); ?>

<div class="custom_toolbar">
    <span class="title">Zaawansowane</span>
    <button class="btn primary" onclick="saveZawansowane()">Zapisz <i class="fa fa-save"></i></button>
</div>

<?php startSection("body_content"); ?>

<div id="zaawansowaneForm">
    <span class="label">Certyfikat SSL</span>
    <p-checkbox name="ssl">
    </p-checkbox> <span class="label">Tryb developmentu</span>
    <p-checkbox name="dev_mode">
    </p-checkbox> <span class="label">Tryb debugowania</span>
    <p-checkbox name="debug_mode">
    </p-checkbox> <span class="label">Domena witryny</span>
    <input type="text" class="field" name="domain">

</div>

<?php include "bundles/admin/templates/default.php"; ?>