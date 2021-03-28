/* js[view] */

    useTool("preview");

    domload(() => {
        setFormData(
            <?= json_encode([
                "colors" => getSetting(["theme", "general", "colors"])
            ]); ?>, `#themeForm`);
    });

    function saveTheme() {
        var form = $(`#themeForm`);

        if (!validateForm(form)) {
            return;
        }

        var params = {
            data: getFormData(form)
        };

        xhr({
            url: STATIC_URLS["ADMIN"] + "/save_theme",
            params: params,
            success: () => {
                setFormInitialState(form);
            }
        });
    }

    function showPreview() {
        /*var form = $(`#themeForm`);

        if (!validateForm(form)) {
            return;
        }

        var data = getFormData(form);

        data.theme = $(`[name="theme"]`).getValue();

        window.preview.open("/", data);*/
    }

