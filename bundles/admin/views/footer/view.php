<?php //route[{ADMIN}stopka]

?>

<?php startSection("head_content"); ?>

<title>Stopka</title>

<?php startSection("header"); ?>

<div class="custom-toolbar">
    <div class="title">
        Stopka
    </div>
    <div>
        <button onclick="showPreview()" class="btn primary">Podgląd <i class="fas fa-eye"></i></button>
        <button onclick="saveFooter()" class="btn primary">Zapisz <i class="fas fa-save"></i></button>
    </div>
</div>

<?php startSection("body_content"); ?>

<div id="footerForm">
    <div class="label">
        Stopka
        <div onclick="editFooter()" class="btn primary">Edytuj <i class="far fa-edit"></i></div>
    </div>
    <div name="page_footer" data-type="html" class="cms preview_html"></div>
</div>

<?php include "bundles/admin/templates/default.php"; ?>