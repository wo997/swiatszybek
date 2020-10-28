<?php //event[theme_change]

use MatthiasMullie\Minify;

$colors_css = "/* css[global] */";

$colors_css .= ":root {";
foreach (getSetting("theme", "general", ["colors"]) as $color_name => $color_value) {
    $colors_css .= "--$color_name: $color_value;";
}
$colors_css .= "}";

//$minifier = new Minify\JS($colors_css);
//$minifier->minify(BUILDS_PATH . "theme.css");

// it's a weird place, we want it to be built but it's kinda built already
saveFile("prebuilds/theme.css", $colors_css);

triggerEvent("assets_change");
