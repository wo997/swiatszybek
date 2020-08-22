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
  global $JS_files, $CSS_files, $app;

  include "packages/simple_html_dom.php";

  $html = str_get_html($content);

  $page_content = "";

  if ($html) {

    $links = $html->find("[data-href]");
    foreach ($links as $link) {
      $link->outertext = "<a href=" . $link->attr["data-href"] . ">" . $link->outertext . "</a>";
    }

    if (strpos($_SERVER['HTTP_ACCEPT'], 'image/webp') !== false) {
      $images = $html->find("img");
      foreach ($images as $img) {
        $img->src = str_replace(".jpg", ".webp", $img->src);
      }
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

      $container_html .= '><div class="cms-container-content"';

      $container_content = $container->find(".cms-container-content")[0];

      foreach ($container_content->attr as $key => $val) {
        $container_html .= " $key='$val'";
      }

      $container_html .= '>';

      $blocks = $container_content->find(".cms-block");

      foreach ($blocks as $block) {
        if (isset($block->attr["data-module"]) && $block->attr["data-module"] != "custom-html") {
          $module = $block->attr["data-module"];
          $block_html = "<div";
          foreach ($block->attr as $key => $val) {
            $block_html .= " $key=\"$val\"";
          }
          $block_html .= ">";

          $moduleParams = isset($block->attr["data-module-params"]) ? json_decode(html_entity_decode($block->attr["data-module-params"]), true) : null;
          $moduleDir = "modules/$module";
          $moduleContentFile = "$moduleDir/content.php";

          if (file_exists($moduleContentFile)) {
            $module_content = "";
            include $moduleContentFile;

            $block_html .= "<div class='cms-block-content'>$module_content</div>";
            $block_html .= "</div>";

            $container_html .= $block_html;
          }
        } else $container_html .= $block->outertext;
      }

      $container_html .= "</div></div>";
    }

    $page_content .= $container_html;
  }

  foreach ($CSS_files as $file) {
    $page_content = "<link rel='stylesheet' href='$file?v=" . RELEASE . "'>" . $page_content;
  }
  foreach ($JS_files as $file) {
    $page_content = "<script src='$file?v=" . RELEASE . "'></script>" . $page_content;
  }
  return $page_content;
}
