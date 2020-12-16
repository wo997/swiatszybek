/* js[tool_newCms] */

class NewCmsTrashBlock {
	/**
	 * @param {NewCms} newCms
	 * @param {PiepNode} node
	 */
	constructor(newCms, node) {
		this.newCms = newCms;
		this.node = node;
		this.init();

		this.newCms.container.addEventListener("edit", (event) => {
			this.init();
		});

		this.animateTrash();
	}

	init() {
		this.position_x = 300;
		this.position_y = window.innerHeight + 40;
	}

	animateTrash() {
		let target_x = 300;
		let target_y = 300;
		if (this.newCms.grabbed_block) {
			target_y = window.innerHeight - 100;

			const dx = target_x - this.newCms.mouse_x;
			const dy = target_y - this.newCms.mouse_y;

			const len = Math.sqrt(dx * dx + dy * dy);
			if (len < 120 && len > 0.01) {
				const x = len / 120;
				const power = ((x * (1 - x) * x * (1 - x)) / (x + 0.1)) * 200;

				const vx = dx / len;
				const vy = dy / len;
				target_x -= vx * power;
				target_y -= vy * power;
			}
		} else {
			target_y = window.innerHeight + 100;
		}
		this.node.classList.toggle(
			"visible",
			!(!this.newCms.grabbed_block && this.newCms.grab_options.remove)
		);

		const speed = 0.2;
		this.position_x = this.position_x * (1 - speed) + target_x * speed;
		this.position_y = this.position_y * (1 - speed) + target_y * speed;

		this.node.style.transform = `translate(calc(${this.position_x}px - 50%), calc(${this.position_y}px - 50%))`;
		this.newCms.updateMouseTarget();

		requestAnimationFrame(() => {
			this.animateTrash();
		});
	}
}
