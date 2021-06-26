/* js[piep_cms_dependencies] */
{
	/**
	 * @type {{
	 * description: string
	 * classes: string[]
	 * }[]}
	 */
	const icons = [
		{ classes: ["fas", "fa-chevron-right"], description: "strzałka szewron prawo" },
		{ classes: ["fas", "fa-chevron-left"], description: "strzałka szewron lewo" },
	];

	piep_cms_manager.registerProp({
		name: "fa_icon",
		blc_groups: [
			{
				module_names: ["fa_icon"],
				priority: 100,
			},
		],
		type_groups: ["advanced"],
		menu_html: html`
			<div class="label">Ikonka</div>
			<div class="pretty_radio global_root icon" style="--columns:8">
				${icons
					.map(
						(b) => html`
							<div class="checkbox_area">
								<p-checkbox data-value="${b.classes.join(" ")}"></p-checkbox>
								<i class="${b.classes.join(" ")}"></i>
							</div>
						`
					)
					.join("")}
			</div>
		`,
		init: (piep_cms, menu_wrapper) => {
			const icon_input = menu_wrapper._child(".icon");
			piep_cms.container.addEventListener("set_blc_menu", () => {
				const v_node = piep_cms.getFocusVNode();
				if (!v_node) {
					return;
				}
				let first_class = "";
				let second_class = "";
				v_node.classes.forEach((c) => {
					const icon = icons.find((i) => i.classes[0] === c);
					if (icon) {
						first_class = icon.classes[0];
					}
				});
				v_node.classes.forEach((c) => {
					const icon = icons.find((i) => i.classes[1] === c);
					if (icon) {
						second_class = icon.classes[1];
					}
				});
				icon_input._set_value(first_class + " " + second_class, { quiet: true });
			});
			icon_input.addEventListener("change", () => {
				const v_node = piep_cms.getFocusVNode();
				if (!v_node) {
					return;
				}
				/** @type {string} */
				const classes_str = icon_input._get_value();
				const classes = classes_str.split(" ");
				icons.forEach((i) => {
					const first_class = i.classes[0];
					const second_class = i.classes[1];
					if (first_class === classes[0]) {
						if (!v_node.classes.includes(first_class)) {
							v_node.classes.push(first_class);
						}
					} else {
						const ind = v_node.classes.indexOf(first_class);
						if (ind !== -1) {
							v_node.classes.splice(ind, 1);
						}
					}
					if (second_class === classes[1]) {
						if (!v_node.classes.includes(second_class)) {
							v_node.classes.push(second_class);
						}
					} else {
						const ind = v_node.classes.indexOf(second_class);
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
		id: "fa_icon",
		icon: html`<i class="fas fa-icons"></i>`,
		label: html`Ikonka`,
		group: "text",
		priority: 5,
		inline: true,
		v_node: {
			tag: "i",
			id: -1,
			styles: {},
			classes: ["fas", "fa-chevron-right"],
			module_name: "fa_icon",
			attrs: {},
		},
	});
}
