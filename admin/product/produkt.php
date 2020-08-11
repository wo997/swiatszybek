<?php //route[admin/produkt]

$parts = explode("/", $url);
if (isset($parts[2]))
  $product_id = intval($parts[2]);
else {
  run();
}

$kopia = false;
if (isset($parts[3]) && $parts[3] == 'kopia') {
  //$kopia = true;
}

$product_data = fetchRow("SELECT * FROM products WHERE product_id = $product_id");

$categories = fetchValue("SELECT GROUP_CONCAT(category_id SEPARATOR ',') FROM link_product_category WHERE product_id = $product_id");

//$attribute_values = fetchValue("SELECT GROUP_CONCAT(value_id SEPARATOR ',') FROM link_product_attribute_value WHERE product_id = $product_id");

include_once "admin/product/attributes_service.php";

$displayAllAttributeOptions = displayAllAttributeOptions();

$product_data["product_attributes"] = getAttributesFromDB("link_product_attribute_value", "product_attribute_values", "product_id", $product_id);


?>


<?php startSection("head"); ?>

<style>

</style>
<script>
  useTool("cms");

  function comboSelectValuesChanged(combo) {
    combo.findAll("select").forEach(select => {
      for (option of select.options) {
        var childSelect = combo.find(`select[data-parent_value_id="${option.value}"]`);
        if (!childSelect) continue;
        if (option.value == select.value) {
          childSelect.classList.remove("hidden");
        } else {
          childSelect.classList.add("hidden");
        }
      }
      select.classList.toggle("empty", select.value == "");
    });
  }

  function registerComboSelects() {
    $$(".combo-select-wrapper").forEach(combo => {

      combo.findAll("select:not(.registered)").forEach(select => {
        select.classList.add("registered");

        select.addEventListener("change", () => {
          var wrapper = findParentByClassName(select, "combo-select-wrapper");
          comboSelectValuesChanged(wrapper);
        });

        var wrapper = findParentByClassName(select, "combo-select-wrapper");
        comboSelectValuesChanged(wrapper);
      });
    });
  }

  function anythingValueChanged(anything) {
    var checkbox = anything.find(`input[type="checkbox"]`);
    var input = anything.find(`.field`);

    input.classList.toggle("hidden", !checkbox.checked);
  }

  function registerAnythingValues() {
    $$(".any-value-wrapper").forEach(anything => {
      var checkbox = anything.find(`input[type="checkbox"]:not(.registered)`);
      if (!checkbox) return;
      checkbox.classList.add("registered");
      checkbox.addEventListener("change", () => {
        var wrapper = findParentByClassName(checkbox, "any-value-wrapper");
        anythingValueChanged(wrapper);
      });

      var wrapper = findParentByClassName(checkbox, "any-value-wrapper");
      anythingValueChanged(wrapper);

    });
  }

  window.addEventListener("DOMContentLoaded", function() {

    registerComboSelects();

    registerAnythingValues();

    loadCategoryPicker("product_categories", {
      skip: 2
    }, () => {
      setCategoryPickerValues(
        $(`[data-category-picker-name="categories"]`),
        [<?= $categories ?>]
      );
    });

    <?php if ($kopia) : ?>
      $(`[name="title"]`).value += " (kopia)";
      $(`[name="product_id"]`).value = "-1";
    <?php endif ?>

    registerTextCounters();

    createTable({
      name: "variants",
      url: "/admin/search_variant",
      db_table: "variant",
      primary: "variant_id",
      sortable: {
        required_filter: "product_id"
      },
      lang: {
        subject: "wariantów",
      },
      requiredParam: () => {
        return <?= $product_id ?>;
      },
      definition: [{
          title: "Nazwa wariantu",
          width: "35%",
          render: (r) => {
            return r.name
          }
        },
        {
          title: "Cena",
          width: "10%",
          render: (r) => {
            return r.price;
          }
        },
        {
          title: "Rabat",
          width: "10%",
          render: (r) => {
            return r.rabat;
          }
        },
        {
          title: "Ilość",
          width: "10%",
          render: (r) => {
            return r.stock;
          }
        },
        {
          title: "Zdjęcie",
          width: "10%",
          render: (r) => {
            return `<img style='display:block;width:70px;' src='/uploads/sm/${r.zdjecie}'>`;
          },
          escape: false
        },
        getPublishedDefinition(),
        {
          title: "",
          width: "95px",
          render: (r, i) => {
            return `<div class='btn primary' onclick='editVariant(${i},this)'>Edytuj <i class="fas fa-cog"></i></div>`;
          },
          escape: false
        }
      ],
      controls: `
                <div class='float-icon'>
                    <input type="text" placeholder="Szukaj..." data-param="search">
                    <i class="fas fa-search"></i>
                </div>
                <div class="btn primary" onclick="newVariant(this)"><span>Nowy wariant</span> <i class="fa fa-plus"></i></div>
            `
    });

    createSimpleList({
      name: "gallery",
      fields: {
        src: {
          unique: true,
        }
      },
      render: (data) => {
        var clean = (x) => {
          return x.toString().replace(/"/g, "");
        };
        return `
            <button type="button" class="btn primary" onclick="imagePicker.open(this.next())">Wybierz</button>
            <img data-list-param="src" data-type="src" data-src-prefix="/uploads/sm/" src="${data.src ? "/uploads/sm/" + clean(data.src) : ""}" style="margin: 10px;max-width:200px;max-height:200px">
          `;
      },
      default_row: {
        src: ""
      },
      title: "Galeria zdjęć produktu"
    });

    setFormData(<?= json_encode($product_data) ?>, $("#productForm"));
  });

  window.addEventListener("load", function() {
    imagePicker.setDefaultTag($('[name="title"]').value);
  });

  function deleteItem() {
    anyChange = false;
    if (confirm("Czy chcesz usunąć produkt?")) {
      window.location = '/admin/delete_product/<?= $kopia ? '-1' : $product_id ?>';
    }
  }

  function copyMainImage(node) {
    node.setAttribute("src", $("#img-main").getAttribute("src"));
  }

  function editPage() {
    imagePicker.setDefaultTag($('[name="title"]').value);
    editCMS($('#product-content'));
  }

  function newVariant(btn) {
    var data = {
      name: "",
      price: "",
      rabat: "",
      stock: "",
      product_code: "",
      color: "",
      zdjecie: "",
      published: "0",
      variant_id: "-1",
      product_id: <?= $product_id ?>
    };
    setFormData(data, $("#variantEdit"));

    $(`[name="was_stock"]`).value = data.stock;

    showModal("variantEdit", {
      source: btn
    });
  }

  function editVariant(i, btn) {
    var formName = "variantEdit";
    var data = variants.results[i];

    data.was_stock = data.stock;

    setFormData(data, $(`#${formName}`));

    showModal(formName, {
      source: btn
    });

    xhr({
      url: "/admin/get_variant_attributes",
      params: {
        variant_id: data.variant_id
      },
      success: (data) => {
        setFormData(data, $("#variantEdit"));

        setModalInitialState(formName);
      }
    });
  }

  function saveVariantForm(remove = false) {
    var params = getFormData($("#variantEdit"));

    if (remove) {
      params["remove"] = true;
    }

    xhr({
      url: "/admin/save_variant",
      params: params,
      success: () => {
        variants.search();
      }
    });
  }

  function saveProductForm() {

    var params = getFormData($("#productForm"));

    xhr({
      url: "/admin/save_product",
      params: params,
      success: () => {
        window.location.reload();
      }
    });
  }

  function rewriteURL() {
    $(`[name="link"]`).value = getLink($(`[name="title"]`).value);
  }
</script>

<title>Edycja produktu</title>

<?php startSection("content"); ?>

<div>
  <div id="productForm">
    <div class="custom-toolbar">
      <div class="title" style="max-width: calc(600px);overflow: hidden;white-space: nowrap;text-overflow: ellipsis;">
        <?php if ($kopia) : ?>
          Kopiowanie
        <?php else : ?>
          Edycja
        <?php endif ?>
        <?= $product_data["title"] ?>
      </div>
      <div>
        <?php if ($kopia) : ?>
          <a href="/admin/produkt/<?= $product_id ?>" class="btn secondary" style="padding: 2px 4px;">Anuluj <i class="fa fa-times"></i></a>
        <?php else : ?>
          <!--<a href="/admin/produkt/<?= $product_id ?>/kopia" class="btn secondary" style="padding: 2px 4px;">Kopiuj <i class="fas fa-copy"></i></a>-->
          <a href="/produkt/<?= $product_id . "/" . getLink($product_data["title"]) ?>" class="btn secondary" style="padding: 2px 4px;">Pokaż bez zapisywania <i class="fas fa-external-link-alt"></i></a>
        <?php endif ?>
        <button onclick="saveProductForm()" class="btn primary" style="padding: 2px 4px;" onclick="anyChange=false">Zapisz <i class="fas fa-save"></i></button>
      </div>
    </div>
    <label class="field-title" style="user-select:none;display:inline-block">Czy publiczny? <input type="checkbox" name="published">
      <div class="checkbox"></div>
    </label>
    <div style="display: flex" class="mobileRow">
      <div style="flex-grow:1; padding-right: 15px">
        <div class="field-title">Nazwa produktu</div>
        <input type="text" name="title" class="field" style="max-width: 600px;">

        <div class="field-title">Link strony</div>
        <div style="display:flex;flex-wrap: wrap;">
          <input type="text" name="link" data-validate autocomplete="off" class="field" style="max-width: 600px;">
          <button class="btn primary" onclick="rewriteURL()" style="flex-shrink:0">Uzupełnij na podstawie tytułu</button>
        </div>

        <div class="field-title">Tytuł (SEO)</div>
        <input type="text" name="seo_title" class="field" style="max-width: 600px;" data-show-count="60" data-count-description="(zalecane 50-58)">

        <div class="field-title">Opis (SEO)</div>
        <textarea class="seo_description field" name="seo_description" data-show-count="158" data-count-description="(zalecane 130-155)"></textarea>
      </div>
    </div>


    <div class="gallery"></div>

    <div class="field-title">Kategorie</div>
    <input type="hidden" name="categories" data-category-picker data-category-picker-source="product_categories">

    <div class="field-title">Atrybuty produktu (ogólne)</div>
    <div name="product_attributes" data-type="attribute_values"><?= $displayAllAttributeOptions ?></div>

    <div style="margin-top: 10px">

      <div class="field-title">
        Opis główny
        <div onclick="editPage()" class="btn primary">Edytuj <i class="far fa-edit"></i></div>
      </div>
      <div id="product-content" name="description" data-type="html" class="cms" style="border:1px solid #ccc;max-height: calc(100vh - 352px);overflow-y:auto"></div>
    </div>

    <h2 style="text-align:center">Warianty <span style="font-size: 0.7rem">(min. 1)</span></h2>

    <div class="variants"></div>

    <input type="hidden" name="product_id">

    <?php if (!$kopia) : ?>
      <div style="display: flex; justify-content: flex-end">
        <div class="btn red" style='margin-top:30px' onclick="deleteItem()">Usuń produkt <i class="fa fa-trash"></i></div>
      </div>
    <?php endif ?>
  </div>
</div>

<div id="variantEdit" data-modal data-expand data-exclude-hidden>
  <div class="stretch-vertical">
    <div class="custom-toolbar">
      <span class="title">Edycja wariantu produktu</span>
      <button class="btn secondary" onclick="hideParentModal(this,true)">Anuluj <i class="fa fa-times"></i></button>
      <button class="btn primary" onclick="saveVariantForm();hideParentModal(this)">Zapisz <i class="fa fa-save"></i></button>
    </div>
    <div>

      <div class="field-title">Nazwa wariantu</div>
      <input type="text" name="name" class="field">

      <div class="field-title">Cena</div>
      <input type="number" name="price" class="field">

      <div class="field-title">Rabat</div>
      <input type="number" name="rabat" class="field">

      <div class="field-title">Ilość</div>
      <input type="number" name="stock" class="field">

      <div class="field-title">Kod produktu</div>
      <input type="text" name="product_code" class="field">

      <div style="display:none">
        <div class="field-title">Kolor</div>
        <input class="jscolor" name="color" onclick="this.select()" onchange="this.style.backgroundColor = this.value" style="width: 65px;text-align: center;">
        <div class="btn primary" onclick="this.prev().value='';this.prev().style.backgroundColor=''">Brak <i class="fa fa-times"></i></div>-->
      </div>

      <div class="field-title">Atrybuty wariantu (inne niż ogólne dla produktu)</div>
      <div name="variant_attributes" data-type="attribute_values"><?= $displayAllAttributeOptions ?></div>

      <div class="field-title">
        Zdjecie
        <button type="button" class="btn primary" onclick="imagePicker.open(this.next())">Wybierz</button>
        <img name="zdjecie" data-type="src" data-src-prefix="/uploads/sm/" />
      </div>


      <div class="field-title">Widoczność</div>
      <select name="published" class="field">
        <option value="1">Publiczny</option>
        <option value="0">Ukryty</option>
      </select>

      <input type="hidden" name="was_stock">
      <input type="hidden" name="product_id">
      <input type="hidden" name="variant_id">
      <div style="display: flex; justify-content: flex-end; margin-top: 20px">
        <button class=" btn red" onclick="saveVariantForm(true);hideParentModal(this)">Usuń wariant <i class="fa fa-trash"></i></button>
      </div>
    </div>
  </div>

  <?php include "admin/default_page.php"; ?>