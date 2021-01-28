<?php

if (isset($preview_params) && isset($preview_params["content"])) {
    $page_data["content"] = $preview_params["content"];
}

$page_content = getCMSPageHTML($page_data["content"]);

$page_width = "1500px";

?>

<?php startSection("head_content"); ?>
<?php
include "global/includes_for_cms_page.php";
?>

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
        /*.page_wrapper {
            padding: 0 20px;
        }

        .page_wrapper>.cms>.desktop-full-width {
            margin-left: -20px !important;
            margin-right: -20px !important;
            width: calc(100% + 40px);
        }*/
    }

    @media only screen and (max-width: 800px) {
        .page_wrapper {
            padding: 0;
        }
    }
</style>
</head>

<?php startSection("body_content"); ?>

<div class="page_wrapper">
    <div data-cms-src="content" style="padding:<?= $page_padding ?> 0;margin:0 auto;box-sizing:border-box;width: 100%;flex-grow: 1;" class="cms">
        <?php
        // abandoned kinda
        if (isset($_POST["message"])) {
            echo "<div style='margin:30px auto'>" . $_POST["message"] . "</div>";
        }
        ?>

        <?= $page_content ?>
    </div>
</div>



<?php if (User::getCurrent()->priveleges["backend_access"] && !isset($preview_params)) : ?>
    <div class="right_side_menu freeze_before_load">
        <button class="toggle-sidemenu-btn btn primary" onclick="toggleRightSideMenu()">
            <i class="fas fa-chevron-right"></i>
            <i class="fas fa-cog"></i>
        </button>
        <div class="label first" style="font-size:1.2em;margin-top: 2px;text-align:center">Edycja</div>

        <?php if ($page_data["published"] === 1) {
            $clr = "var(--success-clr)";
            $info_label = "<i class='fas fa-eye'></i> Widoczna";
            $btn_label = 'Ukryj';
            $btn_class = 'secondary';
        } else {
            $clr = "var(--error-clr)";
            $info_label = "<i class='fas fa-eye-slash'></i> Ukryta!";
            $btn_label = 'Upublicznij';
            $btn_class = 'primary';
        }
        ?>

        <div style="color:<?= $clr ?>;margin:10px 0 5px;font-weight:600;text-align:center">
            <?= $info_label ?>
        </div>
        <button class="btn <?= $btn_class ?> fill" onclick="togglePagePublish()"><?= $btn_label ?></button>

        <div style="height:10px"></div>

        <div>
            <a href="<?= Request::$static_urls["ADMIN"] ?>strona/<?= $page_data["cms_id"] ?>" class="btn primary fill">Więcej <i class="fas fa-cog"></i></a>
        </div>
    </div>

    <script>
        function togglePagePublish() {
            xhr({
                url: STATIC_URLS["ADMIN"] + "set_publish",
                params: {
                    table: "cms",
                    primary: "cms_id",
                    primary_id: <?= $page_data["cms_id"] ?>,
                    published: <?= 1  - $page_data["published"] ?>,
                },
                success: () => {
                    window.location.reload();
                },
            });
        }

        <?php if ($page_data["published"] == 0) : ?>
            domload(() => {
                toggleRightSideMenu();
            })
        <?php endif ?>
    </script>
<?php endif ?>

<?php include "user/page_template.php"; ?>