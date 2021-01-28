<?php //route[{ADMIN}kategorie] 
?>

<?php startSection("head_content"); ?>

<title>Kategorie produktów</title>

<?php startSection("body_content"); ?>

<h1>Kategorie produktów</h1>

<div class="mytable"></div>

<div id="editCategory" data-modal data-expand data-form>
    <div class="modal-body">
        <div class="custom-toolbar">
            <span class="title">Edycja kategorii</span>
            <button class="btn secondary" onclick="hideParentModal(this,true)">Anuluj <i class="fa fa-times"></i></button>
            <button class="btn primary" onclick="saveCategoryForm();">Zapisz <i class="fa fa-save"></i></button>
        </div>
        <div class="scroll-panel scroll-shadow panel-padding">
            <div>
                <div class="label">Nazwa kategorii</div>
                <input type="text" name="title" data-validate autocomplete="off" class="field">

                <div class="label">Link</div>
                <div style="display:flex">
                    <input type="text" name="link" data-validate autocomplete="off" class="field">
                    <button class="btn primary" onclick="rewriteURL()" style="flex-shrink:0">Uzupełnij na podstawie tytułu</button>
                </div>

                <div class="label">Widoczność</div>
                <select name="published" class="field">
                    <option value="1">Publiczna</option>
                    <option value="0">Ukryta</option>
                </select>

                <div class="label">
                    Ikonka
                    <button class="btn primary" onclick='fileManager.open(this._next(),{asset_types:["image"], size: "sm"})'>Wybierz</button>
                    <img name="icon" style="max-width:100px;max-height:100px" />
                </div>

                <div class="label">Kategoria nadrzędna</div>
                <div class="category-picker" name="parent_id" data-source="product_categories" data-single></div>

                <div class="label">Wyświetlane filtry (atrybuty) <a href="<?= Request::$static_urls["ADMIN"] ?>atrybuty" target="_blank" class="btn secondary" onclick="editAttribute()"><span>Zarządzaj</span> <i class="fa fa-cog"></i></a> </div>
                <div class="atrybuty"></div>

                <div class="label">Opis górny <button class="btn primary" onclick='quillEditor.open($(`#editCategory .description`));'>Edytuj</button></div>
                <div class="description ql-editor preview_html" name="description" data-type="html" style="max-height: 300px;"></div>

                <div class="label">Zawartość (dół) <button class="btn primary" onclick="editCMS($('#editCategory .content'));">Edytuj </button></div>
                <div class="content cms preview_html" name="content" data-type="html" style="max-height: 300px;"></div>

                <div class="caseCanDelete" style="margin-left:auto;margin-top:auto;align-self: flex-end; padding-top:30px; padding-bottom: 15px">
                    <button class="btn red" onclick="if(confirm(' Czy aby na pewno chcesz usunąć tą kategorię?')) saveCategoryForm(true);">Usuń <i class="fa fa-times"></i></button>
                    <i class='fas fa-info-circle' data-tooltip='Możliwe tylko po usunięciu podkategorii'></i>
                </div>
            </div>
        </div>

        <input type="hidden" name="category_id">
    </div>
</div>

<?php include "admin/page_template.php"; ?>