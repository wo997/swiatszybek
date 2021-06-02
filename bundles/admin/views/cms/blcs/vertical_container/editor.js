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

	piep_cms_manager.registerProp({
		name: "align_self_horizontally",
		blc_groups: [
			{
				matcher: inVerticalContainerMatcher,
				priority: vertical_container_priority,
			},
		],
		type_groups: ["layout"],
		menu_html: html`
			<div class="label">Wyrównaj blok poziomo</div>
			<div class="pretty_radio pretty_blue flex columns_5 spiky" data-blc_prop="styles.alignSelf">
				<div class="checkbox_area empty">
					<p-checkbox data-value=""></p-checkbox>
					<span>-</span>
				</div>
				<div class="checkbox_area">
					<p-checkbox data-value="flex-start"></p-checkbox>
					<div class="flex_align_self_horizontal_icon" style="align-items:flex-start"></div>
				</div>
				<div class="checkbox_area">
					<p-checkbox data-value="center"></p-checkbox>
					<div class="flex_align_self_horizontal_icon" style="align-items:center"></div>
				</div>
				<div class="checkbox_area">
					<p-checkbox data-value="flex-end"></p-checkbox>
					<div class="flex_align_self_horizontal_icon" style="align-items:flex-end"></div>
				</div>
				<div class="checkbox_area" data-tooltip="Efekt widoczny jeśli nie została określona szerokość">
					<p-checkbox data-value="stretch"></p-checkbox>
					<div class="flex_align_self_horizontal_icon" style="align-items:stretch"></div>
				</div>
			</div>
		`,
	});

	piep_cms_manager.registerProp({
		name: "align_self_vertically",
		blc_groups: [
			{
				matcher: verticalContainerMatcher,
				priority: vertical_container_priority,
			},
		],
		type_groups: ["layout"],
		menu_html: html`
			<div class="label">Wyrównaj blok pionowo</div>
			<div class="pretty_radio pretty_blue flex columns_5 spiky" data-blc_prop="styles.alignSelf">
				<div class="checkbox_area empty">
					<p-checkbox data-value=""></p-checkbox>
					<span>-</span>
				</div>
				<div class="checkbox_area">
					<p-checkbox data-value="flex-start"></p-checkbox>
					<div class="flex_align_self_vertical_icon" style="align-items:flex-start"></div>
				</div>
				<div class="checkbox_area">
					<p-checkbox data-value="center"></p-checkbox>
					<div class="flex_align_self_vertical_icon" style="align-items:center"></div>
				</div>
				<div class="checkbox_area">
					<p-checkbox data-value="flex-end"></p-checkbox>
					<div class="flex_align_self_vertical_icon" style="align-items:flex-end"></div>
				</div>
				<div class="checkbox_area" data-tooltip="Efekt widoczny jeśli nie została określona wysokość">
					<p-checkbox data-value="stretch"></p-checkbox>
					<div class="flex_align_self_vertical_icon" style="align-items:stretch"></div>
				</div>
			</div>
		`,
		init: (piep_cms) => {
			piep_cms.side_menu._child(".prop_align_self_vertically").classList.add("case_advanced");
		},
	});

	piep_cms_manager.registerProp({
		name: "justify_content_vertically",
		blc_groups: [
			{
				matcher: verticalContainerMatcher,
				priority: vertical_container_priority,
			},
		],
		type_groups: ["layout"],
		menu_html: html`
			<div class="label">Wyrównaj zawartość pionowo</div>
			<div class="pretty_radio pretty_blue flex columns_4 spiky" data-blc_prop="styles.justifyContent">
				<div class="checkbox_area empty">
					<p-checkbox data-value=""></p-checkbox>
					<span>-</span>
				</div>
				<div class="checkbox_area">
					<p-checkbox data-value="flex-start"></p-checkbox>
					<div class="flex_justify_content_vertical_icon" style="justify-content:flex-start">
						<div></div>
						<div></div>
						<div></div>
					</div>
				</div>
				<div class="checkbox_area">
					<p-checkbox data-value="center"></p-checkbox>
					<div class="flex_justify_content_vertical_icon" style="justify-content:center">
						<div></div>
						<div></div>
						<div></div>
					</div>
				</div>
				<div class="checkbox_area">
					<p-checkbox data-value="flex-end"></p-checkbox>
					<div class="flex_justify_content_vertical_icon" style="justify-content:flex-end">
						<div></div>
						<div></div>
						<div></div>
					</div>
				</div>
				<div class="checkbox_area case_advanced">
					<p-checkbox data-value="space-around"></p-checkbox>
					<div class="flex_justify_content_vertical_icon" style="justify-content:space-around">
						<div></div>
						<div></div>
						<div></div>
					</div>
				</div>
				<div class="checkbox_area case_advanced">
					<p-checkbox data-value="space-between"></p-checkbox>
					<div class="flex_justify_content_vertical_icon" style="justify-content:space-between">
						<div></div>
						<div></div>
						<div></div>
					</div>
				</div>
				<div class="checkbox_area case_advanced">
					<p-checkbox data-value="space-evenly"></p-checkbox>
					<div class="flex_justify_content_vertical_icon" style="justify-content:space-evenly">
						<div></div>
						<div></div>
						<div></div>
					</div>
				</div>
			</div>
		`,
	});

	piep_cms_manager.registerProp({
		name: "align_items_horizontally",
		blc_groups: [
			{
				matcher: verticalContainerMatcher,
				priority: vertical_container_priority,
			},
		],
		type_groups: ["layout"],
		menu_html: html`
			<div class="label">Wyrównaj zawartość poziomo</div>
			<div class="pretty_radio pretty_blue flex columns_5 spiky" data-blc_prop="styles.alignItems">
				<div class="checkbox_area empty">
					<p-checkbox data-value=""></p-checkbox>
					<span>-</span>
				</div>
				<div class="checkbox_area">
					<p-checkbox data-value="flex-start"></p-checkbox>
					<div class="flex_align_items_horizontal_icon" style="align-items:flex-start">
						<div></div>
						<div></div>
						<div></div>
					</div>
				</div>
				<div class="checkbox_area">
					<p-checkbox data-value="center"></p-checkbox>
					<div class="flex_align_items_horizontal_icon" style="align-items:center">
						<div></div>
						<div></div>
						<div></div>
					</div>
				</div>
				<div class="checkbox_area">
					<p-checkbox data-value="flex-end"></p-checkbox>
					<div class="flex_align_items_horizontal_icon" style="align-items:flex-end">
						<div></div>
						<div></div>
						<div></div>
					</div>
				</div>
				<div class="checkbox_area">
					<p-checkbox data-value="stretch"></p-checkbox>
					<div class="flex_align_items_horizontal_icon" style="justify-content:stretch">
						<div></div>
						<div></div>
						<div></div>
					</div>
				</div>
			</div>
		`,
	});

	piep_cms_manager.registerBlcSchema({
		id: "vertical_container",
		icon: html`<i class="vertical_container_icon">
			<div></div>
			<div></div>
			<div></div>
		</i>`,
		label: html`Kontener pionowy`,
		priority: 80,
		v_node: {
			tag: "div",
			id: -1,
			children: [],
			styles: {},
			classes: ["vertical_container"],
			attrs: {},
		},
	});
}
