<?php //route[admin/save_cms]

$main_page = $_POST["link"] == "";

$isRemove = isset($_POST["remove"]) && !$main_page;
if ($isRemove) {
    removeEntity("cms", "cms_id", $_POST["cms_id"]);
    redirect("/admin/strony");
} else {
    $cms_id = getEntityId("cms", $_POST["cms_id"]);

    $data = [
        "title" => $_POST["title"],
        "seo_title" => $_POST["seo_title"],
        "seo_description" => $_POST["seo_description"],
        "content" => $_POST["content"],
        "link" => getLink($_POST["link"]),
        "published" => (isset($_POST["published"]) || $main_page) ? 1 : 0,
    ];

    updateEntity($data, "cms", "cms_id", $cms_id);

    redirect("/admin/strona/" . $cms_id);
}

triggerEvent("sitemap_change");

reload();
