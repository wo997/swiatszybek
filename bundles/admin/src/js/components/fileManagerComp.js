/* js[admin] */

/**
 * @typedef {{
 * pagination_data: PaginationCompData
 * droppedFiles?: FileList | undefined
 * }} FileManagerCompData
 *
 * @typedef {{
 * _data: FileManagerCompData
 * _set_data(data?: FileManagerCompData, options?: SetCompDataOptions)
 * _nodes: {
 *  file_grid: PiepNode
 * }
 * _search()
 * _search_request: XMLHttpRequest | undefined
 * } & BaseComp} FileManagerComp
 */

/**
 * @param {FileManagerComp} comp
 * @param {*} parent
 * @param {FileManagerCompData} data
 */
function fileManagerComp(comp, parent, data = undefined) {
	if (data === undefined) {
		data = {
			pagination_data: { page_id: 0 },
		};
	}

	comp._search = () => {
		if (comp._search_request) {
			comp._search_request.abort();
			comp._search_request = undefined;
		}

		const search_url = STATIC_URLS["ADMIN"] + "file/search";

		const datatable_params = {};
		// if (sort) {
		// 	datatable_params.order = sort.key + " " + sort.order.toUpperCase();
		// }
		// datatable_params.filters = filters;
		datatable_params.row_count = 20;
		datatable_params.page_id = 0;
		datatable_params.quick_search = "";

		comp._search_request = xhr({
			url: search_url,
			params: {
				datatable_params,
			},
			success: (res) => {
				if (!res) {
					console.error(`Search error: ${search_url}`, res);
					return;
				}
				comp._search_request = undefined;
			},
		});
	};

	comp._set_data = (data, options = {}) => {
		setCompData(comp, data, {
			...options,
			render: () => {
				const cd = comp._changed_data;
				// if (cd.whatever || true) {
				// 	comp._search();
				// }
			},
		});
	};

	createComp(comp, parent, data, {
		template: html`
			<div>
				<span class="label first">Pliki / Zdjęcia</span>
			</div>
			<div data-node="{${comp._nodes.file_grid}}"></div>
			<pagination-comp data-bind="{${data.pagination_data}}"></pagination-comp>

			<br /><br />
			<form class="drop_files" action="">
				<label>
					<input type="file" multiple />
					<span class="link">
						<i class="fas fa-file-upload"></i>
						Wybierz pliki
					</span>
				</label>
				albo upuść je tutaj
				<span class="dropitbro">Upuść plik!</span>
				<span class="upload"></span>
				<input type="submit" name="submit" />
			</form>
		`,
		ready: () => {
			//comp._search();

			comp._data.droppedFiles = undefined;

			const form = comp._child(".drop_files");

			/** @type {HTMLInputElement} */
			// @ts-ignore
			const input = form._child(`input[type="file"]`);

			const def_ev = (ev) => {
				ev.preventDefault();
				ev.stopPropagation();
			};
			["drag", "dragstart", "dragend", "dragover", "dragenter", "dragleave", "drop"].forEach((e) => {
				form.addEventListener(e, def_ev);
			});

			const active = (ev) => {
				form.classList.add("active");
			};
			["dragover", "dragenter"].forEach((e) => {
				form.addEventListener(e, active);
			});

			const inactive = (ev) => {
				form.classList.remove("active");
			};
			["dragleave", "dragend", "drop"].forEach((e) => {
				form.addEventListener(e, inactive);
			});

			const submit = () => {
				form._child(`input[type="submit"]`).click();
			};

			form.addEventListener("drop", (ev) => {
				comp._data.droppedFiles = ev.dataTransfer.files;
				input.files = comp._data.droppedFiles;
				submit();
			});

			input.addEventListener("change", (ev) => {
				submit();
			});

			form.addEventListener("submit", (ev) => {
				ev.preventDefault();
				form.classList.add("uploading");

				const input = form._child(`input[type="file"]`);
				// @ts-ignore
				const files = input.files;
				const formData = new FormData();

				for (let i = 0; i < files.length; i++) {
					formData.append("files[]", files[i]);
				}
				input._set_value("", { quiet: true });

				// formData.append("name", $("#uploadFiles .name").value);
				// formData.append("search", $("#search").value);
				formData.append("search", "");

				xhr({
					url: STATIC_URLS["ADMIN"] + "uploads_action",
					formData: formData,
					success(images) {
						hideLoader(form);
						form.classList.remove("uploading");

						let out = "";
						for (const image of images) {
							let display = "";

							if (image.asset_type == "video") {
								display = html`<video src="/${image.file_path}" class="ql-video" controls="true" style="width:100%;height:250px;"></video>`;
							} else {
								display = html`<img
									style="width:100%;object-fit:contain"
									data-height="1w"
									class="wo997_img"
									data-src="/${image.file_path}"
								/>`;
							}
							const image_metadata_html = html`
								<b>Ścieżka:</b> ${image.file_path}
								<hr style="margin:2px 0" />
								<b>Nazwa:</b> ${image.uploaded_file_name}
								<hr style="margin:2px 0" />
								<b>Autor:</b> ${def(image.email, "-")}
							`;
							out += html`
								<div class="gallery-item">
									${display}
									<div class="btn primary" onclick='fileManager.choose("/${image.file_path}")' data-tooltip="Wybierz">
										<i class="fas fa-check"></i>
									</div>
									<div class="btn red" onclick='fileManager.delete("/${image.file_path}")' data-tooltip="Usuń">
										<i class="fas fa-times"></i>
									</div>
									<i class="fas fa-info-circle" data-tooltip="${image_metadata_html}"></i>
								</div>
							`;
						}
						comp._nodes.file_grid._set_content(out);
						lazyLoadImages(false);
					},
				});

				showLoader(form);
			});
		},
	});
}
