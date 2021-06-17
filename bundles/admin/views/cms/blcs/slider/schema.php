<?php //hook[register]

PiepCMSManager::registerModule([
    "name" => "slider",
    "render" => function ($params) {
        $children = def($params, ["v_node", "children"]);
        $slides_html = "";
        if ($children) {
            $slides_data = traverseVDom($children, ["html_only" => true]);
            $slides_html = $slides_data["content_html"];
        }
        ob_start();
?>
    <div class="wo997_slider" data-pagination="bullets">
        <div class="wo997_slides_container">
            <div class="wo997_slides_wrapper"><?= $slides_html ?></div>
        </div>
    </div>
<?php
        return ob_get_clean();
    },
]);
