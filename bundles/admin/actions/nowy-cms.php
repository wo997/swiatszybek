<?php //route[{ADMIN}/nowy-cms]

$page_id = Request::urlParam(2);
if ($page_id) {
    $page_id = intval($page_id);
    $page_data = DB::fetchRow("SELECT * FROM page WHERE page_id = $page_id");
} else {
    $page_id = -1;
    $page_data = null;
}

if (!$page_data) {
    $page_data = [
        "page_id" => "-1",
        "url" => "",
        "seo_title" => "",
        "seo_description" => "",
        "html_content" => "",
        "settings_json" => "",
        "published" => "0"
    ];
}

?>

<?php startSection("head_content"); ?>

<title>Nowy CMS</title>

<style>

</style>

<script>
    useTool("newCms");

    window.addEventListener("tool_loaded", (event) => {
        if (event.detail.name == "newCms" && event.detail.info == "all") {
            let data = JSON.parse(<?= json_encode(
                                        getSetting("general", "random", [])
                                    ); ?>);

            setFormData(
                data, `#newCms`);

            editNewCms();
        }
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

        /*const data = getFormData($("#newCms"));
        const less_data = {
            content: data.content,
            styles: data.styles,
        };*/
        const data = getFormData($("#newCms"));
        const less_data = {
            content: newCms.getCleanOutput(),
            styles: data.styles,
        };

        var params = {
            //random: getFormData(form),
            random: JSON.stringify(less_data)
        };

        xhr({
            url: STATIC_URLS["ADMIN"] + "/save_new_cms",
            params: params,
            success: () => {
                setFormInitialState(form);
            }
        });
    }
</script>

<?php startSection("header");
?>

<div class="custom_toolbar">
    <span class="title">Nowy CMS</span>
    <button class="btn primary" onclick="saveNewCms()">Zapisz <i class="fa fa-save"></i></button>

</div>

<?php startSection("body_content"); ?>

<?php //include "admin/tools/newCms/main.html" 
?>

<div id="newCmsForm">

    <div onclick="editNewCms()" class="btn primary">Edytuj <i class="far fa-edit"></i></div>

    <div name="random_content" data-type="html" class="newCms_container_content preview_html" style="max-height:500px">

    </div>

</div>

<?php include "bundles/admin/templates/default.php"; ?>