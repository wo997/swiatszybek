/* js[piep_cms_dependencies] */
{
	const vertical_container_priority = 10;

	/**
	 *
	 * @param {vDomNodeData} v_node_data
	 * @returns
	 */
	const inVerticalContainerMatcher = (v_node_data) => {
		const parent_v_node = v_node_data.parent_v_nodes[0];
		return !parent_v_node || parent_v_node.classes.includes("vertical_container");
	};

	/**
	 *
	 * @param {vDomNodeData} v_node_data
	 * @returns
	 */
	const verticalContainerMatcher = (v_node_data) => {
		return v_node_data.v_node.classes.includes("vertical_container");
	};

	/**
	 * @type {{
	 * label: string
	 * class_name: string
	 * }[]}
	 */
	const btns = [
		{ label: "Główny", class_name: "primary" },
		{ label: "Poboczny", class_name: "subtle" },
		{ label: "Przezroczysty", class_name: "transparent" },
		{ label: "Kup teraz", class_name: "buy_btn" },
	];

	piep_cms_manager.registerProp({
		name: "button_style",
		blc_groups: [
			{
				module_names: ["button"],
				priority: 100,
			},
		],
		type_groups: ["advanced"],
		menu_html: html`
			<div class="label">Styl przycisku</div>
			<div class="pretty_radio global_root btn_style" style="--columns:2">
				${btns
					.map(
						(b) => html`
							<div class="checkbox_area">
								<p-checkbox data-value="${b.class_name}"></p-checkbox>
								<button class="btn ${b.class_name} small">${b.label}</button>
							</div>
						`
					)
					.join("")}
			</div>
		`,
		init: (piep_cms, menu_wrapper) => {
			const btn_style = menu_wrapper._child(".btn_style");
			piep_cms.container.addEventListener("set_blc_menu", () => {
				// might be prone to bugs
				// if (menu_wrapper.classList.contains("hidden")) {
				// 	return;
				// }

				const v_node = piep_cms.getFocusVNode();
				if (!v_node) {
					return;
				}

				let btn_class = "";
				v_node.classes.forEach((c) => {
					const btn = btns.find((b) => b.class_name === c);
					if (btn) {
						btn_class = btn.class_name;
					}
				});

				btn_style._set_value(btn_class, { quiet: true });
			});

			btn_style.addEventListener("change", () => {
				const v_node = piep_cms.getFocusVNode();
				if (!v_node) {
					return;
				}

				const class_name = btn_style._get_value();

				btns.forEach((b) => {
					if (b.class_name === class_name) {
						if (!v_node.classes.includes(class_name)) {
							v_node.classes.push(class_name);
						}
					} else {
						const ind = v_node.classes.indexOf(b.class_name);
						if (ind !== -1) {
							v_node.classes.splice(ind, 1);
						}
					}
				});

				piep_cms.update({ dom: true });
			});
		},
	});

	piep_cms_manager.registerBlcSchema({
		id: "button",
		// <i class="vertical_container_icon">
		//     <div></div>
		//     <div></div>
		//     <div></div>
		// </i>
		icon: html`<i class="fas fa-hand-pointer"></i>`,
		label: html`Przycisk`,
		group: "module",
		priority: 50,
		inline: true,
		width_schema: "has_content",
		v_node: {
			tag: "button",
			id: -1,
			children: [
				// {
				// 	tag: "p",
				// 	id: -1,
				// 	styles: {},
				// 	classes: [],
				// 	attrs: {},
				// 	children: [
				{
					id: -1,
					tag: "span",
					text: "Przycisk",
					attrs: {},
					classes: [],
					styles: {},
				},
				//	],
				//},
			],
			styles: {
				df: {},
			},
			responsive_settings: {
				df: {
					width_type: "auto",
				},
			},
			classes: ["btn", "primary"],
			module_name: "button",
			attrs: {},
		},
	});
}
