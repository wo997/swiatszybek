/* js[global] */

{
	const trait_name = "list_up_btn";
	registerCompTrait(trait_name, {
		template: /*html*/ `<button data-node="${trait_name}" class="btn subtle"><i class="fas fa-chevron-up"></i></button>`,
		initialize: (node) => {
			node._nodes[trait_name].addEventListener("click", () => {
				/** @type {ListComp} */
				// @ts-ignore
				const parent = node._parent_comp;
				if (parent._moveRow) {
					parent._moveRow(node._data.row_index, node._data.row_index - 1);
				}
			});
		},
		render: (node) => {
			node._nodes[trait_name].toggleAttribute(
				"disabled",
				node._data.row_index <= 0
			);
		},
	});
}
