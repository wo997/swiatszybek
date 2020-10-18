<?php //route[{ADMIN}logo-ikony]

?>

<?php startSection("head"); ?>

<title>Logo / ikony</title>

<style>
    .favicon {
        width: max(38.25px, min(4.5vw, 54px));
        height: max(38.25px, min(4.5vw, 54px));
        display: block;
        margin: 10px 0;
        object-fit: contain;
    }
</style>

<script>
    function uploadImageWithCopy(e, name) {
        e.preventDefault();
        var input = e.target.find("input[type=file]");
        var formData = new FormData();
        for (let file of input.files) {
            formData.append("files[]", file);
        }
        formData.append("type", "copy");
        formData.append("name", name);

        xhr({
            url: STATIC_URLS["ADMIN"] + "uploads_action",
            formData: formData,
            success(res) {
                if (name == "logo") {
                    $$(".logo").forEach((e) => {
                        e.setAttribute("data-src", res.path);
                        lazyLoadImages();
                    });
                } else if (name == "favicon") {
                    $$(".favicon").forEach((e) => {
                        e.setAttribute("data-src", res.path);
                        lazyLoadImages();
                    });
                }
            },
        });
    }
</script>

<?php startSection("content"); ?>

<h1>Logo / Ikony</h1>

<div class="field-title">Logo sklepu</div>
<img class="logo logo-default" src="<?= LOGO_PATH_LOCAL_SM ?>" data-same-ext style='margin-left:0'>
<form onsubmit="uploadImageWithCopy(event,'logo')">
    <label>
        <input type="file" onchange="$(this).next().click()" style="display:none">
        <input type="submit" name="submit" style="display:none">
        <div class="btn primary">Wybierz plik <i class="fas fa-cloud-upload-alt"></i></div>
    </label>
</form>

<div class="field-title">Ikonka sklepu (favicon)</div>
<img class="favicon" data-src="<?= FAVICON_PATH_LOCAL ?>">
<form onsubmit="uploadImageWithCopy(event,'favicon')">
    <label>
        <input type="file" onchange="$(this).next().click()" style="display:none">
        <input type="submit" name="submit" style="display:none">
        <div class="btn primary">Wybierz plik <i class="fas fa-cloud-upload-alt"></i></div>
    </label>
</form>


<?php include "admin/default_page.php"; ?>