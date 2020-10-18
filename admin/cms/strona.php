<?php //route[{ADMIN}strona]

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
        "published" => 0,
        "cms_id" => -1
    ];
}

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

    window.addEventListener("DOMContentLoaded", function() {
        $(`[name='seo_description']`).setValue();
    });

    function showPreview() {
        window.preview.open("/<?= nonull($page_data, "link") ?>", {
            content: $(`[name="content"]`).getValue(),
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
        editCMS(`[name="content"]`, {
            preview: {
                url: "/<?= nonull($page_data, "link") ?>",
                content_name: "content",
            }
        });
    }

    function save(remove = false) {
        var form = $("#cmsForm");

        setFormInitialState(form);
        if (cms_id == -1 && remove) {
            window.location = STATIC_URLS["ADMIN"] + "strony";
            return;
        }

        if (!remove && !validateForm(form)) {
            return;
        }
        var params = getFormData(form);

        if (remove) {
            params["remove"] = true;
        }

        xhr({
            url: STATIC_URLS["ADMIN"] + "save_cms",
            params: params,
            success: (res) => {
                //showNotification(`<i class="fas fa-check"></i> Zapisano zmiany</b>`); // TODO XD
            }
        });
    }
</script>

<?php startSection("header"); ?>

<div class="custom-toolbar">
    <span class="title">Edycja strony</span>
    <a class="btn secondary" href="<?= STATIC_URLS["ADMIN"] ?>strony">Wszystkie strony <i class="fas fa-file-alt"></i></a>
    <a class="btn primary" href="/<?= $page_data["link"] ?>">Pokaż stronę <i class="fas fa-chevron-circle-right"></i></a>
    <button onclick="showPreview()" class="btn primary">Podgląd <i class="fas fa-eye"></i></button>
    <button class="btn primary" onclick="save()">Zapisz <i class="fa fa-save"></i></button>
</div>

<?php startSection("content"); ?>

<div id="cmsForm" data-form data-warn-before-leave>
    <input type='hidden' name='cms_id' value='<?= $page_data["cms_id"] ?>'>

    <div <?= $static ? "style='display:none'" : "" ?>>
        <br>
        <label class="checkbox-wrapper">Czy strona jest publiczna? <input type="checkbox" name="published" <?php if ($page_data["published"] == 1) echo "checked"; ?>>
            <div class="checkbox"></div>
        </label>
    </div>

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

        <div>
            <div class="field-title">Zawartość strony <button onclick="editPage()" class="btn primary">Edytuj <i class="far fa-edit"></i></button></div>
            <div class="cms preview_html" name="content" data-type="html"></div>
        </div>

        <div style="margin-top:auto;align-self: flex-end; padding-top:30px">
            <button class="btn red" onclick='if (confirm("Czy chcesz usunąć podstronę?")) save(true);'>Usuń stronę <i class="fa fa-trash"></i></button>
        </div>
    </div>
</div>

<?php include "admin/default_page.php"; ?>