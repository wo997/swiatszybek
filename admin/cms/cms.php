<?php //->[admin/cms]

$parts = explode("/", $url);
if (isset($parts[2]))
    $page_data["cms_id"] = intval($parts[2]);
else {
    $page_data["cms_id"] = -1;
}

$stmt = $con->prepare("SELECT meta_description, title, content, link, metadata, published FROM cms WHERE cms_id = " . intval($page_data["cms_id"]));
$stmt->execute();
$stmt->bind_result($meta_description, $title, $page_data["content"], $page_link, $page_data["metadata"], $published);
if (!mysqli_stmt_fetch($stmt)) {
    $meta_description = "";
    $title = "";
    $page_data["content"] = "";
    $page_link = "";
    $page_data["cms_id"] = -1;
    $page_data["metadata"] = null;
}
$stmt->close();

$page_metadata_json = json_decode($page_data["metadata"], true);
include "helpers/set_page_metadata_defaults.php";
$page_data["metadata"] = json_encode($page_metadata_json);

$static = checkUrl($page_link);

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

        var content = `<?= str_replace("`", "", $page_data["content"]) ?>`;
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

        $(`[name='meta_description']`).dispatchEvent(new Event('change'));

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
        showModal("pagePreview");
        $("#preview_page_content").value = $("#content1-src").value;
        $("#preview_page_metadata").value = $("#metadata").value;
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
        $(`[name="link"]`).value = getLink($(`[name="title"]`).value);
    }

    function editPage() {
        imagePicker.setDefaultTag($('[name="title"]').value);
        editCMS($('#content1'));
    }
</script>

<?php startSection("content"); ?>

<form class="preview_page" style="display:none" method="post" target="preview_iframe" <?php if ($static) : ?> action="/<?= $page_link ?>" <?php else : ?> action="/admin/podglad_strony" <?php endif ?>>
    <input type="text" id="preview_page_content" name="content">
    <input type="text" id="preview_page_metadata" name="metadata">
</form>

<form class="admin-wrapper" method="post" action="/admin/save_cms">

    <div class="sticky-top">
        <div class="custom-toolbar">
            <span class="title">Edycja strony</span>
            <a class="btn primary" href="/admin/strony">Wszystkie strony <i class="fas fa-file-alt"></i></a>
            <?php if ($page_data["cms_id"] != -1) : ?>
                <button class="btn primary" type="submit" name="delete" style="color:red" onclick='return confirm("Czy chcesz usunąć podstronę?")'>Usuń <i class="fa fa-times"></i></button>
            <?php endif ?>
            <?php if ($published) : ?>
                <a type="button" class="btn primary" href="/<?= $page_link ?>">Otwórz stronę <i class="fas fa-chevron-circle-right"></i></a>
            <?php endif ?>
            <button onclick="preview()" type="button" class="btn primary">Podgląd <i class="fas fa-eye"></i></button>
            <button class="btn primary" type="submit" onclick="anyChange=false">Zapisz <i class="fa fa-save"></i></button>
        </div>
    </div>

    <input type='hidden' name='cms_id' value='<?= $page_data["cms_id"] ?>'>

    <h3>Tytuł</h3>
    <input type='text' name='title' value='<?= $title ?>' data-show-count="60" data-count-description="(zalecane 50-58)" style='width:100%;max-width:500px'>
    <br>
    <h3>Link strony (URL)</h3>
    <div style="display:flex;flex-wrap: wrap;">
        <input type='text' name='link' value='<?= $page_link ?>' style='width:100%;max-width:500px'>
        <div class="btn primary" onclick="rewriteURL()">Uzupełnij na podstawie tytułu</div>
    </div>
    <br>
    <h3>Opis Meta Description</h3>
    <textarea class="seo_description" name='meta_description' data-show-count="158" data-count-description="(zalecane 130-155)"><?= $meta_description ?></textarea>

    <div <?php if ($page_data["cms_id"] != -1 && $static) echo "style='display:none'" ?>>
        <br>
        <label class="checkbox-wrapper">Czy strona jest publiczna? <input type="checkbox" name="published" <?php if ($published == 1) echo "checked"; ?>>
            <div class="checkbox"></div>
        </label>

        <div class="single-row-labels">
            <h3>Maksymalna szerokość strony</h3>
            <label><input type="radio" data-property="page_width" value="1500px" data-type="json" data-name="metadata">1500px</label>
            <label><input type="radio" data-property="page_width" value="1300px" data-type="json" data-name="metadata">1300px</label>
            <label><input type="radio" data-property="page_width" value="1100px" data-type="json" data-name="metadata">1100px</label>
            <label><input type="radio" data-property="page_width" value="100%" data-type="json" data-name="metadata">brak (100%)</label>

            <h3>Odstępy z góry i dołu</h3>
            <label><input type="radio" data-property="page_padding" value="80px" data-type="json" data-name="metadata">80px</label>
            <label><input type="radio" data-property="page_padding" value="45px" data-type="json" data-name="metadata">45px</label>
            <label><input type="radio" data-property="page_padding" value="25px" data-type="json" data-name="metadata">25px</label>
            <label><input type="radio" data-property="page_padding" value="0" data-type="json" data-name="metadata">brak (0px)</label>
        </div>

        <input type="hidden" id="metadata" name='metadata'>

        <h3>Zawartość strony <button type="button" onclick="editPage()" class="btn primary">Edytuj <i class="far fa-edit"></i></button></h3>

        <div id="content1" class="cms preview_html"></div>
        <input type="hidden" id="content1-src" name="content">
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