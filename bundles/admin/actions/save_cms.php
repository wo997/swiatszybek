<?php //route[/{ADMIN}save_cms]

$main_page = $_POST["link"] == "" && false;

$isRemove = isset($_POST["remove"]) && !$main_page;
if ($isRemove) {
    removeEntity("cms", "cms_id", $_POST["cms_id"]);
    Request::redirect(Request::$static_urls["ADMIN"] . "strony");
} else {
    $cms_id = getEntityId("cms", $_POST["cms_id"]);

    $data = filterArrayKeys($_POST, [
        "title",
        "seo_title",
        "seo_description",
        "content",
    ]);

    $data["link"] = escapeUrl($_POST["link"]);
    $data["published"] = (isset($_POST["published"]) || $main_page) ? 1 : 0;

    updateEntity($data, "cms", "cms_id", $cms_id);

    Request::redirect(Request::$static_urls["ADMIN"] . "strona/" . $cms_id);
}

triggerEvent("sitemap_change");

Request::reload();
