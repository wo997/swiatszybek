<?php //route[admin/cms]

$parts = explode("/", $url);
if (isset($parts[2])) {
    $cms_id = intval($parts[2]);
    $page_data = fetchRow("SELECT * FROM cms WHERE cms_id = " . intval($cms_id));
} else {
    $cms_id = -1;
    $page_data = null;
}

if (!$page_data) {
    $page_data = [
        "title" => "",
        "seo_description" => "",
        "seo_title" => "",
        "content" => "",
        "link" => "",
        "metadata" => null,
        "published" => 0,
        "cms_id" => -1
    ];
}

$page_metadata_json = json_decode($page_data["metadata"], true);
include "helpers/set_page_metadata_defaults.php";
$page_data["metadata"] = json_encode($page_metadata_json);

$static = checkUrl($page_data["link"]);

?>

<?php startSection("head"); ?>

<title>CMS</title>

<style>
    #preview_iframe {
        width: 100%;
        height: 100%;
        margin: auto;
        -webkit-box-shadow: 0px 2px 5px 0px rgba(0, 0, 0, 0.15);
        -moz-box-shadow: 0px 2px 5px 0px rgba(0, 0, 0, 0.15);
        box-shadow: 0px 2px 5px 0px rgba(0, 0, 0, 0.15);
        border: none;
    }
</style>

<script>
    window.addEventListener("DOMContentLoaded", function() {
        useTool("cms");
        var content = decodeHtmlEntities(`<?= htmlentities($page_data["content"]) ?>`);
        $("#content1").insertAdjacentHTML("beforeend", content);
        $("#content1-src").value = content;

        resizeCallback();

        registerTextCounters();
    });

    window.addEventListener("load", function() {
        $("#cms").setAttribute("data-expand", "large");
    });


    // metadata

    window.addEventListener("DOMContentLoaded", function() {

        $(`[name='seo_description']`).dispatchEvent(new Event('change'));

        // includes only radio buttons
        $$("*[data-type='json'][data-name='metadata']").forEach(f => {
            var p = f.getAttribute("data-property");
            if (p) f.setAttribute("name", p);
        });

        $$("*[data-type='json']").forEach(e => {
            e.addEventListener("change", function() {
                var metadata = {};
                $$("*[data-type='json'][data-name='metadata']").forEach(f => {
                    if (f.checked) {
                        metadata[f.name] = f.value;
                    }
                });
                document.getElementById("metadata").value = JSON.stringify(metadata);
            });
        });

        var metadata = "<?= addslashes($page_data["metadata"]) ?>";
        document.getElementById("metadata").value = metadata;

        var m = JSON.parse(metadata);
        for (let key in m) {
            var e = $(`input[data-property='${key}'][value='${m[key]}']`);
            if (e) e.checked = true;
        }

    });

    // preview start
    function preview() {
        $("#preview_page_content").value = $("#content1-src").value;
        $("#preview_page_metadata").value = $("#metadata").value;
        showModal("pagePreview");
        $(".preview_page").submit();
    }

    function setWindowSize(width = "", height = "") {
        var e = document.getElementById("preview_iframe");
        e.style.width = width;
        e.style.height = height;
        $(".preview_page").submit();
    }
    // preview end

    function rewriteURL() {
        $(`[name="link"]`).value = getLink($(`[name="seo_title"]`).value);
    }

    function editPage() {
        imagePicker.setDefaultTag($('[name="seo_title"]').value);
        editCMS($('#content1'));
    }
</script>

<?php startSection("content"); ?>

<form class="preview_page" style="display:none" method="post" target="preview_iframe" action="/<?= nonull($page_data, "link") ?>">
    <input type="text" name="content">
    <input type="text" name="metadata">
</form>

<form class="admin-wrapper" method="post" action="/admin/save_cms">

    <div class="sticky-top">
        <div class="custom-toolbar">
            <span class="title">Edycja strony</span>
            <a class="btn primary" href="/admin/strony">Wszystkie strony <i class="fas fa-file-alt"></i></a>
            <?php if ($page_data["published"]) : ?>
                <a type="button" class="btn primary" href="/<?= $page_data["link"] ?>">Otwórz stronę <i class="fas fa-chevron-circle-right"></i></a>
            <?php endif ?>
            <button onclick="preview()" type="button" class="btn primary">Podgląd <i class="fas fa-eye"></i></button>
            <button class="btn primary" type="submit" onclick="anyChange=false">Zapisz <i class="fa fa-save"></i></button>
        </div>
    </div>

    <input type='hidden' name='cms_id' value='<?= $page_data["cms_id"] ?>'>

    <div class="field-title">Nazwa strony</div>
    <input type="text" name="title" class="field" value="<?= $page_data["title"] ?>" style='width:100%;max-width:500px'>

    <div class="field-title">Tytuł (SEO)</div>
    <input type='text' name='seo_title' value='<?= $page_data["seo_title"] ?>' data-show-count="60" data-count-description="(zalecane 50-58)" style='width:100%;max-width:500px' class="field">

    <div class="field-title">Link strony (URL)</div>
    <div style="display:flex;flex-wrap: wrap;">
        <input type='text' name='link' value='<?= $page_data["link"] ?>' style='width:100%;max-width:500px' class="field">
        <div class="btn primary" onclick="rewriteURL()">Uzupełnij na podstawie tytułu</div>
    </div>

    <div class="field-title">Opis (SEO)</div>
    <textarea class="seo_description field" name='seo_description' data-show-count="158" data-count-description="(zalecane 130-155)"><?= $page_data["seo_description"] ?></textarea>

    <div <?php if ($static) echo "style='display:none'" ?>>
        <br>
        <label class="checkbox-wrapper">Czy strona jest publiczna? <input type="checkbox" name="published" <?php if ($page_data["published"] == 1) echo "checked"; ?>>
            <div class="checkbox"></div>
        </label>

        <div class="single-row-labels">

            <div class="field-title">Maksymalna szerokość strony</div>
            <label><input type="radio" data-property="page_width" value="1500px" data-type="json" data-name="metadata">1500px</label>
            <label><input type="radio" data-property="page_width" value="1300px" data-type="json" data-name="metadata">1300px</label>
            <label><input type="radio" data-property="page_width" value="1100px" data-type="json" data-name="metadata">1100px</label>
            <label><input type="radio" data-property="page_width" value="100%" data-type="json" data-name="metadata">brak (100%)</label>

            <div class="field-title">Odstępy z góry i dołu</div>
            <label><input type="radio" data-property="page_padding" value="80px" data-type="json" data-name="metadata">80px</label>
            <label><input type="radio" data-property="page_padding" value="45px" data-type="json" data-name="metadata">45px</label>
            <label><input type="radio" data-property="page_padding" value="25px" data-type="json" data-name="metadata">25px</label>
            <label><input type="radio" data-property="page_padding" value="0" data-type="json" data-name="metadata">brak (0px)</label>
        </div>

        <input type="hidden" id="metadata" name='metadata'>
        <div class="stretch-vertical">
            <div>
                <div class="field-title">Zawartość strony <button type="button" onclick="editPage()" class="btn primary">Edytuj <i class="far fa-edit"></i></button></div>
                <div id="content1" class="cms preview_html"></div>
                <input type="hidden" id="content1-src" name="content">
            </div>

            <?php if ($page_data["cms_id"] == -1) : ?>
                <div style="margin-top:auto;align-self: flex-end; padding-top:30px">
                    <a href="/admin/strony" class="btn red">Usuń stronę <i class="fa fa-trash"></i></a>
                </div>
            <?php endif ?>
            <?php if ($page_data["cms_id"] != -1) : ?>
                <div style="margin-top:auto;align-self: flex-end; padding-top:30px">
                    <button type="submit" name="delete" class="btn red" onclick='return confirm("Czy chcesz usunąć podstronę?")'>Usuń stronę <i class="fa fa-trash"></i></button>
                </div>
            <?php endif ?>
        </div>
    </div>
</form>

<div id="pagePreview" class="hugeModalDesktop" data-modal>
    <div class="stretch-vertical">
        <div class="custom-toolbar">
            <span class="title">
                Podgląd strony
                <button class="btn primary" onclick="setWindowSize('','')">Komputer <i class="fas fa-desktop"></i></button>
                <button class="btn primary" onclick="setWindowSize('410px','850px')">Telefon <i class="fas fa-mobile-alt"></i></button>
                <button class="btn primary" onclick="setWindowSize('340px','568px')">iPhone SE <i class="fas fa-mobile-alt"></i> <i class='fas fa-info-circle' data-tooltip='Najmniejsza rozdzielczość z urządzeń mobilnych'></i></button>
            </span>
            <button class="btn primary" onclick="hideParentModal(this)">Ukryj <i class="fa fa-times"></i></button>
        </div>
        <iframe id="preview_iframe" name="preview_iframe"></iframe>
    </div>
</div>

<?php include "admin/default_page.php"; ?>