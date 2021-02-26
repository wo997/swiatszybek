/* js[admin] */

/**
 * @typedef {{
 * search_data: any[]
 * pagination_data: PaginationCompData
 * }} FileManagerCompData
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
 * _show_upload_modal(options?: ShowModalParams)
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
			pagination_data: { page_id: 0, row_count_options: [12, 24, 48, 96], row_count: 48 },
			search_data: [],
		};
	}

	comp._search = () => {
		if (comp._search_request) {
			comp._search_request.abort();
			comp._search_request = undefined;
		}

		const search_url = STATIC_URLS["ADMIN"] + "file/search";

		const data = comp._data;
		const datatable_params = {};
		// if (sort) {
		// 	datatable_params.order = sort.key + " " + sort.order.toUpperCase();
		// }
		// datatable_params.filters = filters;
		datatable_params.row_count = data.pagination_data.row_count;
		datatable_params.page_id = data.pagination_data.page_id;
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
					// const image_metadata_html = html`
					// 	<b>Ścieżka:</b> ${image.file_path}
					// 	<hr style="margin:2px 0" />
					// 	<b>Nazwa:</b> ${image.uploaded_file_name}
					// 	<hr style="margin:2px 0" />
					// 	<b>Autor:</b> ${def(image.email, "-")}
					// `;
					out += html`
						<div class="file_wrapper">
							<div class="display">${display}</div>
							<div class="file_controls glue_children">
								<button class="btn subtle select_btn"><i class="fas fa-check"></i></button>
								<button class="btn subtle preview_btn"><i class="fas fa-eye"></i></button>
								<button class="btn subtle edit_btn"><i class="fas fa-cog"></i></button>
								<button class="btn subtle trash_btn"><i class="fas fa-trash"></i></button>
							</div>
						</div>
					`;
				}
				comp._nodes.files_grid._set_content(out, { maintain_height: true });
				lazyLoadImages(false);

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
					!comp._prev_data.pagination_data ||
					comp._prev_data.pagination_data.page_id != data.pagination_data.page_id ||
					comp._prev_data.pagination_data.row_count != data.pagination_data.row_count
				) {
					comp._search();
				}
			},
		});
	};

	createComp(comp, parent, data, {
		template: html`
			<div class="custom_toolbar">
				<span class="title"
					><span class="medium">Pliki / Zdjęcia</span>
					<button class="btn important" data-node="{${comp._nodes.upload_btn}}">Prześlij pliki <i class="fas fa-plus"></i></button
				></span>
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
							<span class="title medium">Prześlij pliki</span>
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

				// formData.append("name", $("#uploadFiles .name").value);
				// formData.append("search", $("#search").value);
				formData.append("search", "");

				xhr({
					url: STATIC_URLS["ADMIN"] + "file/upload",
					formData: formData,
					success(images) {
						hideLoader(form);
						form.classList.remove("uploading");
						comp._search();
						showNotification("Plik został przesłany", { one_line: true, type: "success" });
						hideParentModal(form);
					},
				});

				showLoader(form);
			});

			comp._show_upload_modal = (params = {}) => {
				params.source = def(params.source, comp._nodes.upload_btn);
				showModal("uploadFile", params);
			};

			// preview
			registerModalContent(html`
				<div id="previewFile" data-dismissable>
					<div class="modal_body">
						<div class="custom_toolbar">
							<span class="title medium">Podgląd pliku</span>
							<button class="btn subtle" onclick="hideParentModal(this)">Zamknij <i class="fas fa-times"></i></button>
						</div>
						<div class="place flex_stretch" style="justify-content: center;align-items: center;"></div>
					</div>
				</div>
			`);

			comp._nodes.files_grid.addEventListener("click", (ev) => {
				const target = $(ev.target);
				const file_wrapper = target._parent(".file_wrapper", { skip: 0 });

				if (file_wrapper) {
					const select_btn = target._parent(".select_btn", { skip: 0 });
					const preview_btn = target._parent(".preview_btn", { skip: 0 });
					const trash_btn = target._parent(".trash_btn", { skip: 0 });

					if (preview_btn) {
						const place = $("#previewFile .place");
						/** @type {ResponsiveImage} */
						// @ts-ignore
						let wo997_img = file_wrapper._child(".wo997_img");
						if (wo997_img) {
							const src = wo997_img.dataset.src;
							place._set_content(html`<img class="wo997_img" data-src="${src}" />`);
							// @ts-ignore
							wo997_img = place._child(".wo997_img");
							wo997_img.style.width = "10000px";
							loadImage(wo997_img);
							lazyLoadImages(false);
							wo997_img.style.width = "";
						} else {
							place._set_content(file_wrapper._child(".display").outerHTML);
						}

						setTimeout(() => {
							showModal("previewFile", { source: file_wrapper });
						});
					}
				}
			});
		},
	});
}
