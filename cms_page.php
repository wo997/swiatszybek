<?php

    $page_content = getCMSPageHTML($page_data["content"]);

    if (isset($page_data["metadata"])) {
        $page_metadata_json = json_decode($page_data["metadata"],true);

        include "helpers/set_page_metadata_defaults.php";

        function setProp(&$var, $name) {
            global $page_metadata_json;
            if (isset($page_metadata_json[$name])) {
                $var = $page_metadata_json[$name];
            }
        }
        if ($page_metadata_json) {
            setProp($page_width,"page_width");
            setProp($page_padding,"page_padding");
        }
    }
?>
<!DOCTYPE html>
<html lang="pl">

<head>
    <?php include "includes.php";include "include/includes_for_cms_page.php"; ?>
    <style>
    <?php 
        if (strpos($page_width,"px") !== false) {
            $half_width_val = intval($page_width) / 2;
            echo "
                .col-lg-13 {
                    width: 100%;
                }
                @media only screen and (min-width: $page_width) {
                    .col-lg-13 {
                        width: 100vw;
                        margin-left: calc({$half_width_val}px - 50vw);
                        margin-right: calc({$half_width_val}px - 50vw);
                    }
                }
                .desktop-full-width {
                    width: 100vw;
                    margin-left: calc({$half_width_val}px - 50vw);
                    margin-right: calc({$half_width_val}px - 50vw);
                }
                ";
        }
    ?>

    .col-lg-0 {display: none;}
    .col-lg-1 {width: 8.3333%;}
    .col-lg-2 {width: 16.6666%;}
    .col-lg-3 {width: 25%;}
    .col-lg-4 {width: 33.3333%;}
    .col-lg-5 {width: 41.6666%;}
    .col-lg-6 {width: 50%;}
    .col-lg-7 {width: 58.3333%;}
    .col-lg-8 {width: 66.6666%;}
    .col-lg-9 {width: 75%;}
    .col-lg-10 {width: 83.3333%;}
    .col-lg-11 {width: 91.6666%;}
    .col-lg-12 {width: 100%;}
    @media only screen and (max-width: 800px) {
    .col-sm-0 {display: none;}
    .col-sm-1 {width: 8.3333%;}
    .col-sm-2 {width: 16.6666%;}
    .col-sm-3 {width: 25%;}
    .col-sm-4 {width: 33.3333%;}
    .col-sm-5 {width: 41.6666%;}
    .col-sm-6 {width: 50%;}
    .col-sm-7 {width: 58.3333%;}
    .col-sm-8 {width: 66.6666%;}
    .col-sm-9 {width: 75%;}
    .col-sm-10 {width: 83.3333%;}
    .col-sm-11 {width: 91.6666%;}
    .col-sm-12 {width: 100%;}
    }

    @media only screen and (min-width: 1100px) {
        .page_wrapper {
            padding: 0 20px;
        }
    }
    </style>
</head>

<body>
    <?php include "global/header.php"; ?>

    <div class="page_wrapper">
        <div style="padding:<?=$page_padding?> 0;max-width:<?=$page_width?>;margin:0 auto;box-sizing:border-box;width: 100%;flex-grow: 1;" class="cms">
            <?php
                if (isset($_POST["message"]))
                echo "<div style='margin:30px auto'>".$_POST["message"]."</div>";
                
                if ($url == "") {
                    if (!isset($_SESSION["redirect"]) && isset($_SERVER["HTTP_REFERER"]) && strpos($_SERVER["HTTP_REFERER"],"/login") === false && strpos($_SERVER["HTTP_REFERER"],"/logowanie") === false)
                    $_SESSION["redirect"] = $_SERVER["HTTP_REFERER"];//"/moje-konto/zamowienia";
                }  
            ?>

            <?= $page_content ?>
        </div>
    </div>

    <?php include "global/footer.php"; ?>
</body>

</html>