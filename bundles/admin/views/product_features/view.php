<?php //route[{ADMIN}cechy] 
?>

<?php startSection("head_content"); ?>

<title>Cechy produktów</title>

<?php startSection("body_content"); ?>

<h1>Cechy produktów</h1>

<div class="mytable"></div>

<div id="editAttribute" data-modal data-expand data-exclude-hidden data-form>
    <div class="modal-body">
        <div class="custom-toolbar">
            <span class="title">Edycja cechy</span>
            <button class="btn secondary" onclick="hideParentModal(this,true)">Anuluj <i class="fa fa-times"></i></button>
            <button class="btn primary" onclick="saveAttribute();">Zapisz <i class="fa fa-save"></i></button>
        </div>
        <div class="scroll-panel scroll-shadow panel-padding">
            <div class="desktopRow spaceColumns">
                <div>
                    <div class="label">Nazwa cechy</div>
                    <input type="text" name="name" data-validate autocomplete="off" class="field">

                    <div class="label">Typ danych</div>
                    <select name="data_type" class="field" onchange="toggleValues()"></select>

                    <div class="attribute_values_textlist_wrapper">
                        <span class='label'>
                            Wszystkie wartości
                            <span class='add_buttons'></span>
                        </span>
                        <div name="attribute_values_textlist" class="slim"></div>
                    </div>

                    <div class="attribute_values_colorlist_wrapper">
                        <span class='label'>
                            Wszystkie kolory
                            <span class='add_buttons'></span>
                        </span>
                        <div name="attribute_values_colorlist" class="slim"></div>
                    </div>
                </div>
                <div>
                    <div class="label">Wyświetl filtry w kategoriach <a href="<?= Request::$static_urls["ADMIN"] ?>kategorie" target="_blank" class="btn secondary" onclick="editAttribute()"><span>Zarządzaj</span> <i class="fa fa-cog"></i></a></div>
                    <div class="kategorie"></div>
                </div>
            </div>

            <br>
            <div style="margin-top:auto; align-self: flex-end; padding-top:30px; margin-bottom:10px">
                <button class="btn red" onclick="if(confirm('Czy aby na pewno chcesz usunąć tę cechę?')) saveAttribute(true);">Usuń <i class="fa fa-times"></i></button>
            </div>

            <input type="hidden" name="attribute_id">

        </div>
    </div>
</div>

<?php include "admin/page_template.php"; ?>