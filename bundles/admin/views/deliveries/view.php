<?php //route[{ADMIN}/wysylki]

?>

<?php startSection("head_content"); ?>

<title>Wysyłki</title>

<?php startSection("header"); ?>

<div class="custom_toolbar">
    <span class="title breadcrumbs">
        <div class="crumb">
            Wysyłki
        </div>
    </span>
    <div>
        <button onclick="saveWysylki()" class="btn primary">Zapisz <i class="fas fa-save"></i></button>
    </div>
</div>

<?php startSection("body_content"); ?>

<div id="deliveriesForm" class="desktop_row space_columns">
    <div class="label first">Sposób wyliczania ceny wysyłki</div>

    <div class="radio_group space_items">
        <div class="checkbox_area">
            <p-checkbox data-value="static"></p-checkbox>
            <span>Stała cena</span>
        </div>

        <div class="checkbox_area">
            <p-checkbox data-value="cart_price"></p-checkbox>
            <span>Cena zależna od wartości produktów</span>
        </div>

        <div class="checkbox_area">
            <p-checkbox data-value="dimensions"></p-checkbox>
            <span>Cena na podstawie wymiarów oraz wagi</span>
        </div>
    </div>

    <div class="label">Darmowa wysyłka od określonej ceny minimalnej</div>
    <p-checkbox class="toggle_free_from"></p-checkbox>

    <div class="expand_y hidden animate_hidden case_free_from">
        <div class="label">Cena minimalna</div>
        <input class="field free_from inline" data-number inputmode="numeric">

        <div class="label">Waka maksymalna</div>
        <input class="field max_weight inline" data-number inputmode="numeric">
    </div>

</div>

<?php include "bundles/admin/templates/default.php"; ?>