/* js[piep_cms_dependencies] */
{
	piep_cms_manager.registerBlcSchema({
		id: "slider",
		icon: html`<i class="fas fa-images"></i>`,
		label: html`Slider`,
		group: "module",
		standalone: true,
		priority: 10,
		rerender_on: [""],
		render_html: (v_node) => {
			return html`
				<div class="wo997_slider">
					<div class="wo997_slides_container">
						<div class="wo997_slides_wrapper"></div>
					</div>
				</div>
			`;
		},
		place_node: (v_node, node, parent_node, piep_cms) => {
			console.log(v_node, node, parent_node, piep_cms);

			const wo997_slides_wrapper = parent_node._child(".wo997_slides_wrapper");

			const index = numberFromStr(v_node.module_hook_id);

			const before_node = wo997_slides_wrapper._direct_children()[index];
			if (node._parent() !== wo997_slides_wrapper || node !== before_node) {
				wo997_slides_wrapper.insertBefore(node, before_node);
			}
		},
		v_node: {
			tag: "div",
			id: -1,
			styles: {
				df: {
					height: "40vw",
				},
			},
			classes: [],
			attrs: {},
			settings: {},
			module_name: "slider",
			children: [
				{
					tag: "div",
					id: -1,
					styles: {},
					classes: ["vertical_container"],
					attrs: {},
					settings: {},
					module_hook_id: "slide_1",
					children: [],
				},
				{
					tag: "div",
					id: -1,
					styles: {},
					classes: ["vertical_container"],
					attrs: {},
					settings: {},
					module_hook_id: "slide_2",
					children: [],
				},
			],
		},
	});
}
