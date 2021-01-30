/* js[global] */

{
	const trait_name = "list_delete_btn";
	registerComponentTrait(trait_name, {
		template: /*html*/ `<button data-node="${trait_name}" class="btn subtle"><i class="fas fa-trash"></i></button>`,
		initialize: (node) => {
			node._nodes[trait_name].addEventListener("click", () => {
				/** @type {ListComponent} */
				// @ts-ignore
				const parent = node.parent_component;
				if (parent._removeRow) {
					parent._removeRow(node._data.row_index);
				}
			});
		},
	});
}
