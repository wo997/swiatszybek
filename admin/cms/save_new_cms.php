<?php //route[{ADMIN}save_new_cms]

$page_id = getEntityId("page", $_POST["page_id"]);

// form scopes would have been so much better in that case :)
$data = filterArrayKeys($_POST, [
    "title",
    "seo_title",
    "seo_description",
    "content",
]);

$data["link"] = escapeUrl($_POST["link"]);

updateEntity($data, "cms", "page_id", $page_id);

redirect(STATIC_URLS["ADMIN"] . "strona/" . $page_id);

triggerEvent("sitemap_change");

reload();
