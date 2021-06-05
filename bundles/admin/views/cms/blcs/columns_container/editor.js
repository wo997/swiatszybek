// /* js[piep_cms_dependencies] */
// {
// 	const columns_container_priority = 10;

// 	/**
// 	 *
// 	 * @param {vDomNodeData} v_node_data
// 	 * @returns
// 	 */
// 	const columnsContainerMatcher = (v_node_data) => {
// 		return v_node_data.v_node.classes.includes("columns_container");
// 	};

// 	piep_cms_manager.registerProp({
// 		name: "justify_content_horizontally",
// 		blc_groups: [
// 			{
// 				matcher: columnsContainerMatcher,
// 				priority: columns_container_priority,
// 			},
// 		],
// 		type_groups: ["layout"],
// 		menu_html: html`
// 			<div class="label">Wyrównaj zawartość poziomo</div>
// 			<div class="pretty_radio pretty_blue flex --columns:4 spiky" data-blc_prop="styles.justifyContent">
// 				<div class="checkbox_area empty">
// 					<p-checkbox data-value=""></p-checkbox>
// 					<span>-</span>
// 				</div>
// 				<div class="checkbox_area">
// 					<p-checkbox data-value="flex-start"></p-checkbox>
// 					<div class="flex_justify_content_horizontal_icon" style="justify-content:flex-start">
// 						<div></div>
// 						<div></div>
// 						<div></div>
// 					</div>
// 				</div>
// 				<div class="checkbox_area">
// 					<p-checkbox data-value="center"></p-checkbox>
// 					<div class="flex_justify_content_horizontal_icon" style="justify-content:center">
// 						<div></div>
// 						<div></div>
// 						<div></div>
// 					</div>
// 				</div>
// 				<div class="checkbox_area">
// 					<p-checkbox data-value="flex-end"></p-checkbox>
// 					<div class="flex_justify_content_horizontal_icon" style="justify-content:flex-end">
// 						<div></div>
// 						<div></div>
// 						<div></div>
// 					</div>
// 				</div>
// 				<div class="checkbox_area case_advanced">
// 					<p-checkbox data-value="space-around"></p-checkbox>
// 					<div class="flex_justify_content_horizontal_icon" style="justify-content:space-around">
// 						<div></div>
// 						<div></div>
// 						<div></div>
// 					</div>
// 				</div>
// 				<div class="checkbox_area case_advanced">
// 					<p-checkbox data-value="space-between"></p-checkbox>
// 					<div class="flex_justify_content_horizontal_icon" style="justify-content:space-between">
// 						<div></div>
// 						<div></div>
// 						<div></div>
// 					</div>
// 				</div>
// 				<div class="checkbox_area case_advanced">
// 					<p-checkbox data-value="space-evenly"></p-checkbox>
// 					<div class="flex_justify_content_horizontal_icon" style="justify-content:space-evenly">
// 						<div></div>
// 						<div></div>
// 						<div></div>
// 					</div>
// 				</div>
// 			</div>
// 		`,
// 	});

// 	piep_cms_manager.registerProp({
// 		name: "align_items_vertically",
// 		blc_groups: [
// 			{
// 				matcher: columnsContainerMatcher,
// 				priority: columns_container_priority,
// 			},
// 		],
// 		type_groups: ["layout"],
// 		menu_html: html`
// 			<div class="label">Wyrównaj zawartość pionowo</div>
// 			<div class="pretty_radio pretty_blue flex --columns:5 spiky" data-blc_prop="styles.alignItems">
// 				<div class="checkbox_area empty">
// 					<p-checkbox data-value=""></p-checkbox>
// 					<span>-</span>
// 				</div>
// 				<div class="checkbox_area">
// 					<p-checkbox data-value="flex-start"></p-checkbox>
// 					<div class="flex_align_items_vertical_icon" style="align-items:flex-start">
// 						<div></div>
// 						<div></div>
// 						<div></div>
// 					</div>
// 				</div>
// 				<div class="checkbox_area">
// 					<p-checkbox data-value="center"></p-checkbox>
// 					<div class="flex_align_items_vertical_icon" style="align-items:center">
// 						<div></div>
// 						<div></div>
// 						<div></div>
// 					</div>
// 				</div>
// 				<div class="checkbox_area">
// 					<p-checkbox data-value="flex-end"></p-checkbox>
// 					<div class="flex_align_items_vertical_icon" style="align-items:flex-end">
// 						<div></div>
// 						<div></div>
// 						<div></div>
// 					</div>
// 				</div>
// 				<div class="checkbox_area">
// 					<p-checkbox data-value="stretch"></p-checkbox>
// 					<div class="flex_align_items_vertical_icon" style="justify-content:stretch">
// 						<div></div>
// 						<div></div>
// 						<div></div>
// 					</div>
// 				</div>
// 			</div>
// 		`,
// 	});

// 	piep_cms_manager.registerBlcSchema({
// 		id: "columns_container",
// 		icon: html`<i class="columns_container_icon">
// 			<div></div>
// 			<div></div>
// 			<div></div>
// 		</i>`,
// 		label: html`Kontener z kolumnami`,
// 		group: "container",
// 		standalone: true,
// 		priority: 80,
// 		v_node: {
// 			tag: "div",
// 			id: -1,
// 			styles: {},
// 			classes: ["columns_container"],
// 			attrs: {},
// 			settings: {},
// 			children: [
// 				{
// 					id: -1,
// 					tag: "div",
// 					styles: { df: { width: "50%" } },
// 					attrs: {},
// 					classes: ["vertical_container"],
// 					children: [],
// 				},
// 				{
// 					id: -1,
// 					tag: "div",
// 					styles: { df: { width: "50%" } },
// 					attrs: {},
// 					classes: ["vertical_container"],
// 					children: [],
// 				},
// 			],
// 		},
// 	});
// }
