<?php //route[{ADMIN}new-cms]

?>

<?php startSection("head"); ?>

<title>Nowy CMS</title>

<style>

</style>

<script>
    useTool("newCms");

    function editFooter() {
        window._newCms.edit($('[name="page_footer"]'), {
            preview: {
                url: "/",
                content_name: "page_footer",
            }
        });
    }
</script>

<?php startSection("header"); ?>

<div class="custom-toolbar">
    <span class="title">Nowy CMS</span>
</div>

<?php startSection("content"); ?>

<div id="xxx">
    <div onclick="editFooter()" class="btn primary">Edytuj <i class="far fa-edit"></i></div>

    <div name="page_footer" data-type="html" class="cms preview_html">










        <button class="btn newCms_add_block_btn subtle">
            <i class="fas fa-plus"></i>
        </button>
        <div class="newCms_block newCms_quill_editor">
            <div class="newCms_block_content"></div>
        </div>
        <button class="btn newCms_add_block_btn subtle">
            <i class="fas fa-plus"></i>
        </button>


        <div class="newCms_block newCms_container">


            <button class="btn newCms_add_block_btn subtle">
                <i class="fas fa-plus"></i>
            </button>
            <div class="newCms_block newCms_container">


                <button class="btn newCms_add_block_btn subtle">
                    <i class="fas fa-plus"></i>
                </button>
                <div class="newCms_block newCms_container">
                    <button class="btn newCms_add_block_btn subtle">
                        <i class="fas fa-plus"></i>
                    </button>

                    <div class="newCms_block_content"></div>
                </div>
                <button class="btn newCms_add_block_btn subtle">
                    <i class="fas fa-plus"></i>
                </button>


                <div class="newCms_block newCms_quill_editor">
                    <div class="newCms_block_content"></div>
                </div>
                <button class="btn newCms_add_block_btn subtle">
                    <i class="fas fa-plus"></i>
                </button>

                <div class="newCms_block_content"></div>
            </div>
            <button class="btn newCms_add_block_btn subtle">
                <i class="fas fa-plus"></i>
            </button>

            <div class="newCms_block_content"></div>
        </div>
        <button class="btn newCms_add_block_btn subtle">
            <i class="fas fa-plus"></i>
        </button>











    </div>

</div>

<?php include "admin/page_template.php"; ?>