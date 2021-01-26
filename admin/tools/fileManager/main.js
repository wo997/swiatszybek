/* js[tool_fileManager] */

window.fileManager = {
	target: null,
	callback: null,
	defaultName: "",
	asset_types: [],
	size: null,
	open: (target = null, params = {}) => {
		fileManager.target = target;
		fileManager.callback = params.callback;

		// not worth using
		fileManager.size = params.size;
		fileManager.optimise = params.optimise ? true : false;

		fileManager.setName(null, true);

		if (!params.asset_types) {
			params.asset_types = ["image", "video"];
		}
		fileManager.asset_types = params.asset_types;

		var can_use_external_image_btn = false;
		if (params.asset_types.length === 1 && params.asset_types[0] === "image") {
			can_use_external_image_btn = true;
		}
		$(".use_external_image_btn").style.display = can_use_external_image_btn
			? ""
			: "none";

		showModal("fileManager", { source: def(params.source, target) });

		fileManager.search();
	},
	choose: (src) => {
		if (fileManager.size) {
			//src
			console.log(src, fileManager.size);
			src = "/" + UPLOADS_PATH + fileManager.size + getUploadedFileName(src);
		}

		if (fileManager.target) {
			$(fileManager.target)._set_value(src);
			lazyLoadImages(true);
		}

		if (fileManager.callback) {
			fileManager.callback({ src: src, target: fileManager.target });
		}

		hideModal("fileManager");
	},
	setDefaultName: (name, replaceEmptyOnly = true) => {
		fileManager.defaultName = name;
		fileManager.setName(fileManager.defaultName, replaceEmptyOnly);
	},
	setName: (name = null, replaceEmptyOnly = false) => {
		if (name === null) {
			name = fileManager.defaultName;
		}
		var nameElement = $("#uploadFiles .name");
		if (!replaceEmptyOnly || nameElement.value == "") {
			nameElement.value = name;
		}
	},
	fileAction: (formData, callback = null) => {
		xhr({
			url: STATIC_URLS["ADMIN"] + "uploads_action",
			formData: formData,
			success(images) {
				try {
					if (isArray(images)) {
						var out = "";
						var counter = 0;
						for (const image of images) {
							counter++;

							var replaceImg = $(`[upload_image="${counter}"]`);
							if (replaceImg) {
								replaceImg.src = "/" + image.file_path;
								replaceImg.removeAttribute("upload_image");
							}

							var display = "";

							if (image.asset_type == "video") {
								display = `<video src="/${image.file_path}" class="ql-video" controls="true" style='width:100%;height:250px;'></video>`;
							} else {
								display = `<img style='width:100%;object-fit:contain' data-height='1w' class='wo997_img' data-src='/${image.file_path}'>`;
							}
							const image_metadata_html = /* html */ `
                                <b>Ścieżka:</b> ${image.file_path}
                                <hr style="margin:2px 0">
                                <b>Nazwa:</b> ${image.uploaded_file_name} 
                                <hr style="margin:2px 0">
                                <b>Autor:</b> ${def(image.email, "-")}
                            `;
							out += /* html */ `
                                <div class='gallery-item'>
                                    ${display}
                                    <div class="btn primary" onclick='fileManager.choose("/${image.file_path}")' data-tooltip="Wybierz"><i class="fas fa-check"></i></div>
                                    <div class="btn red" onclick='fileManager.delete("/${image.file_path}")' data-tooltip="Usuń"><i class="fas fa-times"></i></div>
                                    <i class='fas fa-info-circle' data-tooltip='${image_metadata_html}'></i>
                                </div>
                            `;
						}
						$("#fileManager .gallery")._set_content(out);
						lazyLoadImages(false);
					}
				} catch (e) {
					console.log(e);
				}

				if (callback) {
					callback();
				}
			},
		});
	},
	search: () => {
		var formData = new FormData();
		formData.append("search", $("#search").value);
		formData.append("asset_types", fileManager.asset_types.join(","));
		fileManager.fileAction(formData);
	},
	delete: (src) => {
		if (confirm("Czy aby na pewno chcesz usunąć ten plik?")) {
			var formData = new FormData();
			formData.append("delete_path", src);
			fileManager.fileAction(formData, () => {
				fileManager.search();
			});
		}
	},
	loaded: () => {
		$("#uploadFiles form").addEventListener("submit", (e) => {
			e.preventDefault();

			var input = $("#uploadFiles [type=file]");
			var files = input.files;
			var formData = new FormData();

			for (let i = 0; i < files.length; i++) {
				let file = files[i];

				formData.append("files[]", file);
			}
			input.value = "";

			formData.append("name", $("#uploadFiles .name").value);
			formData.append("search", $("#search").value);

			fileManager.fileAction(formData);

			hideModal("uploadFiles");
		});
	},
	addExternalImage: (btn) => {
		if (!validateForm("#externalImage")) {
			return;
		}
		hideParentModal(btn);

		fileManager.choose($("#externalImage .external_link")._get_value());
	},
};

window.addEventListener("tool_loaded", (event) => {
	if (event.detail.name != "fileManager") {
		return;
	}
	if (event.detail.info == "js") {
		registerModalContent(/*html*/ `
        <div id="fileManager" data-expand="true" class="fileManager">
            <div class="modal-body">
                <div class="custom-toolbar" style="/*display: flex;background: #eee;padding: 5px;align-items: center;border-bottom: 1px solid #777;*/">
                <span class="title" style="display: inline-flex;align-items: center;flex-wrap:wrap">
                    Menedżer plików

                    <div class="float-icon inline" style="margin-left: 7px;display: inline-flex;align-self: stretch;">
                    <input class="field inline small" type="text" name="search" id="search" oninput="delay('search',500,fileManager)" placeholder="Wyszukaj..." style="align-self: stretch;">
                    <i class="fas fa-search" style="color:black"></i>
                    </div>

                    <button class="btn primary" onclick="showModal('uploadFiles')" style="margin-left: 4px;">Prześlij nowe <i class="fas fa-plus"></i></button>

                    <button class="btn secondary use_external_image_btn" onclick="showModal('externalImage')" style="margin-left: 4px;">Użyj zdjęcia zewnętrznego <i class="fas fa-external-link-alt"></i></button>
                </span>
                    
                <button class="btn primary" onclick="hideParentModal(this)">Zamknij <i class="fa fa-times"></i></button>
                </div>

                <div class="scroll-panel scroll-shadow panel-padding">

                <div class="gallery">

                </div>

                </div>
            </div>
        </div>
    `);

		registerModalContent(/*html*/ `
        <div id="externalImage">
            <div class="modal-body">
                <div class="custom-toolbar">
                    <span class="title">
                    Wybór zdjęcia zewnętrznego
                    </span>
                    <button class="btn primary" onclick="hideParentModal(this)">Zamknij <i class="fa fa-times"></i></button>
                </div>

                <div class="scroll-panel panel-padding">
                <div class="field-wrapper">
                    <div class="label">Wstaw link do zdjęcia zewnętrznego</div>
                    <div class="glue-children">
                    <input type="text" data-validate class="external_link field">
                    <button class="btn primary" onclick="fileManager.addExternalImage(this);">Wstaw</button>
                    </div>
                </div>

                <div style="margin-top:8px">
                    <i class="fas fa-info-circle"></i> Wstawienie zdjęcia zewnętrznego wiąże się z:<br>
                    - możliwością jego utraty<br>
                    - brakiem optymalizacji
                </div>
                </div>
            </div>
        </div>
    `);

		registerModalContent(
			/*html*/ `
        <div id="uploadFiles">
            <div class="modal-body">
                <div class="custom-toolbar">
                    <span class="title">
                    Przesyłanie plików
                    </span>
                    <button class="btn primary" onclick="hideParentModal(this)">Zamknij <i class="fa fa-times"></i></button>
                </div>

                <form class="panel-padding">
                <div class="label">Nazwa zdjęcia</div>
                <input type="text" class="name field">
                <label style="text-align:right;display: block;margin-top: 10px;">
                    <input type="file" name="files[]" multiple onchange="$(this)._next().click()" style="display:none">
                    <input type="submit" name="submit" style="display:none">
                    <div class="btn primary">Wybierz pliki <i class="fas fa-cloud-upload-alt"></i></div>
                </label>
                </form>
            </div>
        </div>
        `,
			() => {}
		);
	}
	if (event.detail.info == "all") {
		// @ts-ignore
		window.fileManager.loaded();
	}
});
