/* js[admin] */

/**
 * @typedef {{
 * select_target?: PiepNode
 * select_callback?(src)
 * search_data: any[]
 * pagination_data: PaginationCompData
 * quick_search?: string
 * }} FileManagerCompData
 *
 * @typedef {{
 * copy_name?: string
 * label?: string
 * callback?()
 * }} UploadFileModalOptions
 *
 * @typedef {{
 * _data: FileManagerCompData
 * _prev_data: DatatableCompData
 * _set_data(data?: FileManagerCompData, options?: SetCompDataOptions)
 * _nodes: {
 *  files_grid: PiepNode
 *  pagination: PaginationComp
 *  upload_btn: PiepNode
 *  quick_search: PiepNode
 * }
 * _search()
 * _search_request: XMLHttpRequest | undefined
 * _show_upload_modal(options?: UploadFileModalOptions, modal_options?: ShowModalParams)
 * _upload_modal_options?: UploadFileModalOptions
 * } & BaseComp} FileManagerComp
 */

/**
 * @param {FileManagerComp} comp
 * @param {*} parent
 * @param {FileManagerCompData} data
 */
function FileManagerComp(comp, parent, data = undefined) {
	if (data === undefined) {
		data = {
			pagination_data: { page_id: 0, row_count_options: [12, 24, 48, 96], row_count: 48 },
			search_data: [],
		};
	}
	data.quick_search = "";

	comp._search = () => {
		if (comp._search_request) {
			comp._search_request.abort();
			comp._search_request = undefined;
		}

		const search_url = STATIC_URLS["ADMIN"] + "/file/search";

		const data = comp._data;
		const datatable_params = {};
		// if (sort) {
		// 	datatable_params.order = sort.key + " " + sort.order.toUpperCase();
		// }
		// datatable_params.filters = filters;
		datatable_params.row_count = data.pagination_data.row_count;
		datatable_params.page_id = data.pagination_data.page_id;
		datatable_params.quick_search = data.quick_search;

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

				const data = comp._data;
				data.pagination_data.page_count = res.page_count;
				data.pagination_data.total_rows = res.total_rows;
				data.search_data = res.rows;

				let out = "";
				for (const image of data.search_data) {
					let display = "";

					if (image.asset_type == "video") {
						display = html`<video src="/${image.file_path}" class="ql-video" controls="true" style="width:100%;height:250px;"></video>`;
					} else {
						display = html`<img style="width:100%;object-fit:contain" data-height="1w" class="wo997_img" data-src="/${image.file_path}" />`;
					}
					out += html`
						<div class="file_wrapper">
							<div class="display">${display}</div>
							<div class="file_controls glue_children">
								<button class="btn primary select_btn" data-tooltip="Dodaj"><i class="fas fa-plus"></i></button>
								<button class="btn subtle preview_btn" data-tooltip="Podgląd"><i class="fas fa-eye"></i></button>
								<button class="btn subtle edit_btn" disabled data-tooltip="Edytuj"><i class="fas fa-cog"></i></button>
								<button class="btn subtle trash_btn" data-tooltip="Usuń"><i class="fas fa-trash"></i></button>
							</div>
						</div>
					`;
				}
				comp._nodes.files_grid._set_content(out, { maintain_height: true });
				lazyLoadImages({ duration: 0 });

				comp._render();
			},
		});
	};

	comp._set_data = (data, options = {}) => {
		setCompData(comp, data, {
			...options,
			render: () => {
				const cd = comp._changed_data;

				if (
					cd.sort ||
					cd.filters ||
					cd.quick_search ||
					!comp._prev_data.pagination_data ||
					comp._prev_data.pagination_data.page_id != data.pagination_data.page_id ||
					comp._prev_data.pagination_data.row_count != data.pagination_data.row_count
				) {
					comp._search();
				}

				comp.classList.toggle("selectable", !!data.select_target || !!data.select_callback);
			},
		});
	};

	createComp(comp, parent, data, {
		template: html`
			<div class="custom_toolbar">
				<span class="title"
					><span class="medium">Pliki / Zdjęcia</span>
					<button class="btn primary ml1" data-node="{${comp._nodes.upload_btn}}">Prześlij pliki <i class="fas fa-plus"></i></button
				></span>

				<div class="float_icon">
					<input placeholder="Szukaj..." class="field inline" data-bind="{${data.quick_search}}" />
					<i class="fas fa-search"></i>
				</div>
			</div>

			<div data-node="{${comp._nodes.files_grid}}"></div>

			<pagination-comp data-bind="{${data.pagination_data}}" data-node="{${comp._nodes.pagination}}"></pagination-comp>
		`,
		ready: () => {
			comp._nodes.upload_btn.addEventListener("click", () => {
				comp._show_upload_modal();
			});

			// upload
			registerModalContent(html`
				<div id="uploadFile" data-dismissable>
					<div class="modal_body">
						<div class="custom_toolbar">
							<span class="title medium upload_file_label"></span>
							<button class="btn subtle" onclick="hideParentModal(this)">Zamknij <i class="fas fa-times"></i></button>
						</div>
						<div class="scroll_panel scroll_shadow panel_padding">
							<form class="drop_files" action="">
								<label>
									<input type="file" multiple />
									<span class="link">
										<i class="fas fa-file-upload"></i>
										Wybierz pliki
									</span>
								</label>
								<span style="margin-top:8px"> albo upuść je tutaj </span>
								<span class="dropitbro">Upuść plik!</span>
								<span class="upload"></span>
								<input type="submit" name="submit" />
							</form>
						</div>
					</div>
				</div>
			`);

			const form = $("#uploadFile .drop_files");

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
				input.files = ev.dataTransfer.files;
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

				formData.append("search", "");
				if (comp._upload_modal_options.copy_name) {
					formData.append("copy_name", "1");
					formData.append("name", comp._upload_modal_options.copy_name);
				} else {
					// it would be nice to bring it back
					// formData.append("name", );
				}

				xhr({
					url: STATIC_URLS["ADMIN"] + "/file/upload",
					formData: formData,
					success(images) {
						hideLoader(form);
						form.classList.remove("uploading");
						comp._search();
						showNotification("Plik został przesłany", { one_line: true, type: "success" });
						hideParentModal(form);

						if (comp._upload_modal_options.callback) {
							comp._upload_modal_options.callback();
						}
					},
				});

				showLoader(form);
			});

			comp._show_upload_modal = (options = {}, modal_options = {}) => {
				modal_options.source = def(modal_options.source, comp._nodes.upload_btn);
				comp._upload_modal_options = options;
				comp._render();
				$("#uploadFile .upload_file_label")._set_content(def(options.label, "Prześlij pliki"));
				showModal("uploadFile", modal_options);
			};

			comp._nodes.files_grid.addEventListener("click", (ev) => {
				const data = comp._data;

				const target = $(ev.target);
				const file_wrapper = target._parent(".file_wrapper");

				if (file_wrapper) {
					const select_btn = target._parent(".select_btn");
					const preview_btn = target._parent(".preview_btn");
					const trash_btn = target._parent(".trash_btn");

					if (select_btn) {
						const img_src = file_wrapper._child(".wo997_img").dataset.src;

						hideParentModal(comp);
						if (data.select_target) {
							data.select_target._set_value(img_src);
							data.select_target = undefined;
							comp._render();
						}
						if (data.select_callback) {
							data.select_callback(img_src);
							data.select_callback = undefined;
							comp._render();
						}
					}

					if (trash_btn && confirm("Czy aby na pewno chcesz usunąć to zdjęcie?")) {
						showLoader(comp);

						xhr({
							url: STATIC_URLS["ADMIN"] + "/file/delete",
							params: {
								file_path: file_wrapper._child(".wo997_img").dataset.src,
							},
							success: (res) => {
								hideLoader(comp);
								comp._search();
							},
						});
					}

					if (preview_btn) {
						let wo997_img = file_wrapper._child(".wo997_img");
						if (wo997_img) {
							const src = wo997_img.dataset.src;
							zoomImage(src, { source: preview_btn });
						} else {
							showNotification("Nie można otworzyć podglądu", { one_line: true, type: "error" });
							return;
						}
					}
				}
			});
		},
	});
}
