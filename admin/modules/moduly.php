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
        var html = "";

        for (let module_name in modules) {
            var module = modules[module_name];
            html += `
                <div class="btn subtle" onclick="selectModule(this, '${module_name}')">${module.icon} ${module.description}</div>
            `;
        }

        $(".module_list").setContent(html);
    });

    function selectModule(btn, module_name) {
        $$(".module_list .btn").forEach(e => {
            e.classList.toggle("primary", e === btn);
            e.classList.toggle("subtle", e !== btn);
        });

        $(".module_info").setContent(JSON.stringify(modules[module_name]));

    }
</script>

<?php startSection("content"); ?>

<h1>Moduły</h1>

<div class="module_list"></div>
<div class="module_info"></div>
<div class="desktopRow">
</div>

<?php include "admin/default_page.php"; ?>