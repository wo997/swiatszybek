<?php //route[{ADMIN}/nowe-strony] 
?>

<?php startSection("head_content"); ?>

<title>Strony</title>

<?php startSection("body_content"); ?>

<div class="label">Rozmiar czcionki</div>
<input class="field font_size">

<div class="piep_editor">
    <div class="piep_editor_content">
        <h1>teścik</h1>
        <div>dfghdsfsdfsdfsdf</div>
        <div>dfghdfg dsfgh dgfdf gds fhghf</div>
        <div>dfghdfghdfgh</div>
        <div style="display:flex;">
            <div>left</div>
            <div>right</div>
        </div>
    </div>
</div>

<!-- <div>
    <div contenteditable="true">teścik</div>
    <div contenteditable="true">dfghdsfsdfsdfsdf</div>
    <div contenteditable="true">dfghdfg dsfgh dgfdf gds fhghf</div>
    <div contenteditable="true">dfghdfghdfgh</div>
    <div contenteditable="true"></div>
</div> -->

<?php include "bundles/admin/templates/default.php"; ?>