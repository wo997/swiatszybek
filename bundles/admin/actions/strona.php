<?php //route[{ADMIN}/strona]

$cms_id = Request::urlParam(2);
if ($cms_id) {
    $cms_id = intval($cms_id);
    $page_data = DB::fetchRow("SELECT * FROM cms WHERE cms_id = $cms_id");
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

<?php startSection("head_content"); ?>

<title>CMS</title>

<style>

</style>

<script>
    useTool("cms");
    useTool("preview");
    const cms_id = <?= $cms_id ?>;

    domload(() => {
        setFormData(<?= json_encode($page_data) ?>, "#cmsForm");

        resizeCallback();
    });

    function showPreview() {
        window.preview.open("/<?= def($page_data, "link") ?>", {
            content: $(`[name="content"]`).getValue(),
        });
    }

    function rewriteURL() {
        $(`[name="link"]`).setValue(escapeUrl($(`[name="title"]`).value));

    }

    function editPage() {
        var t = $('[name="seo_title"]').getValue();
        if (!t) {
            t = $('[name="title"]').getValue();
        }
        fileManager.setDefaultName(t);
        editCMS(`[name="content"]`, {
            preview: {
                url: "/<?= def($page_data, "link") ?>",
                content_name: "content",
            }
        });
    }

    function save(remove = false) {
        var form = $("#cmsForm");

        setFormInitialState(form);
        if (cms_id == -1 && remove) {
            window.location = Request::$sTATIC_URLS["ADMIN"] + "/strony";
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
            url: Request::$sTATIC_URLS["ADMIN"] + "/save_cms",
            params: params,
            success: (res) => {
                //showNotification(`<i class="fas fa-check"></i> Zapisano zmiany</b>`); // TODO XD
            }
        });
    }
</script>

<?php startSection("header"); ?>

<div class="custom_toolbar">
    <span class="title">Edycja strony</span>
    <a class="btn secondary" href="<?= Request::$static_urls["ADMIN"] ?>strony">Wszystkie strony <i class="fas fa-file-alt"></i></a>
    <a class="btn primary" href="/<?= $page_data["link"] ?>">Pokaż stronę <i class="fas fa-chevron-circle-right"></i></a>
    <button onclick="showPreview()" class="btn primary">Podgląd <i class="fas fa-eye"></i></button>
    <button class="btn primary" onclick="save()">Zapisz <i class="fa fa-save"></i></button>
</div>

<?php startSection("body_content"); ?>

<div id="cmsForm" data-form data-warn-before-leave class="form-field-spacing">
    <input type='hidden' name='cms_id' value='<?= $page_data["cms_id"] ?>'>

    <div <?= $static ? "style='display:none'" : "" ?>>
        <br>
        <label class="checkbox-wrapper">
            Czy strona jest publiczna?
            <input type="checkbox" name="published">
            <div class="checkbox"></div>
        </label>
    </div>

    <div style="max-width: 600px">
        <div class="label">Nazwa strony</div>
        <input type="text" name="title" class="field" value="<?= $page_data["title"] ?>" style='width:100%;max-width:500px'>

        <div class="label">Link strony (URL)</div>
        <div class="glue_children">
            <input type='text' name='link' data-validate="|optional" class="field">
            <button class="btn primary" onclick="rewrite($(`[name='title']`), $(this)._prev()._child(`.field`), {link:true})" data-tooltip="Uzupełnij na podstawie nazwy strony" style="height: var(--field-height);">
                <i class="fas fa-pen"></i>
            </button>
        </div>

        <div class="label">Tytuł (SEO)</div>
        <div class="glue_children">
            <input type='text' name='seo_title' class="field" data-show-count="60" data-count-description="(zalecane 50-58)">
            <button class="btn primary" onclick="rewrite($(`[name='title']`), $(this)._prev()._child(`.field`))" data-tooltip="Uzupełnij na podstawie nazwy strony" style="height: var(--field-height);">
                <i class="fas fa-pen"></i>
            </button>
        </div>

        <div class="label">Opis (SEO)</div>
        <textarea class="seo_description field" name='seo_description' data-show-count="158" data-count-description="(zalecane 130-155)"></textarea>
    </div>

    <div <?php if ($static) echo "style='display:none'" ?>>

        <div>
            <div class="label">Zawartość strony <button onclick="editPage()" class="btn primary">Edytuj <i class="far fa-edit"></i></button></div>
            <div class="cms preview_html" name="content" data-type="html"></div>
        </div>

        <div style="margin-top:auto;align-self: flex-end; padding-top:30px">
            <button class="btn red" onclick='if (confirm("Czy chcesz usunąć podstronę?")) save(true);'>Usuń stronę <i class="fa fa-trash"></i></button>
        </div>
    </div>
</div>

<?php include "bundles/admin/templates/default.php"; ?>