<?php //route[{ADMIN}menu-glowne] 
?>

<?php startSection("head_content"); ?>

<title>Menu</title>

<?php startSection("body_content"); ?>

<h1>Menu główne</h1>

<div class="mytable"></div>

<div id="editCategory" data-modal data-expand data-form>
    <div class="modal-body">
        <div class="custom-toolbar">
            <span class="title">Edycja menu</span>
            <button class="btn secondary" onclick="hideParentModal(this,true)">Anuluj <i class="fas fa-times"></i></button>
            <button class="btn primary" onclick="saveCategoryForm();">Zapisz <i class="fa fa-save"></i></button>
        </div>
        <div class="scroll-panel scroll-shadow panel-padding">
            <div class="desktopRow spaceColumns">
                <div>
                    <div class="label">Nazwa menu</div>
                    <input type="text" name="title" data-validate autocomplete="off" class="field">
                </div>
                <div>
                    <div class="label">Widoczność</div>
                    <select name="published" class="field">
                        <option value="1">Publiczna</option>
                        <option value="0">Ukryta</option>
                    </select>
                </div>
            </div>

            <div class="label">Menu nadrzędne</div>
            <div class="category-picker" name="parent_id" data-source="menu" data-single></div>

            <div class="label">Powiązanie</div>
            <div class="tab-menu tab-menu-link">
                <div class="tab-header">
                    <div class="tab-option" data-tab_id="1">
                        Link URL
                    </div>
                    <div class="tab-option" data-tab_id="2">
                        Strona CMS
                    </div>
                    <div class="tab-option" data-tab_id="3">
                        Produkt
                    </div>
                </div>
                <div class="tab-content hidden" data-tab_id="1">
                    <div class="label">Wpisz link do strony - URL</div>
                    <input type="text" name="url" autocomplete="off" class="field" data-validate>
                </div>
                <div class="tab-content hidden" data-tab_id="2">
                    <div class="field-wrapper">
                        <div class="label">Wskaż stronę CMS</div>
                        <div class="strony"></div>
                    </div>
                </div>
                <div class="tab-content hidden" data-tab_id="3">
                    <div class="field-wrapper">
                        <div class="label">Wskaż produkt</div>
                        <div class="produkty"></div>
                    </div>
                </div>
            </div>

            <br>
            <div class="caseCanDelete" style="margin-top:auto;text-align:right; padding-top:30px">
                <i class='fas fa-info-circle' data-tooltip='Możliwe tylko po usunięciu wszystkich podmenu'></i>
                <button class="btn red" onclick="if(confirm('Czy aby na pewno chcesz usunąć to menu?')) saveCategoryForm(true);">Usuń <i class="fas fa-times"></i></button>
            </div>
            <input type="hidden" name="category_id">

        </div>
    </div>
</div>

<?php include "bundles/admin/templates/default.php"; ?>