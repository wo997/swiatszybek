<?php

endSection();

$body_content =  def($sections, "body_content", "");

$global_template_id = DB::fetchVal("SELECT template_id FROM template WHERE is_global");
if ($global_template_id) {
    $template_data = DB::fetchRow("SELECT * FROM template WHERE template_id = $global_template_id");
    $v_dom_json = $template_data["v_dom_json"];
    $v_dom = json_decode($v_dom_json, true);

    $rendered_v_dom = traverseVDom($v_dom, [
        "hooks" => [
            "page_content" => $body_content
        ]
    ]);

    $template_release = $template_data["version"];

    $content_html = $rendered_v_dom["content_html"];
} else {
    $content_html = $body_content;
}

?>

<?php startSection("head_content"); ?>

<link href="/<?= BUILDS_PATH . "templates/css/template_$global_template_id.css?v=$template_release" ?>" rel="stylesheet">

<?php startSection("body"); ?>

<div class="main_wrapper global_root">
    <?= $content_html ?>
</div>

<script src="/<?= BUILDS_PATH . "templates/js/template_$global_template_id.js?v=$template_release" ?>"></script>

<?php include "bundles/global/templates/blank.php"; ?>