<?php //route[{ADMIN}produkt_old]

$product_id = Request::urlParam(2, -1);

$kopia = false;
if (isset($parts[3]) && $parts[3] == 'kopia') {
    $kopia = true;
}

if ($product_id === -1) {
    $product_data = [
        "title" => "",
        "link" => "",
        "seo_title" => "",
        "seo_description" => "",
        "description" => "",
        "gallery" => "[]",
        "published" => "0",
        "product_id" => "-1",
    ];
} else {
    $product_data = DB::fetchRow("SELECT * FROM products WHERE product_id = $product_id");

    if (!$product_data) {
        Request::redirect(Request::$static_urls["ADMIN"] . "produkt/");
    }
}

$categories_csv = DB::fetchVal("SELECT GROUP_CONCAT(category_id SEPARATOR ',') FROM link_product_category WHERE product_id = $product_id");

$allAttributeOptions = getAllAttributeOptions();
$allAttributeOptionsHTMLArray = $allAttributeOptions["html_array"];

$product_data["attributes"] = getAttributesFromDB("link_product_attribute_value", "product_attribute_values", "product_id", $product_id);

$product_data["variant_attribute_options"] = DB::fetchArr("SELECT attribute_id, attribute_values FROM link_variant_attribute_option WHERE product_id = $product_id ORDER BY kolejnosc ASC");

$variants = DB::fetchArr("SELECT * FROM variant WHERE product_id = $product_id ORDER BY kolejnosc ASC");

foreach ($variants as $key => $variant) {
    $variant["attributes"] = json_encode(getAttributesFromDB("link_variant_attribute_value", "variant_attribute_values", "variant_id", $variant["variant_id"]));
    $variants[$key] = $variant;
}

$product_data["variants"] = $variants;

if ($product_id === -1) {
    $product_form_header = "Nowy produkt";
} else {
    if ($kopia) {
        $product_form_header = "Kopia";
    } else {
        $product_form_header = "Edycja";
    }
    $product_form_header .= " produktu " . $product_data["title"];
}

if ($kopia) {
    $product_data["product_id"] = -1;
    $product_data["title"] .= " (kopia)";
}


?>

<?php startSection("head_content"); ?>

<script>
    useTool("cms");
    useTool("preview");

    var product_id = <?= $product_id ?>;
    var attribute_options_htmls = <?= json_encode($allAttributeOptionsHTMLArray) ?>;
    var attribute_values_array = <?= json_encode(DB::fetchArr('SELECT value, value_id, attribute_id, parent_value_id FROM attribute_values'), true) ?>;
    var attributes_array = <?= json_encode(DB::fetchArr('SELECT name, attribute_id FROM product_attributes'), true) ?>;
    var product_categories = [<?= $categories_csv ?>];
    var product_data = <?= json_encode($product_data) ?>;
</script>


<title>Edycja produktu</title>

<?php startSection("header"); ?>

<div class="custom_toolbar">
    <a class="btn transparent" href="<?= Request::$static_urls["ADMIN"] ?>produkty"><i class="fas fa-chevron-left"></i></a>

    <div class="title" style="max-width: calc(600px);overflow: hidden;white-space: nowrap;text-overflow: ellipsis;">
        <?= $product_form_header ?>
    </div>
    <div class="history-buttons product-history-buttons"></div>

    <?php if ($kopia) : ?>
        <a href="<?= Request::$static_urls["ADMIN"] ?>produkt/<?= $product_id ?>" class="btn primary">Anuluj kopiowanie <i class="fas fa-times"></i></a>
    <?php else : ?>
        <a href="<?= Request::$static_urls["ADMIN"] ?>produkt/<?= $product_id ?>/kopia" class="btn secondary">Kopiuj <i class="fas fa-copy"></i></a>
        <button data-href="<?= getProductLink($product_id, $product_data["title"]) ?>" class="btn primary">Pokaż produkt <i class="fas fa-chevron-circle-right"></i></button>
    <?php endif ?>
    <button onclick="showPreview()" class="btn primary">Podgląd <i class="fas fa-eye"></i></button>
    <button onclick="saveProduct()" class="btn primary">Zapisz <i class="fas fa-save"></i></button>
</div>

<?php startSection("body_content"); ?>

<div id="productForm" data-form data-warn-before-leave class="form-field-spacing" data-history="30" data-history-buttons=".product-history-buttons">
    <div class="label">Czy publiczny?</div>
    <p-checkbox name="published"></p-checkbox>
    <div style="display: flex" class="mobileRow">
        <div style="flex-grow:1; padding-right: 15px">
            <div style="max-width: 600px">
                <div class="label">Nazwa produktu</div>

                <input type="text" name="title" class="field" data-validate onchange="$(`#variantForm .product_name-copy`).setValue(this.value)">

                <div class="label">Link strony</div>
                <div class="glue_children">
                    <input type="text" name="link" data-validate class="field">
                    <button class="btn primary" onclick="rewrite($(`[name='title']`), $(this)._prev()._child(`.field`), {link:true})" data-tooltip="Uzupełnij na podstawie nazwy produktu" style="height: var(--field-height);">
                        <i class="fas fa-pen"></i>
                    </button>
                </div>

                <div class="label">Tytuł (SEO)</div>
                <div class="glue_children">
                    <input type="text" name="seo_title" class="field" data-show-count="60" data-count-description="(zalecane 50-58)">
                    <button class="btn primary" onclick="rewrite($(`[name='title']`), $(this)._prev()._child(`.field`))" data-tooltip="Uzupełnij na podstawie nazwy produktu" style="height: var(--field-height);">
                        <i class="fas fa-pen"></i>
                    </button>
                </div>

                <div class="label">Opis (SEO)</div>
                <textarea class="seo_description field" name="seo_description" data-show-count="158" data-count-description="(zalecane 130-155)"></textarea>
            </div>
        </div>
    </div>

    <div class='label'>
        Galeria zdjęć
        <span class='add_buttons'></span>
    </div>
    <div name="gallery" data-validate="|count:1+" style="max-width:600px"></div>

    <div class="label">Kategorie</div>
    <div class="category-picker" name="categories" data-source="product_categories"></div>

    <div style="margin-top: 10px">

        <div class="label">
            Opis główny
            <div onclick="editPage()" class="btn primary">Edytuj <i class="far fa-edit"></i></div>
        </div>
        <div name="description" data-type="html" class="cms preview_html" style="max-height: 400px"></div>
    </div>

    <div class="label">Cechy produktu (wspólne dla wszystkich wariantów produktu)</div>
    <div name="attributes" data-type="attribute_values"></div>

    <div class='label'>
        Oferta / Pola wyboru wariantów produktów
        <span class='add_buttons'></span>
    </div>
    <div name="variant_filters" class="slim root"></div>

    <span class='label'>
        Wszystkie warianty
        <span class='add_buttons' style='display:none'></span>
        <button class="btn important" onclick="fillVariantsFromFilters()">
            Uzupełnij na podstawie oferty
            <i class="fas fa-plus"></i>
        </button>
    </span>
    <div name="variants" class="no-remove">


    </div>

    <input type="hidden" name="product_id">

    <?php if (!$kopia) : ?>
        <div style="display: flex; justify-content: flex-end">
            <div class="btn red" style='margin-top:30px' onclick="deleteProduct()">Usuń produkt <i class="fa fa-trash"></i></div>
        </div>
    <?php endif ?>
</div>

<div id="variantForm" data-modal data-expand data-exclude-hidden data-form>
    <div class="modal_body">
        <div class="custom_toolbar">
            <span class="title medium">Edycja wariantu produktu</span>
            <button class="btn secondary" onclick="hideParentModal(this,true)">Anuluj <i class="fas fa-times"></i></button>
            <button class="btn primary" onclick="saveVariant();hideParentModal(this)">Zapisz <i class="fa fa-save"></i></button>
        </div>
        <div class="scroll_panel scroll_shadow panel_padding">
            <div>
                <div class="label">Nazwa wariantu <i class="fas fa-info-circle" data-tooltip="<b>Przykład</b><br>Nazwa produktu: Etui iPhone X<br>Nazwa wariantu: <span style='text-decoration:underline'>Zielone</span>"></i></div>

                <div class="glue_children">
                    <div class="product_name-copy field_desc" data-type="html"></div>
                    <input type="text" name="name" class="field">
                </div>

                <div class="label">Cena</div>
                <input type="number" name="price" class="field">

                <div class="label">Rabat</div>
                <input type="number" name="rabat" class="field">

                <div class="label">Ilość</div>
                <input type="number" name="stock" class="field">

                <div class="label">Kod produktu</div>
                <input type="text" name="product_code" class="field">

                <div style="display:none">
                    <div class="label">Kolor</div>
                    <input class="jscolor" name="color" onclick="this.select()" onchange="this.style.backgroundColor = this.value" style="width: 65px;text-align: center;">
                    <div class="btn primary" onclick="this._prev().value='';this._prev().style.backgroundColor=''">Brak <i class="fas fa-times"></i></div>-->
                </div>

                <div class="label">Cechy wariantu (inne niż wspólne dla wszystkich wariantów produktu)</div>
                <div name="attributes" data-type="attribute_values"></div>

                <div class="label">
                    Zdjecie
                    <button class="btn primary" onclick='fileManager.open(this._next(),{asset_types: ["image"]})'>Wybierz</button>
                    <img name="zdjecie" />
                </div>

                <div class="label">Widoczność</div>
                <select name="published" class="field">
                    <option value="1">Publiczny</option>
                    <option value="0">Ukryty</option>
                </select>

                <input type="hidden" name="was_stock">
                <input type="hidden" name="product_id">
                <input type="hidden" name="variant_id">
                <div style="display: flex; justify-content: flex-end; margin-top: 20px">
                    <button class=" btn red" onclick="saveVariant(true);hideParentModal(this)">Usuń wariant <i class="fa fa-trash"></i></button>
                </div>
            </div>
        </div>
    </div>
</div>

<?php include "bundles/admin/templates/default.php"; ?>