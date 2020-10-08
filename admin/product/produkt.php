<?php //route[admin/produkt]

$parts = explode("/", $url);
if (isset($parts[2]))
  $product_id = intval($parts[2]);
else {
  $product_id = -1;
}

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
  $product_data = fetchRow("SELECT * FROM products WHERE product_id = $product_id");

  if (!$product_data) {
    redirect("/admin/produkt/");
  }
}

$categories = fetchValue("SELECT GROUP_CONCAT(category_id SEPARATOR ',') FROM link_product_category WHERE product_id = $product_id");

include_once "admin/product/attributes_service.php";

$displayAllAttributeOptions = displayAllAttributeOptions();

$product_data["attributes"] = getAttributesFromDB("link_product_attribute_value", "product_attribute_values", "product_id", $product_id);

$product_data["variant_attribute_options"] = fetchColumn("SELECT attribute_id FROM link_variant_attribute_option WHERE product_id = $product_id ORDER BY kolejnosc ASC");

$variants = fetchArray("SELECT * FROM variant WHERE product_id = $product_id ORDER BY kolejnosc ASC");

foreach ($variants as $key => $variant) {
  $variant["attributes"] = json_encode(getAttributesFromDB("link_variant_attribute_value", "variant_attribute_values", "variant_id", $variant["variant_id"]));
  $variants[$key] = $variant;
}

$product_data["variants"] = json_encode($variants);

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

?>


<?php startSection("head"); ?>

<style>

</style>
<script>
  useTool("cms");
  useTool("preview");

  var attribute_values_array = <?= json_encode(fetchArray('SELECT value, value_id FROM attribute_values'), true) ?>;
  var attribute_values = {};
  attribute_values_array.forEach(attribute => {
    attribute_values[attribute["value_id"]] = attribute["value"];
  });

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

  domload(() => {
    registerComboSelects();

    registerAnythingValues();

    loadCategoryPicker("product_categories", {
      skip: 2
    }, () => {
      setFormData({
        categories: [<?= $categories ?>]
      }, "#productForm");
    });

    registerTextCounters();

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
        variant_id: {},
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
        <th>Cena (zł)</th>
        <th>Widoczny</th>
        <th>Rabat (zł)</th>
        <th>Kod produktu</th>
        <th>W magazynie (szt.)</th>
        <th>Zdjęcie</th>
        <th>Atrybuty</th>
        <th></th>
        <th></th>
      `,
      render: (data) => {
        return `
            <td>
              <input type='hidden' data-list-param="variant_id">
              <input type='text' data-list-param="name" class="field inline">
            </td>
            <td>
              <input type='number' data-list-param="price" class="field inline">
            </td>
            <td>
              <input type='hidden' data-list-param="published" onchange='$(this).next().setContent(renderIsPublished({published:this.getValue()}))'>
              <span></span>
            </td>
            <td>
            <input type='number' data-list-param="rabat" class="field inline">
            </td>
            <td>
              <input type='text' data-list-param="product_code" class="field inline">
            </td>
            <td>
              <input type='number' data-list-param="stock" class="field inline">
              <input type='hidden' data-list-param="was_stock">
            </td>
            <td>
              <img data-list-param="zdjecie" data-type="src" style="width:80px;height:80px;object-fit:contain"/>
            </td>
            <td>
              <input type='hidden' data-list-param="attributes" onchange="displayAttributesPreview($(this).next(), this.value)">
              <div data-tooltip class='clamp-lines clamp-4'></div>
            </td>
            <td style="width:80px;">
              <button class='btn primary' onclick='editVariant($(this).parent().parent(), this)'>Edytuj <i class="fas fa-cog"></i></button>
            </td>
        `;
      },
      default_row: {
        variant_id: -1,
        name: "",
        price: 0,
        rabat: 0,
        stock: 0,
        was_stock: 0,
        product_code: "",
        zdjecie: "",
        published: 0,
        attributes: "{\"selected\":[],\"values\":[]}",
      },
      title: "Warianty (min. 1)"
    });

    var data = <?= json_encode($product_data) ?>;

    var variants_data = [];
    JSON.parse(data.variants).forEach(e => {
      e.was_stock = e.stock;
      variants_data.push(e);
    })
    data.variants = JSON.stringify(variants_data);

    setFormData(data, "#productForm");

    <?php if ($kopia) : ?>
      $(`[name="title"]`).value += " (kopia)";
      $(`[name="product_id"]`).value = "-1";
    <?php endif ?>
  });

  window.addEventListener("load", function() {
    fileManager.setDefaultName($('[name="title"]').value);
  });

  function displayAttributesPreview(target, data) {
    var output = "";
    try {
      var attributes = JSON.parse(data);
      attributes.selected.forEach(attribute_id => {
        output += attribute_values[+attribute_id] + "<br>";
      })
      attributes.values.forEach(attribute => {
        output += attribute.value + "<br>";
      });
    } catch {}

    target.setContent(output);
  }

  function copyMainImage(node) {
    node.setAttribute("src", $("#img-main").getAttribute("src"));
  }

  function editPage() {
    fileManager.setDefaultName($('[name="title"]').value);
    editCMS($('[name="description"]'));
  }

  var variantRow = null;

  function editVariant(row, btn) {
    variantRow = $(row);

    const form = $(`#variantForm`);
    var data = getFormData(row, {
      find_by: "data-list-param"
    });

    setFormData(data, form);

    showModal(form.id, {
      source: btn
    });
  }

  function saveVariant(remove = false) {
    if (remove) {
      variantRow.remove();
    }

    var data = $(`#variantForm`).getFormData();

    setFormData(data, variantRow, {
      find_by: "data-list-param"
    });

    lazyLoadImages();
  }

  function deleteProduct() {
    setFormInitialState(`#productForm`);
    if (confirm("Czy chcesz usunąć produkt?")) {
      window.location = '/admin/delete_product/<?= $kopia ? '-1' : $product_id ?>';
    }
  }

  function saveProduct() {
    var form = $(`#productForm`);

    if (!validateForm(form)) {
      return;
    }

    var params = getFormData(form);

    xhr({
      url: "/admin/save_product",
      params: params,
      success: () => {
        setFormInitialState(form);
      }
    });
  }

  function rewriteURL() {
    $(`[name="link"]`).setValue(getLink($(`[name="title"]`).value));
  }

  function showPreview() {
    var form = $(`#productForm`);

    if (!validateForm(form)) {
      return;
    }

    var data = getFormData(form);
    data.cache_thumbnail = "";
    try {
      data.cache_thumbnail = JSON.parse(data.gallery)[0].values.src;
    } catch {}
    data.cache_rating_count = Math.floor(5 + 100 * Math.random());
    data.cache_avg_rating = 5;
    data.price_min = 0;
    data.price_max = 10000000; // really doesnt matter what u set, it's used for seo later though

    window.preview.open(getProductLink(data.product_id, data.link), data);
  }
</script>

<title>Edycja produktu</title>

<?php startSection("header"); ?>

<div class="custom-toolbar">
  <div class="title" style="max-width: calc(600px);overflow: hidden;white-space: nowrap;text-overflow: ellipsis;">
    <?= $product_form_header ?>
  </div>
  <div>
    <a class="btn secondary" href="/admin/produkty">Wszystkie produkty <i class="fas fa-cubes"></i></a>
    <?php if ($kopia) : ?>
      <a href="/admin/produkt/<?= $product_id ?>" class="btn primary">Anuluj kopiowanie <i class="fa fa-times"></i></a>
    <?php else : ?>
      <a href="/admin/produkt/<?= $product_id ?>/kopia" class="btn secondary">Kopiuj <i class="fas fa-copy"></i></a>
      <a href="<?= getProductLink($product_id, $product_data["title"]) ?>" class="btn primary">Pokaż produkt <i class="fas fa-chevron-circle-right"></i></a>
    <?php endif ?>
    <button onclick="showPreview()" class="btn primary">Podgląd <i class="fas fa-eye"></i></button>
    <button onclick="saveProduct()" class="btn primary">Zapisz <i class="fas fa-save"></i></button>
  </div>
</div>

<?php startSection("content"); ?>

<div id="productForm" data-form data-warn-before-leave>
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
  <div name="attributes" data-type="attribute_values"><?= $displayAllAttributeOptions ?></div>

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

<div id="variantForm" data-modal data-expand data-exclude-hidden data-form>
  <div class="modal-body">
    <div class="custom-toolbar">
      <span class="title">Edycja wariantu produktu</span>
      <button class="btn secondary" onclick="hideParentModal(this,true)">Anuluj <i class="fa fa-times"></i></button>
      <button class="btn primary" onclick="saveVariant();hideParentModal(this)">Zapisz <i class="fa fa-save"></i></button>
    </div>
    <div class="scroll-panel scroll-shadow panel-padding">

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
      <div name="attributes" data-type="attribute_values"><?= $displayAllAttributeOptions ?></div>

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
</div>

<?php include "admin/default_page.php"; ?>