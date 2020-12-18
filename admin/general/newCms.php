<?php //route[{ADMIN}new-cms]

?>

<?php startSection("head"); ?>

<title>Nowy CMS</title>

<style>

</style>

<script>
    domload(() => {
        useTool("newCms");
        setFormData(
            <?= json_encode(
                getSetting("general", "random", [])
            ); ?>, `#newCmsForm`);
    });

    function editNewCms() {
        window.newCms.edit($('[name="random_content"]'), {
            source: this,
            preview: {
                url: "/",
                content_name: "random_content",
            }
        });
    }

    function saveNewCms() {
        var form = $(`#newCmsForm`);

        var params = {
            random: getFormData(form),
        };

        xhr({
            url: STATIC_URLS["ADMIN"] + "save_new_cms",
            params: params,
            success: () => {
                setFormInitialState(form);
            }
        });
    }
</script>

<?php startSection("header"); ?>

<div class="custom-toolbar">
    <span class="title">Nowy CMS</span>
    <button class="btn primary" onclick="saveNewCms()">Zapisz <i class="fa fa-save"></i></button>

</div>

<?php startSection("content"); ?>

<div id="newCmsForm">

    <div onclick="editNewCms()" class="btn primary">Edytuj <i class="far fa-edit"></i></div>

    <div name="random_content" data-type="html" class="newCms_container_content preview_html" style="max-height:500px">

    </div>

</div>

<?php include "admin/page_template.php"; ?>