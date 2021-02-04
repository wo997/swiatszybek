/* js[global] */

{
	const trait_name = "list_up_btn";
	registerCompTrait(trait_name, {
		template: html`<button data-node="${trait_name}" class="btn subtle small"><i class="fas fa-chevron-up"></i></button>`,
		initialize: (comp) => {
			comp._nodes[trait_name].addEventListener("click", () => {
				/** @type {ListComp} */
				// @ts-ignore
				const parent = comp._parent_comp;
				if (parent._moveRow) {
					parent._moveRow(comp._data.row_index, comp._data.row_index - 1);
				}
			});
		},
		render: (comp) => {
			comp._nodes[trait_name].toggleAttribute("disabled", comp._data.row_index <= 0);
		},
	});
}
