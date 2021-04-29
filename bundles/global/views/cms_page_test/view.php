<?php //route[/cms_page_test]

$page_id = intval(Request::urlParam(1, -1));

$page_data = DB::fetchRow("SELECT * FROM page WHERE page_id = ?", [$page_id]);

$page_release = $page_data["version"];

$v_dom_json = $page_data["v_dom_json"];
$v_dom = json_decode($v_dom_json, true);

$dom_data = traverseVDom($v_dom);

?>

<?php startSection("head_content"); ?>

<title>Strony test</title>

<link href="/<?= BUILDS_PATH . "/pages/css/page_$page_id.css?v=$page_release" ?>" rel="stylesheet">

<?php startSection("body_content"); ?>

<div>
    <?= $dom_data["content_html"] ?>
</div>

<script src="/<?= BUILDS_PATH . "/pages/js/page_$page_id.js?v=$page_release" ?>"></script>

<?php include "bundles/global/templates/default.php"; ?>