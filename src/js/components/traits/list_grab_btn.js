/* js[global] */

/**
 * @type {{
 * row: PiepNode
 * grabbed_at_y: number
 * animate()
 * }}
 */
let list_grab = {
	row: undefined,
	grabbed_at_y: undefined,
	animate: () => {
		if (!list_grab.row) {
			return;
		}
		list_grab.row.style.transform = `translateY(${(mouse.pos.y - list_grab.grabbed_at_y).toFixed(1)}px)`;
		//mouse.pos.y
		//list_grab.row.classList.toggle("grabbed");
		requestAnimationFrame(list_grab.animate);
	},
};

document.addEventListener("mouseup", () => {
	//mouse.pos.y
	list_grab.row.style.transform = ``;
	list_grab.row.classList.remove("grabbed");
	list_grab.grabbed_at_y = undefined;
});

{
	const trait_name = "list_grab_btn";
	registerCompTrait(trait_name, {
		template: html`<button data-node="${trait_name}" class="btn subtle small"><i class="fas fa-grip-lines"></i></button>`,
		initialize: (comp) => {
			/** @type {PiepNode} */
			const n = comp._nodes[trait_name];
			n.addEventListener("mousedown", () => {
				// /** @type {ListComp} */
				// // @ts-ignore
				// const parent = comp._parent_comp;
				// console.log(parent);
				const list_row = comp._parent(".list_row");
				if (!list_row) {
					console.error("List row missing");
					return;
				}

				list_row.classList.add("grabbed");
				list_grab.row = list_row;
				list_grab.grabbed_at_y = mouse.pos.y;
				list_grab.animate();
			});
			if (n._parent(".no_actions")) {
				// ugh, event listeners?
				return;
			}
		},
	});
}

/**
 * @typedef {{
 * list_grab_btn: PiepNode
 * }} ListGrabBtnTraitNodes
 */
