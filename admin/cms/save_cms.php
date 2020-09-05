<?php //route[admin/save_cms]

$main_page = $_POST["link"] == "";

$isRemove = isset($_POST["remove"]) && !$main_page;
if ($isRemove) {
    removeEntity("cms", "cms_id", $_POST["cms_id"]);
    $cms_link = "/admin/strony";
} else {
    $cms_id = getEntityId("cms", $_POST["cms_id"]);

    $data = [
        "title" => $_POST["title"],
        "seo_title" => $_POST["seo_title"],
        "seo_description" => $_POST["seo_description"],
        "content" => $_POST["content"],
        "link" => getLink($_POST["link"]),
        "metadata" => $_POST["metadata"],
        "published" => (isset($_POST["published"]) || $main_page) ? 1 : 0,
    ];

    updateEntity($data, "cms", "cms_id", $cms_id);

    // TODO: use cms_link to reload cms page
    $cms_link = "/admin/strona/" . $cms_id;
}

triggerEvent("sitemap_change");

if (isset($cms_link)) {
    json_response(["cms_link" => $cms_link]);
}
