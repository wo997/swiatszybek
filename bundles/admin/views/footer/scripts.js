/* js[view] */

    useTool("cms");
    useTool("preview");

    domload(() => {
        setFormData(
            <?= json_encode([
                "page_footer" => getSetting(["theme", "general", "page_footer"])
            ]); ?>, `#footerForm`);
    });

    function editFooter() {
        editCMS($('[name="page_footer"]'), {
            preview: {
                url: "/",
                content_name: "page_footer",
            }
        });
    }

    function saveFooter() {
        var form = $(`#footerForm`);

        if (!validateForm(form)) {
            return;
        }

        var params = getFormData(form);

        xhr({
            url: STATIC_URLS["ADMIN"] + "/save_footer",
            params: params,
            success: () => {
                setFormInitialState(form);
            }
        });
    }

    function showPreview() {
        var form = $(`#footerForm`);

        if (!validateForm(form)) {
            return;
        }

        var data = getFormData(form);

        data.page_footer = $(`[name="page_footer"]`)._get_value();

        window.preview.open("/", data);
    }

