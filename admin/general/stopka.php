<?php //route[{ADMIN}stopka]

?>

<?php startSection("head_content"); ?>

<title>Stopka</title>

<style>

</style>

<script>
    useTool("cms");
    useTool("preview");

    domload(() => {
        setFormData(
            <?= json_encode([
                "page_footer" => getSetting("theme", "general", ["page_footer"])
            ]); ?>, `#footerForm`);
    });

    function editFooter() {
        editCMS($('[name="page_footer"]'), {
            preview: {
                url: "/",
                content_name: "page_footer",
            }
        });
    }

    function saveFooter() {
        var form = $(`#footerForm`);

        if (!validateForm(form)) {
            return;
        }

        var params = getFormData(form);

        xhr({
            url: STATIC_URLS["ADMIN"] + "save_footer",
            params: params,
            success: () => {
                setFormInitialState(form);
            }
        });
    }

    function showPreview() {
        var form = $(`#footerForm`);

        if (!validateForm(form)) {
            return;
        }

        var data = getFormData(form);

        data.page_footer = $(`[name="page_footer"]`).getValue();

        window.preview.open("/", data);
    }
</script>


<?php startSection("header"); ?>

<div class="custom-toolbar">
    <div class="title">
        Stopka
    </div>
    <div>
        <button onclick="showPreview()" class="btn primary">Podgląd <i class="fas fa-eye"></i></button>
        <button onclick="saveFooter()" class="btn primary">Zapisz <i class="fas fa-save"></i></button>
    </div>
</div>

<?php startSection("body_content"); ?>

<div id="footerForm">
    <div class="field-title">
        Stopka
        <div onclick="editFooter()" class="btn primary">Edytuj <i class="far fa-edit"></i></div>
    </div>
    <div name="page_footer" data-type="html" class="cms preview_html"></div>
</div>

<?php include "admin/page_template.php"; ?>