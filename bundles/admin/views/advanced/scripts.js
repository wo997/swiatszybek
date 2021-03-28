/* js[view] */

    domload(() => {
        setFormData(
            <?= json_encode(
                getSetting(["general", "advanced"])
            ); ?>, `#zaawansowaneForm`);
    });

    function saveZawansowane() {
        var form = $(`#zaawansowaneForm`);

        if (!validateForm(form)) {
            return;
        }

        var params = {
            advanced: getFormData(form),
        };

        xhr({
            url: STATIC_URLS["ADMIN"] + "/save_zaawansowane",
            params: params,
            success: () => {
                setFormInitialState(form);
            }
        });
    }


