/* js[piep_cms_dependencies] */
{
	const grid_priority = 100;

	piep_cms_manager.registerBlcSchema({
		id: "slider",
		icon: html`<i class="fas fa-images"></i>`,
		label: html`Slider`,
		group: "module",
		standalone: true,
		priority: 10,
		rerender_on: [""],
		place_nodes: (v_node) => {
			//<div class="wo997_slide">Slide 1.</div>
		},
		render_html: (v_node) => {
			return html`
				<div class="wo997_slider">
					<div class="wo997_slides_container">
						<div class="wo997_slides_wrapper"></div>
					</div>
				</div>
			`;
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
			children: [],
		},
	});
}
