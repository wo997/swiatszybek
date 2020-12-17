/* js[global] */

// exclude start

class CountdownOptions {
	size;
	duration;
	thickness;
	color;
}

// exclude end

/**
 * @param {PiepNode} node
 * @param {CountdownOptions} options
 */
// @ts-ignore
function createCountdown(node, options = {}) {
	const size = nonull(options.size, 40);
	const thickness = nonull(options.thickness, 4);
	const actual_radius = size * 0.5 - thickness * 0.5;
	const length = actual_radius * 2 * Math.PI;
	const color = nonull(options.color, "black");

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
}
