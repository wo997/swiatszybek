<?php

class Theme
{
    public static $fonts = [
        "Open Sans" => [
            "weights" => ["normal" => 400, "semi_bold" => 600, "bold" => 700],
            "use" => "'Open Sans', sans-serif",
            "link" => 'https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;600;700&display=swap'
        ],
        "Montserrat" => [
            "weights" => ["normal" => 400, "semi_bold" => 600, "bold" => 700],
            "use" => "'Montserrat', sans-serif",
            "link" => 'https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;800&display=swap'
        ],
        "Lato" => [
            "weights" => ["normal" => 400, "semi_bold" => 700, "bold" => 900],
            "use" => "'Lato', sans-serif",
            "link" => 'https://fonts.googleapis.com/css2?family=Lato:wght@400;700;900&display=swap'
        ],
        "Poppins" => [
            "weights" => ["normal" => 400, "semi_bold" => 600, "bold" => 700],
            "use" => "'Poppins', sans-serif",
            "link" => 'https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap'
        ],
        "Archivo" => [
            "weights" => ["normal" => 400, "semi_bold" => 600, "bold" => 700],
            "use" => "'Archivo', sans-serif",
            "link" => 'https://fonts.googleapis.com/css2?family=Archivo:wght@400;600;700&display=swap'
        ],
        "Inter" => [
            "weights" => ["normal" => 400, "semi_bold" => 600, "bold" => 700],
            "use" => "'Inter', sans-serif",
            "link" => 'https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap'
        ],
        "Sarabun" => [
            "weights" => ["normal" => 400, "semi_bold" => 600, "bold" => 700],
            "use" => "'Sarabun', sans-serif",
            "link" => 'https://fonts.googleapis.com/css2?family=Sarabun:wght@400;600;700&display=swap'
        ],
        "Epilogue" => [
            "weights" => ["normal" => 400, "semi_bold" => 600, "bold" => 700],
            "use" => "'Epilogue', sans-serif",
            "link" => 'https://fonts.googleapis.com/css2?family=Epilogue:wght@400;600;700&display=swap'
        ],
        "Signika" => [
            "weights" => ["normal" => 400, "semi_bold" => 600, "bold" => 700],
            "use" => "'Signika', sans-serif",
            "link" => 'https://fonts.googleapis.com/css2?family=Signika:wght@400;600;700&display=swap'
        ],
        "Prompt" => [
            "weights" => ["normal" => 400, "semi_bold" => 600, "bold" => 700],
            "use" => "'Prompt', sans-serif",
            "link" => 'https://fonts.googleapis.com/css2?family=Prompt:wght@400;600;700&display=swap'
        ],
        "Krub" => [
            "weights" => ["normal" => 400, "semi_bold" => 600, "bold" => 700],
            "use" => "'Krub', sans-serif",
            "link" => 'https://fonts.googleapis.com/css2?family=Krub:wght@400;600;700&display=swap'
        ],
        "Niramit" => [
            "weights" => ["normal" => 400, "semi_bold" => 600, "bold" => 700],
            "use" => "'Niramit', sans-serif",
            "link" => 'https://fonts.googleapis.com/css2?family=Niramit:wght@400;600;700&display=swap'
        ],
        "Blinker" => [
            "weights" => ["normal" => 400, "semi_bold" => 600, "bold" => 700],
            "use" => "'Blinker', sans-serif",
            "link" => 'https://fonts.googleapis.com/css2?family=Blinker:wght@400;600;700&display=swap'
        ],
        "Proza Libre" => [
            "weights" => ["normal" => 400, "semi_bold" => 600, "bold" => 700],
            "use" => "'Proza Libre', sans-serif",
            "link" => 'https://fonts.googleapis.com/css2?family=Proza Libre:wght@400;600;700&display=swap'
        ],
        "Fahkwang" => [
            "weights" => ["normal" => 400, "semi_bold" => 600, "bold" => 700],
            "use" => "'Fahkwang', sans-serif",
            "link" => 'https://fonts.googleapis.com/css2?family=Fahkwang:wght@400;600;700&display=swap'
        ],
        "Tomorrow" => [
            "weights" => ["normal" => 400, "semi_bold" => 600, "bold" => 700],
            "use" => "'Tomorrow', sans-serif",
            "link" => 'https://fonts.googleapis.com/css2?family=Tomorrow:wght@400;600;700&display=swap'
        ],
        "Kodchasan" => [
            "weights" => ["normal" => 400, "semi_bold" => 600, "bold" => 700],
            "use" => "'Kodchasan', sans-serif",
            "link" => 'https://fonts.googleapis.com/css2?family=Kodchasan:wght@400;600;700&display=swap'
        ],
    ];

    public static function buildHeader($post)
    {
        if (!isset($post["inner_responsive_width"]) || !isset($post["outer_responsive_width"])) {
            die("error");
        }

        // mobile not less than 600
        $inner_responsive_width_min = max(intval($post["inner_responsive_width"]), 600);
        $outer_responsive_width_min = intval($post["outer_responsive_width"]);
        $inner_responsive_width_max = $inner_responsive_width_min - 1;
        $outer_responsive_width_max = $outer_responsive_width_min - 1;

        // hide some layout elements at 799 for sure and maybe even further
        $case_desktop_width_max = max(799, $inner_responsive_width_max);

        $header_build_css = <<<CSS
/* css[global] */

@media (max-width: {$outer_responsive_width_max}px) and (hover: hover) {
	header.main .main_menu {
		order: 2;
		margin: calc(-1 * var(--header_padding_vertical)) calc(-1 * var(--header_padding_horizontal));
		margin-top: var(--header_padding_vertical);
		min-width: 100%;
		flex-grow: 1;
		border-top: 1px solid #ccc;
	}
}
@media (min-width: {$outer_responsive_width_min}px) {
	header.main .main_menu a {
		border-radius: var(--header-btn-radius);
	}
}

@media (max-width: {$inner_responsive_width_max}px), (hover: none) {
	header.main {
		& {
			justify-content: space-between;
		}

		.main_menu,
		.main_search_wrapper,
		.last_viewed_products_menu_btn,
		.wishlist_menu_btn,
		.headerbtn_menu {
			display: none !important;
		}
	}
}

@media (hover: hover) and (min-width: {$inner_responsive_width_min}px) {
	header.main {
		.mobile_menu_btn,
		.mobile_search_btn {
			display: none !important;
		}
	}
}

@media (max-width: {$case_desktop_width_max}px) {
    .case_desktop {
        display: none !important;
    }
}

CSS;

        Files::save(PREBUILDS_PATH . "header_build.scss", $header_build_css);
    }

    public static function saveSettings($post = [])
    {
        $colors_palette_json = def($post, "colors_palette", "");
        if ($colors_palette_json) {
            $colors_palette = json_decode($colors_palette_json, true);
            saveSetting("theme", "general", ["path" => ["colors_palette"], "value" => $colors_palette], false);
        } else {
            $colors_palette = getSetting(["theme", "general", "colors_palette"]);
        }

        $font_family = def($post, "font_family", "");
        if ($font_family) {
            saveSetting("theme", "general", ["path" => ["font_family"], "value" => $font_family]);
        } else {
            $font_family = getSetting(["theme", "general", "font_family"]);
        }

        $theme_css = "/* css[global] */";

        $theme_css .= ":root, .global_root {";

        foreach ($colors_palette as $color) {
            $color_name = $color["name"];
            $color_value = $color["value"];
            if (strlen($color_value) > 3) {
                $theme_css .= "--$color_name: $color_value;";
            }
        }

        $font = def(self::$fonts, $font_family);
        if ($font) {
            foreach ($font["weights"] as $key => $val) {
                $theme_css .= "--$key: $val;";
            }
            $theme_css .= "--font_family: $font[use];";
        }

        $theme_css .= "}";

        Files::save(PREBUILDS_PATH . "theme.scss", $theme_css);

        file_get_contents(SITE_URL . "/deployment/build_assets"); // a token might be necessary for safety purpose

        $res = [
            "colors_palette" => $colors_palette,
        ];
        $res = array_merge($res, json_decode(file_get_contents(SITE_URL . "/get_assets_release"), true));

        return $res;
    }
}

function preloadColorPalette()
{
    $colors_palette = json_encode(getSetting(["theme", "general", "colors_palette"], "[]"));
    return <<<JS
    colors_palette = $colors_palette;
    loadedColorPalette();
JS;
}
