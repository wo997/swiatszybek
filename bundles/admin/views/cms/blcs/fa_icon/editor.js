/* js[piep_cms_dependencies] */
{
	/**
	 * @type {{
	 * description: string
	 * classes: string[]
	 * }[]}
	 */
	const icons = [
		{ classes: ["fas", "fa-chevron-right"], description: "chevron right strzałka szewron prawo " },
		{ classes: ["fas", "fa-chevron-left"], description: "chevron left strzałka szewron lewo" },
		{ classes: ["fas", "fa-chevron-up"], description: "chevron up strzałka szewron góra" },
		{ classes: ["fas", "fa-chevron-down"], description: "chevron down strzałka szewron dół" },
		{ classes: ["fas", "fa-shopping-cart"], description: "shopping cart koszyk" },
		{ classes: ["fas", "fa-cart-plus"], description: "shopping cart plus add koszyk dodaj plus" },
		{ classes: ["fas", "fa-angle-double-right"], description: "angle double right podwójna strzałka prawo" },
		{ classes: ["fas", "fa-angle-double-left"], description: "angle double left podwójna strzałka lewo" },
		{ classes: ["fas", "fa-angle-double-up"], description: "angle double up podwójna strzałka góra" },
		{ classes: ["fas", "fa-angle-double-down"], description: "angle double down podwójna strzałka dół" },
		{ classes: ["fas", "fa-check"], description: "check podwójna strzałka dół" },
		{ classes: ["fas", "fa-times"], description: "times krzyżyk razy" },
		{ classes: ["fas", "fa-ellipsis-h"], description: "ellipsis horizontal wielokropek poziomy" },
		{ classes: ["fas", "fa-ellipsis-v"], description: "ellipsis vertical wielokropek pionowy" },
		{ classes: ["fas", "fa-thumbs-up"], description: "thumbs up like polubienie" },
		{ classes: ["fab", "fa-facebook-f"], description: "facebook" },
		{ classes: ["fab", "fa-facebook"], description: "facebook" },
		{ classes: ["fab", "fa-facebook-messenger"], description: "facebook messenger" },
		{ classes: ["fab", "fa-instagram-square"], description: "instagram" },
		{ classes: ["fab", "fa-instagram"], description: "instagram" },
		{ classes: ["fab", "fa-twitter"], description: "twitter" },
		{ classes: ["fab", "fa-twitter-square"], description: "twitter" },
		{ classes: ["fab", "fa-youtube"], description: "youtube" },
		{ classes: ["fab", "fa-youtube-square"], description: "youtube" },
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
					piep_cms.removeClasses(v_node, ...i.classes);
				});
				piep_cms.addClasses(v_node, ...classes);
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
		layout_schema: "just_content",
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
