<?php
$JS_files = [];
$CSS_files = [];
function useJS($file)
{
    global $JS_files;
    if (!in_array($file, $JS_files)) {
        $JS_files[] = $file;
    }
}
function useCSS($file)
{
    global $CSS_files;
    if (!in_array($file, $CSS_files)) {
        $CSS_files[] = $file;
    }
}
function getCMSPageHTML($content)
{
    global $JS_files, $CSS_files, $app, $link_module_block_php_path;

    $html = str_get_html($content);

    $page_content = "";

    if ($html) {
        $images = $html->find("img");
        foreach ($images as $img) {
            // TODO: new cms should not set it like that, we will have data-src all the time, we just gotta clear the actual src and maybe drop a class indicating the image is loaded
            $img->setAttribute("data-src", $img->src);
            $img->removeAttribute("src");
        }

        $links = $html->find("[data-href]");
        foreach ($links as $link) {
            $href = $link->attr["data-href"];
            $link->removeAttribute("src");
            $link->outertext = "<a href=" . $href  . ">" . $link->outertext . "</a>";
        }

        $ytvideos = $html->find("img.ql-video");
        foreach ($ytvideos as $ytvideo) {
            $img = $ytvideo->attr["src"];
            preg_match('/https:\/\/img.youtube.com\/vi\/.*\/hqdefault.jpg/', $img, $out);
            foreach ($out as $url) {
                $id = str_replace(["https://img.youtube.com/vi/", "/hqdefault.jpg"], "", $url);
                $style = isset($ytvideo->attr["style"]) ? $ytvideo->attr["style"] : "";
                $ytvideo->outertext = '<iframe style="' . $style . '" class="ql-video" src="https://www.youtube.com/embed/' . $id . '" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>';
                break;
            }
        }

        $container_html = "";
        $containers = $html->find(".cms-container");
        foreach ($containers as $container) {

            $container_html .= "<div";
            foreach ($container->attr as $key => $val) {
                $container_html .= " $key='$val'";
            }
            $container_html .= '>';

            $container_content = null;
            $container_image = null;
            $container_color = null;
            foreach ($container->children() as $child) {
                if (strpos($child->class, "cms-container-content") !== false) {
                    $container_content = $child;
                } else if (strpos($child->class, "background-image") !== false) {
                    $container_image = $child;
                } else if (strpos($child->class, "background-color") !== false) {
                    $container_color = $child;
                }
            }


            if ($container_image) {
                $container_html .= $container_image->outertext;
            }
            if ($container_color) {
                $container_html .= $container_color->outertext;
            }

            $container_html .= '<div class="cms-container-content"';
            foreach ($container_content->attr as $key => $val) {
                $container_html .= " $key='$val'";
            }
            $container_html .= '>';

            $blocks = $container_content->find(".cms-block");

            foreach ($blocks as $block) {
                if (
                    isset($block->attr["data-module-block"])
                    && isset($link_module_block_php_path[$block->attr["data-module-block"]])
                    && $block->attr["data-module-block"] != "custom-html"
                ) {
                    $block_html = "<div";
                    foreach ($block->attr as $key => $val) {
                        if ($key == "data-module-block-params") {
                            continue;
                        }
                        $block_html .= " $key=\"$val\"";
                    }
                    $block_html .= ">";

                    $params = isset($block->attr["data-module-block-params"]) ? json_decode(html_entity_decode($block->attr["data-module-block-params"]), true) : [];
                    $module_block_html = getModuleBlockData($block->attr["data-module-block"], $params)["content"];
                    $block_html .= "<div class='cms-block-content'>$module_block_html</div>";
                    $block_html .= "</div>";

                    $container_html .= $block_html;
                } else {
                    $container_html .= $block->outertext;
                }
            }

            $container_html .= "</div></div>";
        }

        $page_content .= $container_html;
    }
    return $page_content;
}

function getModuleBlockData($module_block_name, $params)
{
    global $app, $link_module_block_php_path;

    ob_start();
    $module_block_path = $link_module_block_php_path[$module_block_name];
    $module_block_dir = pathinfo($module_block_path)['dirname'];
    $data = include $module_block_path;
    return [
        "content" => ob_get_clean(),
        "data" => $data
    ];
}

function prepareModuleBlock($module_block_file, $module_block_name)
{
    $module_block_file = str_replace("MODULE_BLOCK_NAME", $module_block_name, $module_block_file);
    $module_block_file = str_replace("MODULE_BLOCK", "app_module_blocks.$module_block_name", $module_block_file);
    return " " . $module_block_file;
}
