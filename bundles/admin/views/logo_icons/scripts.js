/* js[view] */

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
                $$(`.${name}`).forEach((e) => {
                    switchImage(e, res.path);
                });
            },
        });
    }
