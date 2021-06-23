<?php //route[{ADMIN}/logo-ikony]

?>

<?php Templates::startSection("head"); ?>

<title>Logo / ikony</title>

<?php Templates::startSection("header"); ?>

<div class="custom_toolbar">
    <span class="title breadcrumbs">
        <div class="crumb">
            Logo / Ikony
        </div>
    </span>
</div>

<?php Templates::startSection("admin_page_body"); ?>

<div class="label mb2 first">
    <span class="medium">Logo sklepu</span>
    <div class="btn primary upload_img_btn" data-upload_name="logo" data-upload_label="Prześlij logo">Prześlij plik <i class="fas fa-cloud-upload-alt"></i></div>
</div>
<img class="logo" src="<?= LOGO_PATH_LOCAL_SM ?>" data-same-ext>

<div class="label mb2">
    <span class="medium">Ikonka sklepu (widoczna na zakładce przeglądarki)</span>
    <div class="btn primary upload_img_btn" data-upload_name="favicon" data-upload_label="Prześlij Ikonkę sklepu">Prześlij plik <i class="fas fa-cloud-upload-alt"></i></div>
</div>
<img class="favicon wo997_img" data-src="<?= FAVICON_PATH_LOCAL_TN ?>">

<div class="label mb2">
    <span class="medium">Domyślne zdjęcie udostępniania</span>
    <div class="btn primary upload_img_btn" data-upload_name="share_img" data-upload_label="Prześlij zdjęcie udostępniania">Prześlij plik <i class="fas fa-cloud-upload-alt"></i></div>
</div>
<img class="share_img wo997_img" data-src="<?= SHARE_IMG_PATH_LOCAL_SM ?>">

<?php include "bundles/admin/templates/default.php"; ?>