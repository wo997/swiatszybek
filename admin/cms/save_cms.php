<?php //route[admin/save_cms]

$main_page = $_POST["link"] == "";

$isRemove = isset($_POST["remove"]) && !$main_page;
if ($isRemove) {
    query("DELETE FROM cms WHERE cms_id = ?", [$_POST["cms_id"]]);
} else {
    if ($_POST["cms_id"] == -1) {
        query("INSERT INTO cms () VALUES ()");
        $_POST["cms_id"] = getLastInsertedId();
    }

    $published = (isset($_POST["published"]) || $main_page) ? 1 : 0;

    sendEmail("wojtekwo997@gmail.com", json_encode(["UPDATE cms SET title = ?, seo_title = ?, seo_description = ?, content = ?, link = ?, metadata = ?, published = ? WHERE cms_id = " . intval($_POST["cms_id"]), [
        $_POST["title"], $_POST["seo_title"], $_POST["seo_description"], $_POST["content"], getLink($_POST["link"]), $_POST["metadata"], $published
    ]]), "xxxx");
    query("UPDATE cms SET title = ?, seo_title = ?, seo_description = ?, content = ?, link = ?, metadata = ?, published = ? WHERE cms_id = " . intval($_POST["cms_id"]), [
        $_POST["title"], $_POST["seo_title"], $_POST["seo_description"], $_POST["content"], getLink($_POST["link"]), $_POST["metadata"], $published
    ]);

    $cms_link = "/admin/cms/" . $_POST["cms_id"];
}

triggerEvent("sitemap_change");

if (isset($cms_link)) {
    die(json_encode(["cms_link" => $cms_link]));
}
