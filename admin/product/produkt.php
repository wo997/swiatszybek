<?php //->[admin/produkt]

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

?>


<?php startSection("head"); ?>

<style>

</style>
<script>
  useTool("cms");

  window.addEventListener("DOMContentLoaded", function() {

    showSpecyfikacja();

    loadCategoryPicker("product_categories", {skip:2}, () => {
      setCategoryPickerValues(
        elem(`[data-category-picker-name="categories"]`),
        [<?= $categories ?>]
      );
    });

    <?php if ($kopia) : ?>
      elem(`[name="title"]`).value += " (kopia)";
      elem(`[name="product_id"]`).value = "-1";
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
            return r.quantity;
          }
        },
        {
          title: "Kolor",
          width: "6%",
          render: (r) => {
            return `<div style='width:20px;height:20px;background:${r.color};border:1px solid #ccc'></div>`;
          },
          escape: false
        },
        {
          title: "Kod produktu",
          width: "12%",
          render: (r) => {
            return r.product_code;
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
        {
          title: "Publiczny?",
          width: "95px",
          render: (r) => {
            return renderIsPublished(r);
          },
          escape: false
        },
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

    loadFormData(<?= json_encode($product_data) ?>, elem("#productForm"));
  });

  window.addEventListener("load", function() {
    imagePicker.setDefaultTag(elem('[name="title"]').value);
  });

  function showSpecyfikacja() {
    var v = document.getElementById("specyfikacja").value;

    var out = "<table class='specyfikacja'>";
    v.split("\n").forEach((e) => {
      p = e.split(":");
      if (p.length < 2) {
        p[1] = "";
        //p.push("");
      }
      out += `<tr><td>${p[0]}</td><td>${p[1]}</td></tr>`;
      //console.log(e)
    });
    out += "</table>";
    document.getElementById("specyfikacja_preview").innerHTML = out;
    document.getElementById("specyfikacja_output").value = out;
  }


  function imagePickerZdjeciaCallback(src, target) {
    var id = target.substr(8);
    document.getElementById("zdjecia-" + id).insertAdjacentHTML("beforeEnd",
      '<div class="wrapper"><img src="' + src + '"><div class="delete red" onclick="deleteImg(this,' + id + ')">X</div></div>'
    );
    updateZdjeciaRow(id);
  }

  function imagePickerDefaultCallback(src, target) {
    var prefix = target.getAttribute(`data-src-prefix`);
    if (!prefix) prefix = "/";
    target.setAttribute("src", prefix + src);
  }

  /*function deleteImg(obj, variantId) {
    obj.parentNode.parentNode.removeChild(obj.parentNode);
    updateZdjeciaRow(variantId);
  }

  function updateZdjeciaRow(id) {
    var out = "";
    var child = document.getElementById("zdjecia-" + id).childNodes;
    for (i = 0; i < child.length; i++) {
      var src = child[i].childNodes[0].src;
      var index = src.indexOf("/uploads");
      if (index != -1)
        src = src.substring(index);

      out += (i > 0 ? ";" : "") + src;
    }
    document.getElementById("zdjecia-" + id + '-src').value = out;
  }

  function changeColor(source, i) {
    var picker = document.getElementById("colorpicker-" + i);
    var checkbox = document.getElementById("colornone-" + i);
    var value = document.getElementById("colorvalue-" + i);;
    var color = "";
    if (source == 0 && checkbox.checked) {
      value.value = "";
      picker.style.opacity = 0;
    } else {
      value.value = "#" + picker.value;
      checkbox.checked = false;
      picker.style.opacity = 1;
    }
  }

  function showNextVariant() {
    for (i = 0; i < 8; i++) {
      var d = document.getElementById("variantdiv-" + i);
      if (!d) continue;

      if (d.classList.contains("hidden")) {
        d.classList.remove("hidden");
        document.getElementById("variantpublished-" + i).value = "1";
        break;
      }
    }
  }

  function deleteVariant(variant_id, unpublish, button) {
    var d = document.getElementById("variantdiv-" + variant_id);

    if (unpublish) {
      if (d.classList.contains("unpublished")) {
        d.classList.remove("unpublished");
        button.value = "Ukryj";
        button.style.background = "";
        document.getElementById("variantpublished-" + variant_id).value = "1";
      } else {
        d.classList.add("unpublished");
        button.value = "Przywróć";
        button.style.background = "#0c0";
        document.getElementById("variantpublished-" + variant_id).value = "0";
      }
    } else {
      d.classList.add("hidden");
      document.getElementById("variantpublished-" + i).value = "0";
    }
  }


  function isFormValid() {
    return validateForm({
      hiddenClassList: ["unpublished"]
    });
  }

  function setPostFields() {
    elem("#product-content-src").value = elem("#product-content").innerHTML;
    elem("#product-description-src").value = elem("#product-description .ql-editor").innerHTML;
  }


  var anyChange = true;

  window.addEventListener("DOMContentLoaded", function() {
    document.querySelector("form").onchange = function() {
      anyChange = true;
    }

    window.onbeforeunload = function(e) {
      if (anyChange) return 'Wszystkie zmiany zostaną utracone!';
    }

    window.addEventListener("keydown", (e) => {
      anyChange = true;
    });
  });

  function deleteItem() {
    anyChange = false;
    if (confirm("Czy chcesz usunąć produkt?")) {
      window.location = '/admin/delete_product/<?= ""; //$kopia ? '' : $product_id 
                                                ?>';
    }
  }
  */

  function copyMainImage(id) {
    var value = document.getElementById("img-main").getAttribute("src");
    document.getElementById(id).setAttribute("src", value);
  }

  function editPage() {
    imagePicker.setDefaultTag(elem('[name="title"]').value);
    editCMS(elem('#product-content'));
  }

  function newVariant() {
    var data = {
      name: "",
      price: "",
      rabat: "",
      quantity: "",
      product_code: "",
      color: "",
      zdjecie: "",
      published: "0",
      variant_id: "-1",
      product_id: <?= $product_data["product_id"] ?>
    };
    loadFormData(data, elem("#variantEdit"));

    elem(`[name="was_quantity"]`).value = data.quantity;

    showModal("variantEdit");
  }

  function editVariant(i) {
    var data = variants.results[i];
    loadFormData(data, elem("#variantEdit"));

    elem(`[name="was_quantity"]`).value = data.quantity;

    showModal("variantEdit");
  }

  function saveVariantForm() {
    xhr({
      url: "/admin/save_variant",
      params: getFormData(elem("#variantEdit")),
      success: () => {
        variants.search();
      }
    });
  }

  function saveProductForm() {
    xhr({
      url: "/admin/save_product",
      params: getFormData(elem("#productForm")),
      success: () => {
        window.location.reload();
      }
    });
  }

  function rewriteURL() {
    elem(`[name="link"]`).value = getLink(elem(`[name="title"]`).value);
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
        <?= htmlspecialchars($title0) ?>
      </div>
      <div>
        <?php if ($kopia) : ?>
          <a href="/admin/produkt/<?= $product_id ?>" class="btn secondary" style="padding: 2px 4px;">Anuluj <i class="fa fa-times"></i></a>
        <?php else : ?>
          <!--<a href="/admin/produkt/<?= $product_id ?>/kopia" class="btn secondary" style="padding: 2px 4px;">Kopiuj <i class="fas fa-copy"></i></a>-->
          <a href="/produkt/<?= $product_id . "/" . getLink($title0) ?>" class="btn secondary" style="padding: 2px 4px;">Pokaż bez zapisywania <i class="fas fa-external-link-alt"></i></a>
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
        <div class="field-title">Zdjęcie na stronę główną</div>
        <button type="button" class="btn primary" onclick="imagePicker.open((src)=>{imagePickerDefaultCallback(src,elem('#img-main'))})" style="width:auto;display: inline-block;">Wybierz</button>
        <img id="img-main" data-src-name="image" data-src-prefix="/uploads/df/" style="max-width: 100%;max-height: 200px;max-width: 200px;display: block;margin: 20px auto;" />
      </div>
      <div style="margin-left:10px">
        <div class="field-title">Wersja desktopowa</div>
        <button type="button" class="btn primary" onclick="imagePicker.open((src)=>{imagePickerDefaultCallback(src,elem('#img-desktop'))})" style="width:auto;display: inline-block;">Wybierz</button>
        <input type="button" class="btn secondary" value="Kopiuj zdjęcie główne" onclick="copyMainImage('img-desktop')" style="width:auto;display: inline-block;">
        <img id="img-desktop" data-src-name="image_desktop" data-src-prefix="/uploads/df/" style="max-width: 100%;max-height: 200px;max-width: 200px;display: block;margin: 20px auto;" />
      </div>
    </div>

    <div class="field-title">Kategorie</div>
    <input type="hidden" name="categories" data-category-picker data-category-picker-source="product_categories">

    <div style="margin-top: 10px">
      <div class="field-title">Opis krótki (z prawej strony)</div>
      <div class="quill-wrapper2">
        <div id="product-description" data-html-name="descriptionShort" data-point-child=".ql-editor"></div>
      </div>
    </div>

    <div style="margin-top: 10px">
      <div style="display:flex" class="mobileRow">
        <div>
          <span>Specyfikacja (pisz "Atrybut: Wartość" -> ENTER)</span>
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

      <h3>Opis główny <button type="button" onclick="editPage()" class="btn primary">Edytuj <i class="far fa-edit"></i></button></h3>
      <div id="product-content" data-html-name="description" class="cms" style="border:1px solid #ccc;max-height: calc(100vh - 352px);overflow-y:auto"><?= $description ?></div>
    </div>

    <h2 style="text-align:center">Warianty <span style="font-size: 0.7rem">(min. 1)</span></h2>

    <div class="variants"></div>

    <input type="hidden" name="product_id">

    <?php if (!$kopia) : ?>
      <button type="button" style='background:red;color:white;margin-top:10px' onclick="deleteItem()">USUŃ PRODUKT</button>
    <?php endif ?>
  </div>
</div>

<div id="variantEdit" data-modal data-expand>
  <div class="stretch-vertical">
    <div class="custom-toolbar">
      <span class="title">Edycja menu</span>
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
      <input type="number" name="quantity" class="field">

      <div class="field-title">Kod produktu</div>
      <input type="text" name="product_code" class="field">

      <div class="field-title">Kolor</div>
      <input class="jscolor" name="color" onclick="this.select()" onchange="this.style.backgroundColor = this.value" style="width: 65px;text-align: center;">
      <div class="btn primary" onclick="this.previousElementSibling.value='';this.previousElementSibling.style.backgroundColor=''">Brak <i class="fa fa-times"></i></div>

      <div class="field-title">
        Zdjecie
        <button type="button" class="btn primary" onclick='imagePicker.open((src)=>{imagePickerDefaultCallback(src,elem(`[data-src-name="zdjecie"]`))})' style="width:auto;display: inline-block;">Wybierz</button>
      </div>
      <img data-src-name="zdjecie" data-src-prefix="/uploads/md/" style="max-width: 100%;max-height: 200px;max-width: 200px;display: block;" />

      <div class="field-title">Widoczność</div>
      <select name="published" class="field">
        <option value="1">Publiczny</option>
        <option value="0">Ukryty</option>
        <select>

          <input type="hidden" name="was_quantity">
          <input type="hidden" name="product_id">
          <input type="hidden" name="variant_id">
    </div>
  </div>

  <?php include "admin/default_page.php"; ?>