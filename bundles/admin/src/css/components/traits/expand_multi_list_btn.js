/* js[admin] */

{
	const trait_name = "expand_multi_list_btn";
	/** @type {ExpandMultiListBtnBtnTraitData} */
	let data;
	registerCompTrait(trait_name, {
		template: html`<button
			class="btn small {${data.expanded}?expanded subtle:primary}"
			data-tooltip="{${data.expanded ? "Zwiń podkategorie" : "Rozwiń podkategorie"}}"
			data-node="${trait_name}"
		>
			<i class="fas fa-chevron-right"></i>
		</button>`,
		initialize: (comp) => {
			const n = comp._nodes[trait_name];

			n.addEventListener("click", () => {
				comp._data.expanded = !comp._data.expanded;
				comp._render();
			});

			comp._child("list-comp").addEventListener("dropped_row", () => {
				if (comp._data.expanded) {
					return;
				}
				comp._data.expanded = true;
				comp._render();
			});
		},
		render: (comp) => {},
	});
}
/**
 * @typedef {{
 * expand_multi_list_btn: PiepNode
 * }} ExpandMultiListBtnBtnTraitNodes
 */

/**
 * @typedef {{
 * expanded: boolean
 * }} ExpandMultiListBtnBtnTraitData
 */
