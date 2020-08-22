<?php

if (isset($_POST["preview_params"])) {
    $preview_params = json_decode($_POST["preview_params"], true);

    $page_data["content"] = $preview_params["content"];
    $page_data["metadata"] = $preview_params["metadata"];
}

$page_content = getCMSPageHTML($page_data["content"]);

if (isset($page_data["metadata"])) {
    $page_metadata_json = json_decode($page_data["metadata"], true);

    include "helpers/set_page_metadata_defaults.php";

    function setProp(&$var, $name)
    {
        global $page_metadata_json;
        if (isset($page_metadata_json[$name])) {
            $var = $page_metadata_json[$name];
        }
    }
    if ($page_metadata_json) {
        setProp($page_width, "page_width");
        setProp($page_padding, "page_padding");
    }
}
?>
<!DOCTYPE html>
<html lang="pl">

<head>
    <?php include "global/includes.php";
    include "global/includes_for_cms_page.php"; ?>
    <style>
        <?php
        if (strpos($page_width, "px") !== false) {
            $half_width_val = intval($page_width) / 2;
            echo "
                .page_wrapper > .cms > .cms-container:not(.desktop-full-width) {
                    max-width: $page_width;
                }
            ";
        }

        ?>@media only screen and (max-width: 800px) {
            .col-sm-0 {
                display: none;
            }
        }

        @media only screen and (max-width: <?= intval($page_width) + 40 ?>px) {
            .page_wrapper {
                padding: 0 20px;
            }

            .page_wrapper>.cms>.desktop-full-width {
                margin-left: -20px !important;
                margin-right: -20px !important;
                width: calc(100% + 40px);
            }
        }

        @media only screen and (max-width: 800px) {
            .page_wrapper {
                padding: 0;
            }
        }
    </style>
</head>

<body>
    <?php include "global/header.php"; ?>

    <div class="page_wrapper">
        <div style="padding:<?= $page_padding ?> 0;margin:0 auto;box-sizing:border-box;width: 100%;flex-grow: 1;" class="cms">
            <?php
            if (isset($_POST["message"]))
                echo "<div style='margin:30px auto'>" . $_POST["message"] . "</div>";

            if ($url == "") {
                if (!isset($_SESSION["redirect"]) && isset($_SERVER["HTTP_REFERER"]) && strpos($_SERVER["HTTP_REFERER"], "/login") === false && strpos($_SERVER["HTTP_REFERER"], "/logowanie") === false)
                    $_SESSION["redirect"] = $_SERVER["HTTP_REFERER"]; //"/moje-konto/zamowienia";
            }
            ?>

            <?= $page_content ?>
        </div>
    </div>

    <?php include "global/footer.php"; ?>
</body>

</html>