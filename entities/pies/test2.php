<?php //route[{ADMIN}search_strony]

class A
{
    function a()
    {
        echo paginateData([
            "select" => "cms_id, link, title, seo_title, seo_description, published",
            "from" => "cms c",
            "order" => "c.cms_id DESC",
            "main_search_fields" => ["c.link", "c.title", "c.seo_description", "c.seo_title"],
        ]);
    }
}
