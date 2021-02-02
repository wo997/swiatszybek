/* js[global] */

{
	const trait_name = "list_delete_btn";
	registerCompTrait(trait_name, {
		template: /*html*/ `<button data-node="${trait_name}" class="btn subtle"><i class="fas fa-trash"></i></button>`,
		initialize: (comp) => {
			comp._nodes[trait_name].addEventListener("click", () => {
				/** @type {ListComp} */
				// @ts-ignore
				const parent = comp._parent_comp;
				if (parent._removeRow) {
					parent._removeRow(comp._data.row_index);
				}
			});
		},
	});
}
