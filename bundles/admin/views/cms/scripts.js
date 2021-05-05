/* js[view] */

/** @type {PiepCMS} */
let piep_cms;

domload(() => {
	piep_cms = new PiepCMS($(".piep_editor"));

	let breadcrumbs = "";
	let preview_url = "/";

	if (page_data) {
		breadcrumbs += html`
			<a class="btn transparent crumb" href="${STATIC_URLS["ADMIN"]}/strony"> Strony </a>
			<i class="fas fa-chevron-right"></i>
		`;

		if (page_data.general_product) {
			breadcrumbs += html` <div class="crumb">${page_data.general_product.name}</div> `;
			$(".piep_editor_header").insertAdjacentHTML(
				"beforeend",
				html`
					<a
						class="btn subtle ml1"
						style="font-size:1rem"
						href="${STATIC_URLS["ADMIN"]}/produkt/${page_data.general_product.general_product_id}"
					>
						Edytuj produkt
						<i class="fas fa-cube"></i>
					</a>
				`
			);

			preview_url = page_data.general_product.__url;
		}
	}

	if (template_data) {
		breadcrumbs += html`
			<a class="btn transparent crumb" href="${STATIC_URLS["ADMIN"]}/szablony"> Szablony </a>
			<i class="fas fa-chevron-right"></i>
		`;

		breadcrumbs += html` <div class="crumb">${template_data.name}</div> `;

		// preview_url = template_data.???;
	}

	$(".piep_editor_header .breadcrumbs")._set_content(breadcrumbs);

	$(".piep_editor_header .preview").addEventListener("click", () => {
		previewUrl(preview_url);
	});

	// IMPORT
	let v_dom_json;

	if (page_data) {
		v_dom_json = page_data.v_dom_json;
	}

	if (template_data) {
		v_dom_json = template_data.v_dom_json;

		piep_cms.max_vid_inside = template_data.max_vid_inside;
	}

	/** @type {vDomNode[]} */
	let v_dom;
	try {
		v_dom = JSON.parse(v_dom_json);
	} catch {
		v_dom = [];
	}

	let all_v_doms = [];

	parent_templates.forEach((parent_template) => {
		/** @type {vDomNode[]} */
		let parent_template_v_dom = [];
		try {
			parent_template_v_dom = JSON.parse(parent_template.v_dom_json);
			all_v_doms.push(parent_template_v_dom);
		} catch {}
	});

	all_v_doms.push(v_dom);

	// glue v_doms from the smallest pieces to the biggest
	for (let i = all_v_doms.length - 2; i >= 0; i--) {
		const base_v_dom = all_v_doms[i];
		const append_v_dom = all_v_doms[i + 1];

		const is_top_layer = i == all_v_doms.length - 2;

		/**
		 * @param {vDomNode[]} base_v_nodes
		 */
		const traverseVDom = (base_v_nodes) => {
			for (const base_v_node of base_v_nodes) {
				if (base_v_node.module_name === "template_hook" && base_v_node.settings && base_v_node.settings.template_hook_id) {
					delete base_v_node.module_name;
					base_v_node.classes.push("vertical_container", "template_hook_root");
					// just remove a class
					const module_template_hook_index = base_v_node.classes.indexOf("module_template_hook");
					if (module_template_hook_index !== -1) {
						base_v_node.classes.splice(module_template_hook_index, 1);
					}

					// now glue these, but as u can see the template_hook_id isn't passed by default, just for the last layer
					const append_v_node = append_v_dom.find(
						(append_v_node) => append_v_node.template_hook_id === base_v_node.settings.template_hook_id
					);

					if (append_v_node) {
						// copy just the children, styling (like padding) etc is allowed only in the base template
						base_v_node.children = append_v_node.children;
					} else {
						base_v_node.children = [];
					}

					// make sure that we export only the last layer
					if (is_top_layer) {
						base_v_node.template_hook_id = base_v_node.settings.template_hook_id;
					}
				} else if (base_v_node.children) {
					traverseVDom(base_v_node.children);
				}

				base_v_node.disabled = true;
			}
		};

		traverseVDom(base_v_dom);
	}

	const full_v_dom = all_v_doms[0];

	piep_cms.import(full_v_dom);

	$(".piep_editor_header .save").addEventListener("click", () => {
		// const errors = validateInputs(directCompNodes(comp, "[data-validate]"));

		// if (errors.length > 0) {
		// 	return;
		// }

		let save_v_dom;

		if (all_v_doms.length > 1) {
			// a template has been used
			save_v_dom = [];

			/**
			 * @param {vDomNode[]} v_nodes
			 */
			const traverseVDom = (v_nodes) => {
				for (const v_node of v_nodes) {
					if (v_node.template_hook_id) {
						save_v_dom.push(v_node);
					} else if (v_node.children) {
						traverseVDom(v_node.children);
					}
				}
			};

			traverseVDom(piep_cms.v_dom);
		} else {
			// plain page / template
			save_v_dom = piep_cms.v_dom;
		}

		const save_v_dom_json = JSON.stringify(save_v_dom);

		if (page_data) {
			xhr({
				url: STATIC_URLS["ADMIN"] + "/page/save",
				params: {
					page: {
						page_id: page_data.page_id,
						v_dom_json: save_v_dom_json,
					},
				},
				success: (res) => {
					page_data = res;

					showNotification("Zapisano stronę", {
						one_line: true,
						type: "success",
					});
				},
			});
		} else if (template_data) {
			xhr({
				url: STATIC_URLS["ADMIN"] + "/template/save",
				params: {
					template: {
						template_id: template_data.template_id,
						v_dom_json: save_v_dom_json,
					},
				},
				success: (res) => {
					template_data = res;

					showNotification("Zapisano szablon", {
						one_line: true,
						type: "success",
					});
				},
			});
		}
	});
});
