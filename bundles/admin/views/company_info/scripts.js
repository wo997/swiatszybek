/* js[view] */

    domload(() => {
        setFormData(daneFirmy, `#daneFirmyForm`);
    });

    function saveDaneFirmy() {
        var form = $(`#daneFirmyForm`);

        if (!validateForm(form)) {
            return;
        }

        var params = {
            company: getFormData(form),
        };

        xhr({
            url: STATIC_URLS["ADMIN"] + "save_dane_firmy",
            params: params,
            success: () => {
                setFormInitialState(form);
            }
        });
    }
