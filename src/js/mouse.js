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
		x: 0,
		y: 0,
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

if (!IS_TOUCH_DEVICE) {
	this.container.addEventListener("mousemove", (event) => {
		updateMouseCoords(event);
		this.mouseMove();
	});
}
