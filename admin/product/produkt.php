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

?>


<?php startSection("head"); ?>

<style>
  select[data-parent_value_id].hidden,
  .optional-value-wrapper .field.hidden {
    display: none !important;
  }

  .attribute-row {
    padding: 5px;
    border: 1px solid #ccc;
  }

  .attribute-row+.attribute-row {
    border-top: none;
  }

  select.empty:not(:focus) {
    color: #aaa;
  }
</style>
<script>
  useTool("cms");

  function comboSelectValuesChanged(combo) {
    combo.querySelectorAll("select").forEach(select => {
      for (option of select.options) {
        var childSelect = combo.querySelector(`select[data-parent_value_id="${option.value}"]`);
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

      combo.querySelectorAll("select:not(.registered)").forEach(select => {
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

  function optionalValueChanged(optional) {
    var checkbox = optional.querySelector(`input[type="checkbox"]`);
    var input = optional.querySelector(`.field`);

    input.classList.toggle("hidden", !checkbox.checked);
  }

  function registerOptionalValues() {
    $$(".optional-value-wrapper").forEach(optional => {
      var checkbox = optional.querySelector(`input[type="checkbox"]:not(.registered)`);
      if (!checkbox) return;
      checkbox.classList.add("registered");
      checkbox.addEventListener("change", () => {
        var wrapper = findParentByClassName(checkbox, "optional-value-wrapper");
        optionalValueChanged(wrapper);
      });

      var wrapper = findParentByClassName(checkbox, "optional-value-wrapper");
      optionalValueChanged(wrapper);

    });
  }

  window.addEventListener("DOMContentLoaded", function() {

    registerComboSelects();

    registerOptionalValues();

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
            return `<div class='btn primary' onclick='editVariant(${i})'>Edytuj <i class="fas fa-cog"></i></div>`;
          },
          escape: false
        }
      ],
      controls: `
                <div class='float-icon'>
                    <input type="text" placeholder="Szukaj..." data-param="search">
                    <i class="fas fa-search"></i>
                </div>
                <div class="btn primary" onclick="newVariant()"><span>Nowy wariant</span> <i class="fa fa-plus"></i></div>
            `
    });

    var quillShort = new Quill('#product-description', {
      theme: 'snow',
      modules: {
        'toolbar': [
          [{
            'size': []
          }],
          ['bold', 'italic', 'underline', 'strike'],
          [{
            'color': []
          }, {
            'background': []
          }],
          [{
            'list': 'ordered'
          }, {
            'list': 'bullet'
          }, {
            'indent': '-1'
          }, {
            'indent': '+1'
          }],
          [{
            'align': []
          }],
          ['link'],
          ['clean'],
        ],
      }
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
    node.setAttribute("src", document.getElementById("img-main").getAttribute("src"));
  }

  function editPage() {
    imagePicker.setDefaultTag($('[name="title"]').value);
    editCMS($('#product-content'));
  }

  function newVariant() {
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

    showModal("variantEdit");
  }

  function editVariant(i) {
    var data = variants.results[i];
    setFormData(data, $("#variantEdit"));

    $(`[name="was_stock"]`).value = data.stock;

    showModal("variantEdit");

    xhr({
      url: "/admin/get_variant_attributes",
      params: {
        variant_id: data.variant_id
      },
      success: (res) => {
        var data = JSON.parse(res);
        $$(".combo-select-wrapper").forEach(combo => {
          combo.querySelectorAll("select").forEach(select => {
            var option = [...select.options].find(o => {
              return data.attribute_selected_values.indexOf(parseInt(o.value)) !== -1
            });
            if (option) {
              select.value = option.value;
            }
          });
          comboSelectValuesChanged(combo);
        });

        for (attribute of data.attribute_values) {
          var wrapper = findParentByClassName($(`[name="attribute_values[${attribute.attribute_id}]"]`), "optional-value-wrapper");
          setValue(wrapper.querySelector(`input[type="checkbox"]`), 0);
        }

        for (attribute of data.attribute_values) {
          setValue($(`[name="attribute_values[${attribute.attribute_id}]"]`), attribute[attribute_data_types[attribute.data_type].field]);

          var wrapper = findParentByClassName($(`[name="attribute_values[${attribute.attribute_id}]"]`), "optional-value-wrapper");
          setValue(wrapper.querySelector(`input[type="checkbox"]`), 1);
        }
      }
    });
  }

  function saveVariantForm() {
    var params = getFormData($("#variantEdit"), {
      excludeHidden: true
    });

    var attribute_values = [];

    $$("[data-attribute-value]").forEach(select => {
      if (select.value) {
        attribute_values.push(parseInt(select.value));
      }
    })

    params.attribute_selected_values = JSON.stringify(attribute_values);

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
  <div id="productForm" action="/admin/save_product" method="post">
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
          <div class="btn primary" onclick="rewriteURL()" style="flex-shrink:0">Uzupełnij na podstawie tytułu</div>
        </div>

        <div class="field-title">Tytuł (SEO)</div>
        <input type="text" name="seo_title" class="field" style="max-width: 600px;" data-show-count="60" data-count-description="(zalecane 50-58)">

        <div class="field-title">Opis (SEO)</div>
        <textarea class="seo_description" name="seo_description" data-show-count="158" data-count-description="(zalecane 130-155)"></textarea>
      </div>
    </div>

    <div class="mobileRow">
      <div>
        <div class="field-title">
          Zdjęcie na stronę główną
          <div class="btn primary" onclick="imagePicker.open(this.nextElementSibling)">Wybierz</div>
          <img id="img-main" name="image" data-type="src" data-src-prefix="/uploads/df/" />
        </div>
      </div>
      <div style="margin-left:10px">
        <div class="field-title">
          Wersja desktopowa
          <div class="btn primary" onclick="imagePicker.open(this.nextElementSibling.nextElementSibling)">Wybierz</div>
          <div class="btn secondary" onclick="copyMainImage(this.nextElementSibling)">Kopiuj zdjęcie główne</div>
          <img name="image_desktop" data-type="src" data-src-prefix="/uploads/df/" />
        </div>
      </div>
    </div>

    <div class="field-title">Kategorie</div>
    <input type="hidden" name="categories" data-category-picker data-category-picker-source="product_categories">

    <div style="margin-top: 10px;display:none">
      <div class="field-title">Opis krótki <span style="color:red">(wywalamy)</span></div>
      <div class="quill-wrapper2">
        <div id="product-description" name="descriptionShort" data-type="html" data-point-child=".ql-editor"></div>
      </div>
    </div>

    <div style="margin-top: 10px;display:none">
      <div style="display:flex" class="mobileRow">
        <div>
          <span style="color:red">Specyfikacja (chyba to wywalamy, zastąpimy atrybutami)</span>
          <textarea id="specyfikacja" name="specyfikacja" style="width: 100%;height:200px" oninput="showSpecyfikacja()"></textarea>
          <textarea id="specyfikacja_output" name="specyfikacja_output" style="display:none"></textarea>
        </div>
        <div style="padding: 0 20px">
          Podgląd:
          <div id="specyfikacja_preview"></div>
        </div>
      </div>
    </div>

    <div style="margin-top: 10px">

      <div class="form-field">
        Opis główny
        <div onclick="editPage()" class="btn primary">Edytuj <i class="far fa-edit"></i></div>
      </div>
      <div id="product-content" name="description" data-type="html" class="cms" style="border:1px solid #ccc;max-height: calc(100vh - 352px);overflow-y:auto"></div>
    </div>

    <h2 style="text-align:center">Warianty <span style="font-size: 0.7rem">(min. 1)</span></h2>

    <div class="variants"></div>

    <input type="hidden" name="product_id">

    <?php if (!$kopia) : ?>
      <div style="margin-top:auto;align-self: flex-end; padding-top:30px">
        <button class="btn red" onclick="saveSlide(true);hideParentModal(this)">Usuń slajd <i class="fa fa-trash"></i></button>
      </div>
      <div class="btn" style='background:red;color:white;margin-top:10px' onclick="deleteItem()">USUŃ PRODUKT</div>
    <?php endif ?>
  </div>
</div>

<div id="variantEdit" data-modal data-expand>
  <div class="stretch-vertical">
    <div class="custom-toolbar">
      <span class="title">Edycja wariantu produktu</span>
      <button class="btn secondary" onclick="hideParentModal(this)">Anuluj <i class="fa fa-times"></i></button>
      <button class="btn primary" onclick="saveVariantForm();hideParentModal(this)">Zapisz <i class="fa fa-save"></i></button>
    </div>
    <div style="padding:10px">

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

      <div class="field-title">Kolor</div>
      <input class="jscolor" name="color" onclick="this.select()" onchange="this.style.backgroundColor = this.value" style="width: 65px;text-align: center;">
      <div class="btn primary" onclick="this.previousElementSibling.value='';this.previousElementSibling.style.backgroundColor=''">Brak <i class="fa fa-times"></i></div>

      <div class="field-title">Atrybuty</div>

      <?php
      include_once "attributes_service.php";

      $attributes = fetchArray("SELECT name, attribute_id, data_type FROM product_attributes");

      function printSelectValuesOfAttribute($values, $value_id = null)
      {
        if (!isset($values[0])) return "";

        $attr = $value_id ? "data-parent_value_id='" . $value_id . "'" : "";
        $html = "<select $attr data-attribute-value>";
        $html .= "<option value=''>Nie dotyczy</option>";
        foreach ($values as $value_data) {
          $html .= "<option value='" . $value_data["values"]["value_id"] . "'>" . $value_data["values"]["value"] . "</option>";
        }
        $html .= "</select> ";
        foreach ($values as $value_data) {
          $html .= printSelectValuesOfAttribute($value_data["children"], $value_data["values"]["value_id"]);
        }

        return $html;
      }

      foreach ($attributes as $attribute) {
        $isOptional = isset($attribute_data_types[$attribute["data_type"]]["field"]);

        echo "<div class='" . ($isOptional ? "optional-value-wrapper" : "combo-select-wrapper") . " attribute-row'>" . $attribute["name"] . " ";

        if ($isOptional) {
          echo '
              <label class="field-title">
                <input type="checkbox">
                <div class="checkbox"></div>
              </label>
            ';
          $attribute_form_name = 'name="attribute_values[' . $attribute["attribute_id"] . ']"';
          if (strpos($attribute["data_type"], "color") !== false) {
            echo '<input type="text" class="jscolor field" style="display: inline-block;width:65px" ' . $attribute_form_name . '>';
          } else if (strpos($attribute["data_type"], "number") !== false) {
            echo '<input type="number" class="field" ' . $attribute_form_name . '>';
          } else {
            echo '<input type="text" class="field" ' . $attribute_form_name . '>';
          }
        } else {
          $values = getAttributeValues($attribute["attribute_id"]);
          echo printSelectValuesOfAttribute($values);
        }

        echo "</div>";
      }

      ?>

      <div class="field-title">
        Zdjecie
        <button type="button" class="btn primary" onclick="imagePicker.open(this.nextElementSibling)">Wybierz</button>
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
    </div>
  </div>

  <?php include "admin/default_page.php"; ?>