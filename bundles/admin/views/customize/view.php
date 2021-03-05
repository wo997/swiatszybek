<?php //route[/{ADMIN}szablon]

?>

<?php startSection("head_content"); ?>

<title>Szablon</title>

<?php startSection("header"); ?>

<div class="custom_toolbar">
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
        <div class="label">
            Kolor motywu
        </div>
        <input type='text' class='field inline jscolor' name="primary-clr">

        <div class="label">
            Kolor kup teraz
        </div>
        <input type='text' class='field inline jscolor' name="buynow-clr">
        <br><br>
        <div>Te pod spodem to nie wiem po co no ale niech będą</div>
        <div class="label">
            Lekki szary
        </div>
        <input type='text' class='field inline jscolor' name="subtle-font-clr">

        <div class="label">
            Lekki szary tło
        </div>
        <input type='text' class='field inline jscolor' name="subtle-background-clr">



    </div>
</div>

<?php include "bundles/admin/templates/default.php"; ?>