<?php //route[admin/moduly]

?>

<?php startSection("head"); ?>

<title>Moduły</title>

<style>
    .module_list {
        /*width: 200px;
        flex-shrink: 0;*/
    }

    .module_info {
        /*flex-grow: 1;*/
        background: #fafafa;
        padding: 10px;
    }
</style>

<script>
    domload(() => {
        window.module_form = $(".module_info");

        var html = "";

        for (let module_name in app_modules) {
            var module = app_modules[module_name];
            html += `
                <div class="btn subtle" onclick="selectModule(this, '${module_name}')">${module.icon} ${module.title}</div>
            `;
        }

        $(".module_list").setContent(html);
    });

    function getModuleFormData() {
        return {
            form_data: getFormData(module_form),
            module_name: window.module_name
        };
    }

    function saveModuleSettings() {
        xhr({
            url: "/admin/save_module_settings",
            params: getModuleFormData(),
            success: (res) => {

            },
        });
    }

    function selectModule(btn, module_name) {
        window.module_name = module_name;
        $$(".module_list .btn").forEach(e => {
            e.classList.toggle("primary", e === btn);
            e.classList.toggle("subtle", e !== btn);
        });

        var form = $(".module_info");

        xhr({
            url: "/admin/module_form",
            params: {
                module_name: module_name,
            },
            success: (res) => {
                var module = app_modules[module_name];

                var output = "";
                if (module.title) {
                    output += `<h2 class='header'>${module.title} ${module.version ? `v${module.version}` : ''}</h2>`;
                }
                if (module.description) {
                    output += `<div class='header'>Opis modułu: ${module.description}</div>`;
                }
                if (module.version) {
                    output += `<div>${module.version}</div>`;
                }
                output += res.form;

                form.setContent(output);
                setFormData(res.form_data, form);
            },
        });
    }

    domload(() => {
        $("#uploadFile").addEventListener("submit", (e) => {
            e.preventDefault();

            var input = $("#uploadFile [type=file]");
            var files = input.files;
            var formData = new FormData();

            for (let i = 0; i < files.length; i++) {
                let file = files[i];
                formData.append("files[]", file);
            }
            input.value = "";

            formData.append("type", "copy");
            formData.append("name", "logo");

            xhr({
                url: "/admin/uploads_action",
                formData: formData,
                success(images) {
                    console.log(images);
                },
            });
        });
    })
</script>

<?php startSection("content"); ?>

<h1>Moduły</h1>

<div class="module_list"></div>
<div class="module_info"></div>

<form id="uploadFile">
    <label style="text-align:right;display: block;margin-top: 10px;">
        test wgrywania zdjec - logo
        <input type="file" name="files[]" onchange="$(this).next().click()" style="display:none">
        <input type="submit" name="submit" style="display:none">
        <div class="btn primary">Wybierz pliki <i class="fas fa-cloud-upload-alt"></i></div>
    </label>
</form>

<?php include "admin/default_page.php"; ?>