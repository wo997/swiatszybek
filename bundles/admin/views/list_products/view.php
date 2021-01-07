<?php //route[{ADMIN}test-view-1]

?>

<?php startSection("head_content"); ?>

<title>test 2</title>



<?php startSection("header"); ?>

<div class="custom-toolbar">
    <span class="title">Zaawansowane</span>
    <button class="btn primary" onclick="saveZawansowane()">Zapisz <i class="fa fa-save"></i></button>
</div>

<?php startSection("body_content"); ?>

<div id="zaawansowaneForm">
    <span class="field-title">Certyfikat SSL</span>
    <checkbox name="ssl"></checkbox>

    <span class="field-title">Tryb developmentu</span>
    <checkbox name="dev_mode"></checkbox>

    <span class="field-title">Tryb debugowania</span>
    <checkbox name="debug_mode"></checkbox>

    <span class="field-title">Domena witryny</span>
    <input type="text" class="field" name="domain">

</div>

<?php include "admin/page_template.php"; ?>