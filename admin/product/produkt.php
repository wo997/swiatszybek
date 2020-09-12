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

$product_data["variant_attribute_options"] = fetchColumn("SELECT attribute_id FROM link_variant_attribute_option WHERE product_id = " . intval($product_id) . " ORDER BY kolejnosc ASC");

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
      setFormData({
        categories: [<?= $categories ?>]
      }, "#productForm");
    });

    <?php if ($kopia) : ?>
      $(`[name="title"]`).value += " (kopia)";
      $(`[name="product_id"]`).value = "-1";
    <?php endif ?>

    registerTextCounters();

    /*createDatatable({
      name: "variants2",
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
            return `<img style='display:block;width:70px;' src='${r.zdjecie}'>`;
          },
          escape: false
        },
        getPublishedDefinition({
          field: "v.published"
        }),
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
                    <input type="text" placeholder="Szukaj..." data-param="search" class="field inline">
                    <i class="fas fa-search"></i>
                </div>
                <div class="btn primary" onclick="newVariant(this)"><span>Nowy wariant</span> <i class="fa fa-plus"></i></div>
            `
    });*/

    createSimpleList({
      name: "gallery",
      fields: {
        src: {
          unique: true
        }
      },
      render: (data) => {
        return `
            <div class='select-image-wrapper' style="display: flex;align-items: center">
              <img data-list-param="src" data-type="src" style="object-fit:contain;width:120px;height:120px;display: block;margin-right:10px;">
              <button class="btn primary add_img_btn" onclick="fileManager.open(this.prev(),{asset_types: ['image']})"> <span>Wybierz</span> <i class="fas fa-image"></i></button>
            </div>
          `;
      },
      onChange: (values, list) => {
        var rowIndex = -1;
        list.wrapper.findAll(".simple-list-row-wrapper").forEach(row => {
          rowIndex++;
          if (rowIndex === 0) {
            row.style.backgroundColor = "#eee";

            if (!row.find(".main-img")) {
              row.find(".select-image-wrapper").insertAdjacentHTML("beforeend",
                `<span class="main-img" data-tooltip="Wyświetlane przy wyszukiwaniu produktów" style="font-weight: 600;margin-left: 10px;color: #0008;background: #0001;padding: 5px 9px;"> Zdjęcie główne <i class="fas fa-eye"></i> </span>`
              );
            }
          } else {
            row.style.backgroundColor = "";
            removeNode(row.find(".main-img"));
          }

          var img = row.find("img");
          row.find(".add_img_btn span").setContent(img.getValue() ? "Zmień" : "Wybierz");
        })
        lazyLoadImages();
      },
      onRowInserted: (row) => {
        row.find(".add_img_btn").dispatchEvent(new Event("click"));
      },
      default_row: {
        src: ""
      },
      title: "Galeria zdjęć produktu",
      //empty: `<div style="color: rgb(255, 170, 0);font-weight: bold;display: inline-block;">Wstaw min. 1 zdjęcie produktu</div>`
    });

    // will go deprecated soon
    createDatatable({
      name: "atrybuty_wariantow",
      url: "/admin/search_product_attributes",
      lang: {
        subject: "atrybutów",
      },
      primary: "attribute_id",
      db_table: "product_attributes",
      sortable: true,
      selectable: {
        data: <?= json_encode($product_data["variant_attribute_options"]) ?>,
        output: "variant_attribute_options"
      },
      definition: [{
          title: "Nazwa atrybutu",
          width: "25%",
          render: (r) => {
            return `${r.name}`;
          },
        },
        {
          title: "Typ danych",
          width: "20%",
          render: (r) => {
            return `${attribute_data_types[r.data_type].description}`;
          },
        },
        {
          title: "Wartości",
          width: "60%",
          render: (r) => {
            return `${nonull(r.attr_values).replace(/,/g,", ")}`;
          },
        },
      ],
      controlsRight: `
          <div class='float-icon'>
              <input type="text" placeholder="Filtruj..." data-param="search" class="field inline">
              <i class="fas fa-search"></i>
          </div>
      `
    });

    createSimpleList({
      name: "variants",
      fields: {
        value_id: {},
        name: {
          unique: true,
          allow_empty: true
        },
        price: {},
        rabat: {},
        stock: {},
        zdjecie: {},
      },
      table: true,
      header: `
        <th>Nazwa</th>
        <th>Cena</th>
        <th>Rabat</th>
        <th>W magazynie</th>
        <th>Zdjęcie</th>
        <th></th>
        <th></th>
      `,
      render: (data) => {
        return `
            <td>
              <input type='hidden' data-list-param="variant_id">
              <span data-list-param="name" data-type="html"></span>
            </td>
            <td>
              <span data-list-param="price" data-type="html"></span> zł
            </td>
            <td>
              <span data-list-param="rabat" data-type="html"></span> zł
            </td>
            <td>
              <span data-list-param="stock" data-type="html"></span> szt.
            </td>
            <td>
              <img data-list-param="zdjecie" data-type="src" style="width:80px;height:80px;object-fit:contain"/>
            </td>
            <td style="width:80px;">
              <button class='btn primary' onclick='editVariant($(this).parent().parent(), this)'>Edytuj <i class="fas fa-cog"></i></button>
            </td>
        `;
      },
      default_row: {
        name: "",
        price: 0,
        rabat: 0,
        stock: 0,
        product_code: "",
        zdjecie: "",
        published: 0,
        variant_id: -1
      },
      title: "Warianty (min. 1)"
    });



    setFormData(<?= json_encode($product_data) ?>, "#productForm");
    addMainFormLeavingWarning($("#productForm"));
  });

  window.addEventListener("load", function() {
    fileManager.setDefaultName($('[name="title"]').value);
  });

  function copyMainImage(node) {
    node.setAttribute("src", $("#img-main").getAttribute("src"));
  }

  function editPage() {
    fileManager.setDefaultName($('[name="title"]').value);
    editCMS($('[name="description"]'));
  }

  /*function newVariant(btn) {
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
    setFormData(data, "#variantEdit");

    $(`[name="was_stock"]`).value = data.stock;

    showModal("variantEdit", {
      source: btn
    });
  }*/

  var variantRow = null;

  function editVariant(row, btn) {
    variantRow = $(row);

    const form = $(`#variantEdit`);
    var data = getFormData(row, {
      find_by: "data-list-param"
    });

    //data.was_stock = data.stock;
    console.log(row, data);

    setFormData(data, form);

    showModal(form.id, {
      source: btn
    });
  }

  /*function editVariant(i, btn) {
    const form = $(`#variantEdit`);
    var data = variants2.results[i];

    data.was_stock = data.stock;

    setFormData(data, form);

    showModal(form.id, {
      source: btn
    });

    xhr({
      url: "/admin/get_variant_attributes",
      params: {
        variant_id: data.variant_id
      },
      success: (data) => {
        setFormData(data, form);

        // setModalInitialState(formId);
      }
    });
  }*/

  function saveVariant(remove = false) {
    if (remove) {
      variantRow.remove();
    }

    const data = $(`#variantEdit`).getFormData();

    setFormData(data, variantRow, {
      find_by: "data-list-param"
    });

    lazyLoadImages();
  }

  function deleteProduct() {
    anyChange = false;
    if (confirm("Czy chcesz usunąć produkt?")) {
      window.location = '/admin/delete_product/<?= $kopia ? '-1' : $product_id ?>';
    }
  }

  function saveProductForm() {
    var form = $(`#productForm`);

    if (!validateForm(form)) {
      return;
    }

    var params = getFormData(form);

    xhr({
      url: "/admin/save_product",
      params: params,
      success: () => {
        window.location.reload();
      }
    });
  }

  function rewriteURL() {
    $(`[name="link"]`).setValue(getLink($(`[name="title"]`).value));
  }
</script>

<title>Edycja produktu</title>

<?php startSection("content"); ?>

<div id="productForm" data-form>
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
        <a href="/admin/produkt/<?= $product_id ?>" class="btn secondary">Anuluj <i class="fa fa-times"></i></a>
      <?php else : ?>
        <!--<a href="/admin/produkt/<?= $product_id ?>/kopia" class="btn secondary">Kopiuj <i class="fas fa-copy"></i></a>-->
        <a href="/produkt/<?= $product_id . "/" . getLink($product_data["title"]) ?>" class="btn secondary">Pokaż bez zapisywania <i class="fas fa-external-link-alt"></i></a>
      <?php endif ?>
      <button onclick="saveProductForm()" class="btn primary" onclick="anyChange=false">Zapisz <i class="fas fa-save"></i></button>
    </div>
  </div>
  <label class="field-title" style="user-select:none;display:inline-block">Czy publiczny? <input type="checkbox" name="published">
    <div class="checkbox"></div>
  </label>
  <div style="display: flex" class="mobileRow">
    <div style="flex-grow:1; padding-right: 15px">
      <div style="max-width: 600px">
        <div class="field-title">Nazwa produktu</div>
        <input type="text" name="title" class="field" data-validate>

        <div class="field-wrapper">
          <div class="field-title">Link strony</div>
          <div class="glue-children">
            <input type="text" name="link" data-validate autocomplete="off" class="field">
            <button class="btn primary" onclick="rewriteURL()" style="flex-shrink:0">Uzupełnij na podstawie tytułu</button>
          </div>
        </div>

        <div class="field-title">Tytuł (SEO)</div>
        <input type="text" name="seo_title" class="field" data-show-count="60" data-count-description="(zalecane 50-58)">
      </div>

      <div class="field-title">Opis (SEO)</div>
      <textarea class="seo_description field" name="seo_description" data-show-count="158" data-count-description="(zalecane 130-155)"></textarea>
    </div>
  </div>


  <div name="gallery" data-validate="|count:1+" style="max-width:600px"></div>

  <div class="field-title">Kategorie</div>
  <div class="category-picker" name="categories" data-source="product_categories"></div>

  <div style="margin-top: 10px">

    <div class="field-title">
      Opis główny
      <div onclick="editPage()" class="btn primary">Edytuj <i class="far fa-edit"></i></div>
    </div>
    <div name="description" data-type="html" class="cms preview_html" style="max-height: 400px"></div>
  </div>

  <div class="field-title">Atrybuty produktu (wspólne)</div>
  <div name="product_attributes" data-type="attribute_values"><?= $displayAllAttributeOptions ?></div>

  <div class="field-title">Atrybuty wariantów</div>
  <div class="atrybuty_wariantow"></div>

  <!--<div class="field-title">Warianty <span style="font-size: 0.7rem">(min. 1)</span></div>
  <div class="variants2"></div>-->

  <div name="variants" data-validate="|count:1+"></div>

  <input type="hidden" name="product_id">

  <?php if (!$kopia) : ?>
    <div style="display: flex; justify-content: flex-end">
      <div class="btn red" style='margin-top:30px' onclick="deleteProduct()">Usuń produkt <i class="fa fa-trash"></i></div>
    </div>
  <?php endif ?>
</div>
</div>

<div id="variantEdit" data-modal data-expand data-exclude-hidden>
  <div class="modal-body stretch-vertical">
    <div class="custom-toolbar">
      <span class="title">Edycja wariantu produktu</span>
      <button class="btn secondary" onclick="hideParentModal(this,true)">Anuluj <i class="fa fa-times"></i></button>
      <button class="btn primary" onclick="saveVariant();hideParentModal(this)">Zapisz <i class="fa fa-save"></i></button>
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
        <button class="btn primary" onclick='fileManager.open(this.next(),{asset_types: ["image"]})'>Wybierz</button>
        <img name="zdjecie" data-type="src" />
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
        <button class=" btn red" onclick="saveVariant(true);hideParentModal(this)">Usuń wariant <i class="fa fa-trash"></i></button>
      </div>
    </div>
  </div>

  <?php include "admin/default_page.php"; ?>