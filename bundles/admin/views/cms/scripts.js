/* js[view] */

/** @type {PiepCMS} */
let piep_cms;

domload(() => {
	piep_cms = new PiepCMS($(".piep_editor"));

	$(".piep_editor_header .save").addEventListener("click", () => {
		// const errors = validateInputs(directCompNodes(comp, "[data-validate]"));

		// if (errors.length > 0) {
		// 	return;
		// }

		if (page_data) {
			xhr({
				url: STATIC_URLS["ADMIN"] + "/page/save",
				params: {
					page: {
						page_id: page_data.page_id,
						v_dom_json: JSON.stringify(piep_cms.v_dom),
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
						v_dom_json: JSON.stringify(piep_cms.v_dom),
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

	let v_dom_json;

	if (page_data) {
		v_dom_json = page_data.v_dom_json;
	}

	if (template_data) {
		v_dom_json = template_data.v_dom_json;
	}

	/** @type {vDomNode[]} */
	let v_dom = [];
	try {
		v_dom = JSON.parse(v_dom_json);
	} catch {}
	let full_v_dom = v_dom;

	parent_templates.forEach((parent_template) => {
		/** @type {vDomNode[]} */
		let parent_template_v_dom = [];
		try {
			parent_template_v_dom = JSON.parse(parent_template.v_dom_json);
		} catch {}

		/**
		 * @param {vDomNode[]} v_nodes
		 */
		const traverseVDom = (v_nodes) => {
			for (const v_node of v_nodes) {
				if (v_node.module_name === "template_hook" && v_node.settings && v_node.settings.template_hook_name) {
					console.log(v_node.settings.template_hook_name);
				}
				if (v_node.children) {
					traverseVDom(v_node.children);
				}
			}
		};
		traverseVDom(parent_template_v_dom);

		full_v_dom = parent_template_v_dom;
	});

	piep_cms.import(full_v_dom);
});
