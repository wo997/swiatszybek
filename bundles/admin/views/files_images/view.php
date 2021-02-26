<?php //route[{ADMIN}pliki-zdjecia]

?>

<?php startSection("head_content"); ?>

<title>Pliki / Zdięcia</title>

<?php startSection("header"); ?>

<div class="custom-toolbar">
    <span class="title"><span class="medium">Pliki / Zdjęcia</span> <button class="btn important upload_btn">Prześlij zdjęcia <i class="fas fa-plus"></i></button></span>
</div>

<?php startSection("body_content"); ?>

<file-manager-comp class="files"></file-manager-comp>

<?php include "bundles/admin/templates/default.php"; ?>