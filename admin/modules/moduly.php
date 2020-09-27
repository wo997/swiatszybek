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

        for (let module_name in modules) {
            var module = modules[module_name];
            html += `
                <div class="btn subtle" onclick="selectModule(this, '${module_name}')">${module.icon} ${module.description}</div>
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
                var module = modules[module_name];

                var output = "";
                if (module.title) {
                    output += `<h2 class='header'>${module.title} ${module.version ? `v${module.version}` : ''}</h2>`;
                }
                if (module.description) {
                    output += `<div class='header'>Opis modułu: ${module.title}</div>`;
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
</script>

<?php startSection("content"); ?>

<h1>Moduły</h1>

<div class="module_list"></div>
<div class="module_info"></div>
<div class="desktopRow">
</div>

<?php include "admin/default_page.php"; ?>