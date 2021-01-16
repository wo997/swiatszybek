<?php //route[{ADMIN}logo-ikony]

?>

<?php startSection("head_content"); ?>

<title>Logo / ikony</title>

<?php startSection("body_content"); ?>

<h1>Logo / Ikony</h1>

<div class="field-title">Logo sklepu</div>
<img class="logo logo-default" src="<?= LOGO_PATH_LOCAL_SM ?>" data-same-ext style='margin-left:0'>
<form onsubmit="uploadImageWithCopy(event,'logo')">
    <label>
        <input type="file" onchange="$(this)._next().click()">
        <input type="submit" name="submit">
        <div class="btn primary">Wybierz plik <i class="fas fa-cloud-upload-alt"></i></div>
    </label>
</form>

<div class="field-title">Ikonka sklepu (favicon)</div>
<img class="favicon wo997_img" data-src="<?= FAVICON_PATH_LOCAL_TN ?>">
<form onsubmit="uploadImageWithCopy(event,'favicon')">
    <label>
        <input type="file" onchange="$(this)._next().click()">
        <input type="submit" name="submit">
        <div class="btn primary">Wybierz plik <i class="fas fa-cloud-upload-alt"></i></div>
    </label>
</form>

<div class="field-title">Domyślne zdjęcie udostępniania</div>
<img class="share_img wo997_img" data-src="<?= SHARE_IMG_PATH_LOCAL_SM ?>">
<form onsubmit="uploadImageWithCopy(event,'share_img')">
    <label>
        <input type="file" onchange="$(this)._next().click()">
        <input type="submit" name="submit">
        <div class="btn primary">Wybierz plik <i class="fas fa-cloud-upload-alt"></i></div>
    </label>
</form>


<?php include "admin/page_template.php"; ?>