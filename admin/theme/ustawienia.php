<?php //route[admin/ustawienia-glowne]

?>

<?php startSection("head"); ?>

<title>Ustawienia główne</title>

<style>

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
            url: "/admin/uploads_action",
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

<h1>Ustawienia główne</h1>

<div class="">

</div>

<div class="field-title">Logo sklepu</div>
<img class="logo logo-default" data-src="<?= LOGO_PATH_LOCAL ?>">
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