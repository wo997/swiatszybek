<?php //route[{ADMIN}test2]

class A
{
    function b()
    {
        /** @var {number} */
        $var = 5;

        $var = 6;

        Request::jsonResponse(paginateData([
            "select" => "cms_id, link, title, seo_title, seo_description, published",
            "from" => "cms c",
            "order" => "c.cms_id DESC",
            "quick_search_fields" => ["c.link", "c.title", "c.seo_description", "c.seo_title"],
            "where" => ""
        ]));
    }
}
