/* js[global] */

/**
 * @typedef {Object} CountdownOptions
 * @property {number} duration
 * @property {number} [size]
 * @property {number} [thickness]
 * @property {string} [color]
 */

/**
 * @param {PiepNode} node
 * @param {CountdownOptions} options
 */
function createCountdown(node, options) {
	const size = def(options.size, 40);
	const thickness = def(options.thickness, 4);
	const actual_radius = size * 0.5 - thickness * 0.5;
	const length = actual_radius * 2 * Math.PI;
	const color = def(options.color, "black");

	node.setContent(/*html*/ `
        <div class="countdown" style="
            --countdown_size:${size}px;
            --countdown_thickness:${thickness};
            --countdown_length:${length}px;
            --countdown_duration:${options.duration}ms;
            --countdown_color:${color};
        ">
            <div class="countdown_number"></div>
            <svg>
                <circle
                    r="${actual_radius}"
                    cx="${size * 0.5}"
                    cy="${size * 0.5}"></circle>
            </svg>
        </div>
    `);

	const countdown_number = node._child(".countdown_number");

	let countdown_time = Math.round(options.duration / 1000);

	const intervalCallback = () => {
		countdown_number.setContent(countdown_time);
		countdown_time -= 1;
		if (countdown_time <= 0) {
			clearInterval(interval);
		}
	};
	const interval = setInterval(intervalCallback, 1000);
	intervalCallback();
}
