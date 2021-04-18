<?php

class Theme
{
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


    public function saveThemeSettings($post)
    {
        $colors_palette_json = def($post, "colors_palette", "");
        if ($colors_palette_json) {
            $colors_palette = json_decode($colors_palette_json, true);
            saveSetting("theme", "general", ["path" => ["colors_palette"], "value" => $colors_palette], false);
        } else {
            $colors_palette = getSetting(["theme", "general", "colors_palette"]);
        }

        $colors_css = "/* css[global] */";

        // .global_root {
        //     --primary_clr: #35c;
        //     --buynow_clr: #f50000;
        //     --subtle_font_clr: #333333;
        //     --subtle_bckg_clr: #fbfbfb;
        // }

        $colors_css .= ".global_root {";
        foreach ($colors_palette as $color) {
            $color_name = $color["name"];
            $color_value = $color["value"];
            $colors_css .= "--$color_name: $color_value;";
        }
        $colors_css .= "}";

        Files::save(PREBUILDS_PATH . "theme.css", $colors_css);

        triggerEvent("assets_change");
    }
}
