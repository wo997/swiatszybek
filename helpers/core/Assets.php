<?php

use MatthiasMullie\Minify;
use ScssPhp\ScssPhp\Compiler;

class Assets
{
    public static function minifyCss($css_full)
    {
        // that's sad
        preg_match_all("/grid-area:.*?[};]/", $css_full, $matches);
        if ($matches) {
            foreach ($matches as $match) {
                $new = str_replace([':', ';'], [':"', '";'], $match);
                $css_full = str_replace($match, $new, $css_full);
            }
        }

        //@import "/bundles/global/src/css/traits/password.scss";
        if (preg_match_all('/(?<=\@import ").*?(?=";)/', $css_full, $matches)) {
            foreach ($matches[0] as $file_to_include) {
                if (file_exists(".$file_to_include")) {
                    $css_full = str_replace("@import \"$file_to_include\";", file_get_contents(".$file_to_include"), $css_full);
                } else {
                    $css_full = str_replace("@import \"$file_to_include\";", "", $css_full);
                }
            }
        }

        $css_full = (new Compiler())->compile($css_full);
        $css_full = (new Minify\CSS($css_full))->minify();

        preg_match_all("/grid-area:.*?[};]/", $css_full, $matches);
        if ($matches) {
            foreach ($matches as $match) {
                $new = str_replace('"', '', $match);
                $css_full = str_replace($match, $new, $css_full);
            }
        }

        return $css_full;
    }

    public static function minifyJs($js_full)
    {
        $js_full = (new Minify\JS($js_full))->minify();

        // fake lit-html lol
        $js_full = str_replace('html`', '`', $js_full);

        // allows reactive data 
        $js_full = str_replace('{${', '{{', $js_full);

        // reactive classes
        if (preg_match_all('/\{\$\{.*?\}\?.*?\}/s', $js_full, $matches)) {
            foreach ($matches[0] as $match) {
                $rep = strReplaceFirst('$', '', $match);
                $rep = htmlspecialchars($rep);
                $js_full = str_replace($match, $rep, $js_full);
            }
        }

        // reactive attributes - just escaping
        if (preg_match_all('/(?<=["\'])\{\{.*?\}\}(?=["\'])/s', $js_full, $matches)) {
            foreach ($matches[0] as $match) {
                if (strpos($match, "&quot;") !== false) {
                    continue;
                }
                $rep = htmlspecialchars($match);
                $js_full = str_replace($match, $rep, $js_full);
            }
        }

        // binding
        if (preg_match_all('/data-bind="\{\{.*?data\..*?\}\}"/s', $js_full, $matches)) {
            foreach ($matches[0] as $match) {
                $rep = $match;
                $rep = preg_replace("/(?<=[\s{])data\./s", "", $rep);
                $rep = preg_replace("/\s/", "", $rep);
                $rep = str_replace(["{{", "}}"], "", $rep);
                $js_full = str_replace($match, $rep, $js_full);
            }
        }

        // nodes
        if (preg_match_all('/data-node="\{\{.*?comp\._nodes\..*?\}\}"/s', $js_full, $matches)) {
            foreach ($matches[0] as $match) {
                $rep = $match;
                $rep = preg_replace("/(?<=[\s{])comp\._nodes\./s", "", $rep);
                $rep = preg_replace("/\s/", "", $rep);
                $rep = str_replace(["{{", "}}"], "", $rep);
                $js_full = str_replace($match, $rep, $js_full);
            }
        }

        // fuck everything, even html strings etc, everything will become a single line lol, that's not clever
        // BUT!!! you can give the developer an option to mark elements that might require whitespaces, ezy
        $js_full = preg_replace('/\s{2,}/', ' ', $js_full);

        //var_dump($js_full, "<br><br><br><br><br><br><br><br><br><br><br>");
        return $js_full;
    }

    // public static function build()
    // {
    //     $css_file_groups = [];
    //     $js_file_groups = [];

    //     Files::scanDirectories(
    //         [
    //             "exclude_paths" => ["vendor", "uploads", "builds"],
    //         ],
    //         function ($path, $first_line, $parent_dir) use (&$css_file_groups, &$js_file_groups) {
    //             if (strpos($path, ".css") !== false || strpos($path, ".scss") !== false) {
    //                 if ($css_group = Files::getAnnotation("css", $first_line, $parent_dir)) {
    //                     self::appendGroup($css_file_groups, $css_group, $path, $parent_dir);
    //                 }
    //             } else if (strpos($path, ".js") !== false) {
    //                 if ($js_group = Files::getAnnotation("js", $first_line, $parent_dir)) {
    //                     self::appendGroup($js_file_groups, $js_group, $path, $parent_dir);
    //                 }
    //             }
    //         }
    //     );

    //     // CSS
    //     foreach ($css_file_groups as $cssGroup => $files) {
    //         $css_full = "";
    //         foreach ($files as $file) {
    //             $css_full .= " " . file_get_contents($file);
    //         }
    //         $css_full = self::minifyCss($css_full);
    //         Files::save(BUILDS_PATH . "$cssGroup.css", $css_full);
    //     }

    //     // JS
    //     foreach ($js_file_groups as $jsGroup => $files) {
    //         $js_full = "";
    //         foreach ($files as $file) {
    //             $js_full .= " " . file_get_contents($file);
    //         }
    //         $js_full = self::minifyJs($js_full);
    //         Files::save(BUILDS_PATH . "$jsGroup.js", $js_full);
    //     }

    //     // CSS
    //     $out = "<?php return [\n";
    //     $out .= "\"files_groups\" => [\n";
    //     foreach ($css_file_groups as $group => $file_path) {
    //         $out .= " \"$group\" => [\n  \"" . implode("\",\n  \"", $file_path) . "\"\n ],\n";
    //     }
    //     $out .= "],\n";
    //     $out .= "];";

    //     Files::save(BUILDS_PATH . "css_schema.php", $out);

    //     // JS
    //     $out = "<?php return [\n";
    //     $out .= "\"files_groups\" => [\n";
    //     foreach ($js_file_groups as $group => $file_path) {
    //         $out .= " \"$group\" => [\n  \"" . implode("\",\n  \"", $file_path) . "\"\n ],\n";
    //     }
    //     $out .= "],\n";
    //     $out .= "];";

    //     Files::save(BUILDS_PATH . "js_schema.php", $out);
    // }
}
