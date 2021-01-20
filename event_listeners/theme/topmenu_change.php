<?php //event[topmenu_change]

function showMenu($category_id, $depth = 0)
{
    $html = "";

    $category_id = intval($category_id);
    $menu = DB::fetchArr("SELECT url, category_id, m.title as title,
        cms.title as cms_title, cms.link as cms_url,
        p.product_id as product_id, p.title as product_title
        FROM menu m
        LEFT JOIN cms USING (cms_id)
        LEFT JOIN products p ON m.product_id = p.product_id
        WHERE parent_id = $category_id AND m.published
        ORDER BY m.kolejnosc");

    if ($depth == 0) {
        foreach ($menu as $submenu) {

            $html .= "
                <div data-depth='$depth'>
                    <a href='" . getMenuLink($submenu)["url"] . "'>
                        <h3 class='headerplain'>" . $submenu["title"] . "</h3>
                    </a>
                    <div class='float-category'>" . showMenu($submenu["category_id"], $depth + 1) . "</div>
                </div>
            ";
            /*$html .= "
                <div data-depth='$depth'>
                    <a href='" . getMenuLink($submenu)["url"] . "'>
                        <h3 class='headerplain'>" . $submenu["title"] . "</h3>
                    </a>
                </div>
            ";*/
        }
    } else {
        foreach ($menu as $submenu) {
            if ($depth === 1) {
                $title = "<h4 class='headerplain'>" . $submenu["title"] . "</h4>";
            } else {
                $title = "<h5 class='headerplain'>" . $submenu["title"] . "</h5>";
            }
            $html .= "
                <div data-depth='$depth'>
                    <a href='" . getMenuLink($submenu)["url"] . "'>
                        $title
                    </a>
                    <div>" . showMenu($submenu["category_id"], $depth + 1) . "</div>
                </div>
            ";
        }
    }

    return $html;
}

saveFile(BUILDS_PATH . "topmenu.html", showMenu(0)); // resursive
