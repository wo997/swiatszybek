<?php

// define WebP support also for XHR requests
define("WEBP_SUPPORT", isset($_SESSION["HAS_WEBP_SUPPORT"]) || strpos($_SERVER['HTTP_ACCEPT'], 'image/webp') !== false ? 1 : 0);
if (WEBP_SUPPORT) {
    $_SESSION["HAS_WEBP_SUPPORT"] = true;
}


// logo
define("LOGO_PATH_LOCAL", "/" . getSetting(["theme", "copied_images", "logo", "path"], ""));
define("LOGO_PATH_LOCAL_SM", Files::getResponsiveImageBySize(LOGO_PATH_LOCAL, Files::$image_fixed_dimensions["sm"], ["same-ext" => true]));
$logo_file_path = Files::getResponsiveImageBySize(LOGO_PATH_LOCAL, Files::$image_fixed_dimensions["sm"], ["same-ext" => true]);
$logo_file_path .= "?v=" . getSetting(["theme", "copied_images", "logo", "version"], "");
define("LOGO_PATH_PUBLIC_SM", SITE_URL . $logo_file_path);

// favicon
define("FAVICON_PATH_LOCAL", "/" . getSetting(["theme", "copied_images", "favicon", "path"], ""));
$favicon_file_path = Files::getResponsiveImageBySize(FAVICON_PATH_LOCAL, Files::$image_fixed_dimensions["tn"], ["same-ext" => true]);
$favicon_file_path .= "?v=" . getSetting(["theme", "copied_images", "favicon", "version"], "");
define("FAVICON_PATH_LOCAL_TN", $favicon_file_path);
define("FAVICON_PATH_PUBLIC_TN", SITE_URL . $favicon_file_path);

// share_img
define("SHARE_IMG_PATH_LOCAL", "/" . getSetting(["theme", "copied_images", "share_img", "path"], ""));
$share_img_file_path = Files::getResponsiveImageBySize(SHARE_IMG_PATH_LOCAL, Files::$image_fixed_dimensions["sm"], ["same-ext" => true]);
$share_img_file_path .= "?v=" . getSetting(["theme", "copied_images", "share_img", "version"], "");
define("SHARE_IMG_PATH_LOCAL_SM", $share_img_file_path);
define("SHARE_IMG_PATH_PUBLIC_SM", SITE_URL . $share_img_file_path);
