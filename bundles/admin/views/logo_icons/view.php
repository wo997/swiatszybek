<?php //route[{ADMIN}/logo-ikony]

?>

<?php startSection("head_content"); ?>

<title>Logo / ikony</title>

<?php startSection("header"); ?>

<div class="custom_toolbar">
    <span class="title breadcrumbs">
        <div class="crumb">
            Logo / Ikony
        </div>
    </span>
</div>

<?php startSection("body_content"); ?>

<div class="label">Logo sklepu</div>
<img class="logo logo_default" src="<?= LOGO_PATH_LOCAL_SM ?>" data-same-ext style='margin-left:0'>
<div class="btn primary upload_img_btn" data-upload_name="logo" data-upload_label="Prześlij logo">Prześlij plik <i class="fas fa-cloud-upload-alt"></i></div>

<div class="label">Ikonka sklepu (favicon)</div>
<img class="favicon wo997_img" data-src="<?= FAVICON_PATH_LOCAL_TN ?>">
<div class="btn primary upload_img_btn" data-upload_name="favicon" data-upload_label="Prześlij Ikonkę sklepu">Prześlij plik <i class="fas fa-cloud-upload-alt"></i></div>

<div class="label">Domyślne zdjęcie udostępniania</div>
<img class="share_img wo997_img" data-src="<?= SHARE_IMG_PATH_LOCAL_SM ?>">
<div class="btn primary upload_img_btn" data-upload_name="share_img" data-upload_label="Prześlij zdjęcie udostępniania">Prześlij plik <i class="fas fa-cloud-upload-alt"></i></div>

<?php include "bundles/admin/templates/default.php"; ?>