/* js[global] */

{
	const trait_name = "list_down_btn";
	registerComponentTrait(trait_name, {
		template: /*html*/ `<button data-node="${trait_name}" class="btn subtle"><i class="fas fa-chevron-down"></i></button>`,
		initialize: (node) => {
			node._nodes[trait_name].addEventListener("click", () => {
				/** @type {ListComponent} */
				// @ts-ignore
				const parent = node.parent_component;
				if (parent._moveRow) {
					parent._moveRow(node._data.row_index, node._data.row_index + 1);
				}
			});
		},
		render: (node) => {
			node._nodes[trait_name].toggleAttribute(
				"disabled",
				node._data.row_index >= node._data.list_length - 1
			);
		},
	});
}
