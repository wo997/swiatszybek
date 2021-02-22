/* js[global] */

{
	const trait_name = "list_delete_btn";
	registerCompTrait(trait_name, {
		template: html`<button data-node="${trait_name}" class="btn subtle small"><i class="fas fa-trash"></i></button>`,
		initialize: (comp) => {
			const n = comp._nodes[trait_name];
			n.addEventListener("click", () => {
				/** @type {ListComp} */
				// @ts-ignore
				const parent = comp._parent_comp;
				if (parent._remove_row) {
					parent._remove_row(comp._data.row_index);
				}
			});
		},
	});
}

/**
 * @typedef {{
 * list_delete_btn: PiepNode
 * }} ListDeleteBtnTraitNodes
 */
