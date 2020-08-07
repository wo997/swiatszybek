<?php //route[admin/save_cms]

$main_page = $_POST["link"] == "";

$isDelete = isset($_POST["delete"]) && !$main_page;
if ($isDelete) {
    query("DELETE FROM cms WHERE cms_id = ?", [$_POST["cms_id"]]);
} else {
    if ($_POST["cms_id"] == -1) {
        query("INSERT INTO cms () VALUES ()");
        $_POST["cms_id"] = getLastInsertedId();
    }

    $published = (isset($_POST["published"]) || $main_page) ? 1 : 0;

    query("UPDATE cms SET title = ?, seo_title = ?, seo_description = ?, content = ?, link = ?, metadata = ?, published = ? WHERE cms_id = " . intval($_POST["cms_id"]), [
        $_POST["title"], $_POST["seo_title"], $_POST["seo_description"], $_POST["content"], getLink($_POST["link"]), $_POST["metadata"], $published
    ]);
}

include "sitemap-create.php";

if ($isDelete) {
    $return_url = "/admin/strony";
} else {
    $return_url = "/admin/cms/" . $_POST["cms_id"];
}

header("Location: " . $return_url);
die;
