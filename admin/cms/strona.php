<?php //route[admin/strona]

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

</style>

<script>
    useTool("cms");
    useTool("preview");
    const cms_id = <?= $cms_id ?>;

    window.addEventListener("DOMContentLoaded", function() {
        setFormData(<?= json_encode($page_data) ?>, "#cmsForm");

        resizeCallback();

        registerTextCounters();
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
                $("#metadata").value = JSON.stringify(metadata);
            });
        });

        var metadata = "<?= addslashes($page_data["metadata"]) ?>";
        $("#metadata").value = metadata;

        var m = JSON.parse(metadata);
        for (let key in m) {
            var e = $(`input[data-property='${key}'][value='${m[key]}']`);
            if (e) e.checked = true;
        }

    });

    function showPreview() {
        window.preview.open("/<?= nonull($page_data, "link") ?>", {
            content: $(`[name="content"]`).getValue(),
            metadata: $("#metadata").value
        });
    }

    function rewriteURL() {
        $(`[name="link"]`).setValue(getLink($(`[name="title"]`).value));

    }

    function editPage() {
        var t = $('[name="seo_title"]').getValue();
        if (!t) {
            t = $('[name="title"]').getValue();
        }
        fileManager.setDefaultName(t);
        editCMS(`[name="content"]`);
    }

    function save(remove = false) {
        if (cms_id == -1 && remove) {
            window.location = "/admin/strony";
            return;
        }

        var f = $("#cmsForm");

        if (!remove && !validateForm(f)) {
            return;
        }
        var params = getFormData(f);

        if (remove) {
            params["remove"] = true;
        }

        xhr({
            url: "/admin/save_cms",
            params: params,
            success: (res) => {
                if (res.cms_link) {
                    window.location = res.cms_link
                } else {
                    window.location.reload();
                }
                //showNotification(`<i class="fas fa-check"></i> Zapisano zmiany</b>`); // TODO XD
            }
        });
    }
</script>

<?php startSection("content"); ?>

<div id="cmsForm">

    <div class="sticky-top">
        <div class="custom-toolbar">
            <span class="title">Edycja strony</span>
            <a class="btn primary" href="/admin/strony">Wszystkie strony <i class="fas fa-file-alt"></i></a>
            <?php if ($page_data["published"]) : ?>
                <a class="btn primary" href="/<?= $page_data["link"] ?>">Otwórz stronę <i class="fas fa-chevron-circle-right"></i></a>
            <?php endif ?>
            <button onclick="showPreview()" class="btn primary">Podgląd <i class="fas fa-eye"></i></button>
            <button class="btn primary" onclick="save()">Zapisz <i class="fa fa-save"></i></button>
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
        <button class="btn primary" onclick="rewriteURL()">Uzupełnij na podstawie tytułu</button>
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
            <label style="display:block"><input type="radio" data-property="page_width" value="1500px" data-type="json" data-name="metadata"> 1500px</label>
            <label style="display:block"><input type="radio" data-property="page_width" value="1300px" data-type="json" data-name="metadata"> 1300px</label>
            <label style="display:block"><input type="radio" data-property="page_width" value="1100px" data-type="json" data-name="metadata"> 1100px</label>
            <label style="display:block"><input type="radio" data-property="page_width" value="100%" data-type="json" data-name="metadata"> brak (100%)</label>

            <div class="field-title">Odstępy z góry i dołu</div>
            <label style="display:block"><input type="radio" data-property="page_padding" value="80px" data-type="json" data-name="metadata"> 80px</label>
            <label style="display:block"><input type="radio" data-property="page_padding" value="45px" data-type="json" data-name="metadata"> 45px</label>
            <label style="display:block"><input type="radio" data-property="page_padding" value="25px" data-type="json" data-name="metadata"> 25px</label>
            <label style="display:block"><input type="radio" data-property="page_padding" value="0" data-type="json" data-name="metadata"> brak (0px)</label>
        </div>

        <input type="hidden" id="metadata" name='metadata'>
        <div class="modal-body stretch-vertical">
            <div>
                <div class="field-title">Zawartość strony <button onclick="editPage()" class="btn primary">Edytuj <i class="far fa-edit"></i></button></div>
                <div class="cms preview_html" name="content" data-type="html"></div>
            </div>

            <div style="margin-top:auto;align-self: flex-end; padding-top:30px">
                <button class="btn red" onclick='if (confirm("Czy chcesz usunąć podstronę?")) save(true);'>Usuń stronę <i class="fa fa-trash"></i></button>
            </div>
        </div>
    </div>
</div>

<?php include "admin/default_page.php"; ?>