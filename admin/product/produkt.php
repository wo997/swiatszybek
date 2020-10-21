<?php //route[{ADMIN}produkt]

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
    "variant_attributes_layout" => "[]",
  ];
} else {
  $product_data = fetchRow("SELECT * FROM products WHERE product_id = $product_id");

  if (!$product_data) {
    redirect(STATIC_URLS["ADMIN"] . "produkt/");
  }
}

$categories_csv = fetchValue("SELECT GROUP_CONCAT(category_id SEPARATOR ',') FROM link_product_category WHERE product_id = $product_id");

include_once "admin/product/attributes_service.php";

$allAttributeOptions = getAllAttributeOptions();
$allAttributeOptionsHTML = $allAttributeOptions["html"];

$product_data["attributes"] = getAttributesFromDB("link_product_attribute_value", "product_attribute_values", "product_id", $product_id);

$product_data["variant_attribute_options"] = fetchArray("SELECT attribute_id, attribute_values FROM link_variant_attribute_option WHERE product_id = $product_id ORDER BY kolejnosc ASC");

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
  #variantForm .attribute-row.any_selected.attribute_used {
    box-shadow: inset 0 0 0 2px var(--primary-clr);
    border-width: 0;
    position: relative;
  }

  .case_common,
  .case_intersect {
    display: none;
  }

  #variantForm .attribute-row.common:not(.any_selected) .case_common {
    display: inline-block;
  }

  #variantForm .attribute-row.common.any_selected .case_intersect {
    display: inline-block;
  }
</style>
<script>
  useTool("cms");
  useTool("preview");

  var attribute_values_array = <?= json_encode(fetchArray('SELECT value, value_id, attribute_id, parent_value_id FROM attribute_values'), true) ?>;
  var attribute_values = {};
  attribute_values_array.forEach(value => {
    attribute_values[value["value_id"]] = {
      value: value["value"],
      attribute_id: +value["attribute_id"],
      parent_value_id: +value["parent_value_id"],
    };
  });

  Object.entries(attribute_values).forEach(([value_id, value]) => {
    var whole_value = value.value;
    var curr_level_value = value;
    while (true) {
      var parent_value_id = +curr_level_value.parent_value_id;
      if (parent_value_id <= 0) {
        break;
      }
      parent_value = attribute_values[parent_value_id];
      if (!parent_value) {
        break;
      }
      whole_value = parent_value.value + " " + whole_value;

      curr_level_value = parent_value;
    }
    value.whole_value = whole_value;
  });

  var attributes_array = <?= json_encode(fetchArray('SELECT name, attribute_id FROM product_attributes'), true) ?>;
  var attributes = {};
  attributes_array.forEach(attribute => {
    attributes[attribute["attribute_id"]] = attribute["name"];
  });

  function comboSelectValuesChanged(combo, options) {
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

    var any_selected = false;
    combo.findAll("select").forEach(e => {
      if (e.value !== "") {
        any_selected = true;
      }
    });
    combo.classList.toggle("any_selected", any_selected);

    if (options.onChange) {
      var attribute_id = +combo.getAttribute("data-attribute_id");

      options.onChange(combo, attribute_id, any_selected);
    }
  }

  function registerComboSelect(combo, options = {}) {
    combo.findAll("select:not(.registered)").forEach(select => {
      select.classList.add("registered");

      var changeCallback = () => {
        var wrapper = findParentByClassName(select, "combo-select-wrapper");
        comboSelectValuesChanged(wrapper, options);

        if (select.value === "" && select.prev_value) {
          var sub_select = wrapper.find(`[data-parent_value_id="${select.prev_value}"]`);
          if (sub_select) {
            sub_select.setValue("");
          }
        }
        select.prev_value = select.value;
      };
      select.addEventListener("change", changeCallback);

      changeCallback();
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

    // TODO: attribute intersection validation
    /*$$(`#variantForm [name="attributes"] .attribute-row`).forEach(e => {
      e.insertAdjacentHTML("beforeend", `
        <div class='case_common rect' style='background:#0001;color:#444'>Atrybut wspólny</div>
        <div class='case_intersect rect' style='background:var(--error-clr)'>Atrybut wspólny <i class='fas fa-info-circle' data-tooltip='Atrybut wspólny zostanie usunięty po zapisaniu wariantu'></i></div>
      `);
    });*/

    loadCategoryPicker("product_categories", {
      skip: 2
    }, () => {
      setFormData({
        categories: [<?= $categories_csv ?>]
      }, "#productForm");
    });

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
              <img name="src" data-type="src" data-height='1w' style="object-fit:contain;width:120px;display: block;margin-right:10px;">
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
                `<span class="main-img rect" data-tooltip="Wyświetlane przy wyszukiwaniu produktów" style="font-weight: 600;margin-left: 10px;color: #0008;background: #0001;"> Zdjęcie główne <i class="fas fa-eye"></i> </span>`
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
      beforeRowInserted: (row, values, options) => {
        if (options.user) {
          row.find(".add_img_btn").dispatchEvent(new Event("click"));
          setCustomHeights();
        }
      },
      default_row: {
        src: ""
      },
      title: "Galeria zdjęć produktu",
    });


    createSimpleList({
      name: "variant_attributes_layout",
      fields: {
        attribute_id: {},
        attribute_name: {},
        attribute_values: {},
      },
      table: true,
      header: `
        <th>Atrybut</th>
        <th>Wartości</th>
        <th></th>
      `,
      render: (data) => {
        return `
          <td>
            <input type='hidden' data-number name="attribute_id">
            <div data-type='html' name="attribute_name">
          </td>
          <td>  
            <div name="attribute_values" class="slim"></div>
          </td>
        `;
      },
      default_row: {
        attribute_id: "-1",
        attribute_name: "",
        attribute_values: "[]",
      },
      title: "Atrybuty wariantów (filtry wyszukiwania wariantu)",
      beforeRowInserted: (row, values) => {
        list = row.find(`[name="attribute_values"]`);
        var list_name = `attribute_values_${values.attribute_id}`;
        list.setAttribute("name", list_name);
        createSimpleList({
          name: list_name,
          fields: {
            value_id: {},
            value: {},
          },
          render: (data) => {
            return `
              <input type='hidden' data-number name="value_id">
              <div data-type='html' name="value"></div>
            `;
          },
          default_row: {
            value_id: "-1",
            attribute_values: "[]",
          },
          onChange: (values, list) => {
            list.target.directChildren().forEach(row => {
              var value_id = row.find(`[name="value_id"]`).getValue();
              row.find(`[name="value"]`).setValue(nonull(attribute_values[value_id], {
                whole_value: ""
              }).whole_value, {
                quiet: true
              });
            })
          }
        });
      },
      onChange: (values, list) => {
        list.target.directChildren().forEach(row => {
          var attribute_id = row.find(`[name="attribute_id"]`).getValue();
          row.find(`[name="attribute_name"]`).setValue(nonull(attributes[attribute_id], ""), {
            quiet: true
          });
        })
      }
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
        vat: {},
        rabat: {},
        stock: {},
        zdjecie: {},
      },
      table: true,
      header: `
        <th>Nazwa</th>
        <th>Widoczny</th>
        <th>Cena (zł)</th>
        <th>VAT (%)</th>
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
              <input type='hidden' data-number name="variant_id">
              <input type='text' name="name" class="field inline">
            </td>
            <td>
              <input type='hidden' name="published" onchange='$(this).next().setContent(renderIsPublished({published:this.getValue()}))'>
              <span></span>
            </td>
            <td>
              <input type='number' name="price" class="field inline">
            </td>
            <td>
              <input type='number' name="vat" class="field inline">
            </td>
            <td>
              <input type='number' name="rabat" class="field inline">
            </td>
            <td>
              <input type='text' name="product_code" class="field inline">
            </td>
            <td>
              <input type='number' name="stock" class="field inline">
              <input type='hidden' name="was_stock">
            </td>
            <td>
              <img name="zdjecie" data-type="src" style="width:80px;height:80px;object-fit:contain"/>
            </td>
            <td style='min-width:200px'>
              <input type='hidden' name="attributes" onchange="displayAttributesPreview($(this).next(), this.value)">
              <div data-tooltip class='clamp-lines clamp-4'></div>
            </td>
            <td style="width:90px;">
              <button class='btn primary' onclick='editVariant($(this).parent().parent(), this)'>Edytuj <i class="fas fa-cog"></i></button>
            </td>
        `;
      },
      default_row: {
        variant_id: -1,
        name: "",
        price: 0,
        vat: 0,
        rabat: 0,
        stock: 0,
        was_stock: 0,
        product_code: "",
        zdjecie: "",
        published: 0,
        attributes: "{\"selected\":[],\"values\":[]}",
      },
      title: "Warianty produktu (min. 1)",
      onChange: () => {
        if (!window.productFormReady) {
          return;
        }

        // add attribues and values to the ordering list below variants so the use can organize the layout
        var attributes_and_values = {};
        variants.values.forEach(e => {
          try {
            var value_ids = [];
            var last_value_ids = [];
            //console.log(e.attributes, e);
            JSON.parse(e.attributes).selected.forEach(value_id => {
              value_ids.push(+value_id);
              last_value_ids.push(+value_id);
            });

            //console.log(value_ids);

            // remove repeating parents, we dont need them to specify a variant
            value_ids.forEach(value_id => {
              //console.log("start", value_id);
              while (true) {
                value_id = attribute_values[value_id].parent_value_id;
                if (!value_id) {
                  break;
                }
                //console.log("X", value_id);
                var index = last_value_ids.indexOf(value_id);
                if (index != -1) {
                  last_value_ids.splice(index, 1);
                }
              }
            });

            last_value_ids.forEach(value_id => {
              var attribute_id = +attribute_values[value_id].attribute_id;
              if (!attributes_and_values[attribute_id]) {
                attributes_and_values[attribute_id] = [];
              }
              if (attributes_and_values[attribute_id].indexOf(value_id) === -1) {
                attributes_and_values[attribute_id].push(value_id);
              }
            });
          } catch (err) {
            if (e.attributes != "") {
              console.log(err);
            }
          }
        });

        // attribute simple list
        //console.log(attributes_and_values);

        // remove
        variant_attributes_layout.values.map(e => e.attribute_id).forEach(current_attribute_id => {
          if (Object.keys(attributes_and_values).indexOf("" + current_attribute_id) == -1) {

            var index = variant_attributes_layout.values.map(e => e.attribute_id).indexOf(current_attribute_id);
            if (index !== -1) {
              variant_attributes_layout.removeRow(variant_attributes_layout.target.directChildren()[index]);
            }
          }
        });

        // add
        Object.keys(attributes_and_values).forEach(attribute_id => {
          if (variant_attributes_layout.values.map(e => e.attribute_id).indexOf(+attribute_id) == -1) {
            variant_attributes_layout.insertRow({
              attribute_id: attribute_id,
              attribute_name: "", //attributes[attribute_id],// will be replaced on any change
              attribute_values: "[]",
            })
          }
        });

        // attribute value simple list
        Object.entries(attributes_and_values).forEach(([attribute_id, values]) => {
          var list_name = `attribute_values_${attribute_id}`;
          var list = window[list_name];

          // remove
          //console.log(list.values.map(e => e.values.value_id), values);
          list.values.map(e => e.values.value_id).forEach(current_value_id => {
            if (values.indexOf(current_value_id) == -1) {
              var index = list.values.map(e => e.values.value_id).indexOf(current_value_id);
              if (index !== -1) {
                list.removeRow(list.target.directChildren()[index]);
              }
            }
          });

          // add
          values.forEach(value_id => {
            if (list.values.map(e => e.values.value_id).indexOf(value_id) == -1) {
              list.insertRow({
                value_id: value_id,
                value: "", //attribute_values[value_id].whole_value,// will be replaced on any change
              })
            }
          });
        });
      },
      afterRowInserted: (row, values, options) => {
        if (options.user) {
          editVariant(row);
        }
      }
    });

    /*createDatatable({
      name: "atrybuty_wariantow",
      url: STATIC_URLS["ADMIN"] + "search_product_attributes",
      lang: {
        subject: "atrybutów",
      },
      primary: "attribute_id",
      db_table: "product_attributes",
      sortable: true,
      selectable: {
        output: "variant_attribute_options",
        has_metadata: true,
      },
      definition: [{
          title: "Nazwa atrybutu",
          width: "25%",
          render: (r) => {
            return `${r.name}`;
          },
        },
        {
          title: "Wartości",
          width: "75%",
          className: "metadata-column",
          render: (r, i, datatable) => {
            return `
              <div class='attr_val_list' data-metadata='attribute_values' name='attr_val_list_${r[datatable.primary]}' onchange='$(this).prev().setValue($(this).getValue())'></div>
            `;
          },
          escape: false,
        },
      ],
      controlsRight: `
          <div class='float-icon'>
              <input type="text" placeholder="Filtruj..." data-param="search" class="field inline">
              <i class="fas fa-search"></i>
          </div>
      `,
      onSelectionChange: (selection, datatable) => {
        $$(`#variantForm [name="attributes"] .attribute-row`).forEach(e => {
          e.classList.toggle("attribute_used", selection.indexOf(+e.getAttribute("data-attribute_id")) !== -1);
        })

        datatable.selectionBodyElement.findAll(`.attr_val_list:not(.simple-list)`).forEach(e => {
          // TODO: when the page loads we should update the data inside - it could be changed but we have ids so don't worry
          // the other case might be that u use whatever u have and let the user change the text, necessary? I doubt but they are weird as well
          createSimpleList({
            name: e.getAttribute("name"),
            fields: {
              value_id: {},
              value: {}
            },
            render: (data) => {
              return `
                  <input type='hidden' name="value_id">
                  <div data-type='html' name="value"></div>
              `;
            },
            default_row: {
              value_id: -1,
              value: ""
            },
            title: ""
          });
        })



        // TODO: in case something was selected but we want to remove it prompt the user, and if he approves remove every attribute, might be tricky
      }
    });*/

    registerComboSelect($(`#productForm [name="attributes"]`), {
      onChange: (combo, attribute_id, any_selected) => {
        variant_combo = $(`#variantForm [data-attribute_id="${attribute_id}"]`);
        variant_combo.classList.toggle("common", any_selected);
      }
    });

    registerComboSelect($(`#variantForm [name="attributes"]`));

    registerAnythingValues();

    var data = <?= json_encode($product_data) ?>;

    var variants_data = [];
    JSON.parse(data.variants).forEach(e => {
      e.was_stock = e.stock;
      variants_data.push(e);
    });
    data.variants = JSON.stringify(variants_data);

    $(`[name="variant_attributes_layout"]`).setValue(data.variant_attributes_layout);
    delete data.variant_attributes_layout;

    setFormData(data, "#productForm");

    // TODO: form initial state? 
    <?php if ($kopia) : ?>
      $(`[name="title"]`).value += " (kopia)";
      $(`[name="product_id"]`).value = "-1";
    <?php endif ?>

    window.productFormReady = true;

    // init just in case
    variants.params.onChange(variants);
  });

  windowload(() => {
    // inject text counter after the form is registered in a right place,
    // could also run then the form is registered on an event listener
    registerTextCounters();

    fileManager.setDefaultName($('[name="title"]').value);
  });

  function displayAttributesPreview(target, data) {
    var output = "";
    try {
      var attributes = JSON.parse(data);
      attributes.selected.forEach(attribute_id => {
        output += attribute_values[+attribute_id].value + "<br>";
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

  function editVariant(row, btn = null) {
    variantRow = $(row);

    const form = $(`#variantForm`);
    var data = getFormData(row, {
      find_by: "name"
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
      find_by: "name"
    });

    lazyLoadImages();
  }

  function deleteProduct() {
    setFormInitialState(`#productForm`);
    if (confirm("Czy chcesz usunąć produkt?")) {
      window.location = `${STATIC_URLS["ADMIN"]}delete_product/<?= $kopia ? '-1' : $product_id ?>`;
    }
  }

  function saveProduct() {
    var form = $(`#productForm`);

    if (!validateForm(form)) {
      return;
    }

    var params = getFormData(form);

    xhr({
      url: STATIC_URLS["ADMIN"] + "save_product",
      params: params,
      success: () => {
        setFormInitialState(form);
      }
    });
  }

  function rewriteURL(target) {
    target.setValue(getLink($(`[name="title"]`).value));
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
  <a class="btn secondary" href="<?= STATIC_URLS["ADMIN"] ?>produkty">Wszystkie produkty <i class="fas fa-cubes"></i></a>
  <?php if ($kopia) : ?>
    <a href="<?= STATIC_URLS["ADMIN"] ?>produkt/<?= $product_id ?>" class="btn primary">Anuluj kopiowanie <i class="fa fa-times"></i></a>
  <?php else : ?>
    <a href="<?= STATIC_URLS["ADMIN"] ?>produkt/<?= $product_id ?>/kopia" class="btn secondary">Kopiuj <i class="fas fa-copy"></i></a>
    <a href="<?= getProductLink($product_id, $product_data["title"]) ?>" class="btn primary">Pokaż produkt <i class="fas fa-chevron-circle-right"></i></a>
  <?php endif ?>
  <button onclick="showPreview()" class="btn primary">Podgląd <i class="fas fa-eye"></i></button>
  <button onclick="saveProduct()" class="btn primary">Zapisz <i class="fas fa-save"></i></button>
</div>

<?php startSection("content"); ?>

<div id="productForm" data-form data-warn-before-leave class="form-field-spacing">
  <label class="field-title" style="user-select:none;display:inline-block">Czy publiczny? <input type="checkbox" name="published">
    <div class="checkbox"></div>
  </label>
  <div style="display: flex" class="mobileRow">
    <div style="flex-grow:1; padding-right: 15px">
      <div style="max-width: 600px">
        <div class="field-title">Nazwa produktu</div>
        <input type="text" name="title" class="field" data-validate onchange="$(`#variantForm .product-title-copy`).setValue(this.value)">

        <div class="field-title">Link strony</div>
        <div class="glue-children">
          <input type="text" name="link" data-validate autocomplete="off" class="field">
          <button class="btn primary" onclick="rewriteURL($(this).prev().find(`.field`))" data-tooltip="Uzupełnij na podstawie nazwy produktu" style="height: 35px;">
            <i class="fas fa-pen"></i>
          </button>
        </div>

        <div class="field-title">Tytuł (SEO)</div>
        <div class="glue-children">
          <input type="text" name="seo_title" class="field" data-show-count="60" data-count-description="(zalecane 50-58)">
          <button class="btn primary" onclick="rewrite($(`[name='title']`), $(this).prev().find(`.field`))" data-tooltip="Uzupełnij na podstawie nazwy produktu" style="height: 35px;">
            <i class="fas fa-pen"></i>
          </button>
        </div>
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

  <div class="field-title">Atrybuty produktu (wspólne dla wszystkich wariantów produktu)</div>
  <div name="attributes" data-type="attribute_values"><?= $allAttributeOptionsHTML ?></div>

  <div name="variants" data-validate="|count:1+"></div>

  <div name="variant_attributes_layout" class="no-remove no-add"></div>

  <!--<div class="field-title">Atrybuty wariantów</div>
  <div class="atrybuty_wariantow"></div>-->


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

      <div class="field-title">Nazwa wariantu <i class="fas fa-info-circle" data-tooltip="<b>Przykład</b><br>Nazwa produktu: Etui iPhone X<br>Nazwa wariantu: <span style='text-decoration:underline'>Zielone</span>"></i></div>

      <div class="glue-children">
        <div class="product-title-copy field-description" data-type="html"></div>
        <input type="text" name="name" class="field">
      </div>

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

      <div class="field-title">Atrybuty wariantu (inne niż wspólne dla wszystkich wariantów produktu)</div>
      <div name="attributes" data-type="attribute_values"><?= $allAttributeOptionsHTML ?></div>

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