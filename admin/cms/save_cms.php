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
    var_dump($_POST);

    query("UPDATE cms SET title = ?, meta_description = ?, content = ?, link = ?, metadata = ?, published = ? WHERE cms_id = " . intval($_POST["cms_id"]), [
        $_POST["title"], $_POST["meta_description"], $_POST["content"], getLink($_POST["link"]), $_POST["metadata"], $published
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
