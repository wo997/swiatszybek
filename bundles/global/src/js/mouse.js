/* js[global] */

/**
 * @typedef {{
 * x: number
 * y: number
 * }} Position
 */

/**
 * @type {{
 * target: PiepNode | undefined
 * pos: Position
 * }}
 */
let mouse = {
	target: null,
	pos: {
		x: -100,
		y: -100,
	},
};

// use when necessary, theoretically a loop would be fine
function updateMouseTarget() {
	mouse.target = $(document.elementFromPoint(mouse.pos.x, mouse.pos.y));
}

function updateMouseCoords(event) {
	mouse.pos.x = event.clientX;
	mouse.pos.y = event.clientY;
	mouse.target = $(event.target);
}

document.addEventListener("mousemove", (event) => {
	updateMouseCoords(event);
});

// /**
//  * @type {PiepNode}
//  */
// let mouse_down_target = undefined;
// document.addEventListener("mousedown", (ev) => {
// 	mouse_down_target = $(ev.target);
// });
