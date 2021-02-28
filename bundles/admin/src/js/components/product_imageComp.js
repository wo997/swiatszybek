/* js[admin] */

/**
 * @typedef {{
 * product_image_id
 * img_url: string
 * option_ids: number[]
 * features?: Product_FeatureCompData[]
 * } & ListCompRowData} Product_ImageCompData
 *
 * @typedef {{
 * _data: Product_ImageCompData
 * _set_data(data?: Product_ImageCompData, options?: SetCompDataOptions)
 * _nodes: {
 *  feature_name: PiepNode
 *  edit_Image_btn: PiepNode
 *  add_option_btn: PiepNode
 *  select_options: PiepNode
 *  selected_options: PiepNode
 * } & ListControlTraitNodes
 * } & BaseComp} Product_ImageComp
 */

/**
 * @param {Product_ImageComp} comp
 * @param {*} parent
 * @param {Product_ImageCompData} data
 */
function product_imageComp(comp, parent, data = { product_image_id: -1, img_url: "", option_ids: [] }) {
	comp._set_data = (data, options = {}) => {
		data.option_ids = def(data.option_ids, []);

		setCompData(comp, data, {
			...options,
			render: () => {
				let options_html = html`<option value="0">―</option>`;
				data.features.forEach((feature) => {
					if (feature.options.length < 2) {
						return;
					}

					const fea = product_features.find((f) => f.product_feature_id === feature.product_feature_id);
					options_html += feature.options
						.filter((op) => !data.option_ids.includes(op.product_feature_option_id))
						.map((option) => {
							return html`<option value="${option.product_feature_option_id}">${fea.name}: ${option.name}</option>`;
						});
				});

				const selected_options_html = html`${data.option_ids
					.map((option_id) => {
						const option = product_feature_options.find((op) => op.product_feature_option_id === option_id);
						const fea = product_features.find((f) => f.product_feature_id === option.product_feature_id);
						if (option) {
							return html`
								<span class="semi-bold">${fea.name}:</span>
								<span style="margin-left: 5px">${option.name}</span>
								<button class="btn transparent small remove_option" data-option_id="${option_id}" style="margin-left: 2px">
									<i class="fas fa-times"></i>
								</button>
							`;
						}
						return "";
					})
					.join("<br>")}`;

				comp._nodes.select_options._set_content(options_html);
				comp._nodes.selected_options._set_content(selected_options_html);
			},
		});
	};

	createComp(comp, parent, data, {
		template: html`
			<image-input data-bind="{${data.img_url}}" style="width:100px;height:100px"></image-input>

			<div style="margin-left: 10px">
				<div data-node="{${comp._nodes.selected_options}}"></div>
				<div
					class="select_image_options_wrapper"
					data-tooltip="Klient w pierwszej kolejności zobaczy zdjęcia,<br>które go faktycznie interesują"
				>
					<select class="field" data-node="{${comp._nodes.select_options}}"></select>
					<button class="btn primary">Połącz z cechą</button>
				</div>
			</div>

			<div style="margin-left:auto">
				<p-batch-trait data-trait="list_controls"></p-batch-trait>
			</div>
		`,
		initialize: () => {
			const so = comp._nodes.select_options;
			so.addEventListener("change", () => {
				const option_id = +so._get_value();
				if (option_id) {
					comp._data.option_ids.push(option_id);
					comp._render();
				}
			});

			comp.addEventListener("click", (ev) => {
				const target = $(ev.target);

				if (!target) {
					return;
				}

				const remove_option = target._parent(".remove_option", { skip: 0 });
				if (remove_option) {
					const ind = comp._data.option_ids.indexOf(+remove_option.dataset.option_id);
					if (ind !== -1) {
						comp._data.option_ids.splice(ind, 1);
					}
					comp._render();
				}
			});
		},
	});
}
