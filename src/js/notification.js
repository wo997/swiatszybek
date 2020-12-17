/* js[global] */

// exclude start
class PiepNotification extends PiepNode {
	countdown_timeout;
	countdown_time;
	countdown_interval;
}
// exclude end

/**
 * @typedef {Object} PiepNotificationParams
 * @property {boolean} [one_line]
 * @property {string} [width]
 * @property {string} [type]
 * @property {number} [duration]
 */

/**
 *
 * @param {string} message
 * @param {PiepNotificationParams} params
 */
function showNotification(message, params = {}) {
	$$(".notification").forEach((e) => {
		e.style.opacity = 0;
		e.style.top = "-10px";
	});

	/** @type {PiepNotification} */
	// @ts-ignore
	const notification = $(document.createElement("DIV"));
	notification.className = "notification";
	notification.insertAdjacentHTML(
		"beforeend",
		/*html*/ `
            <i class="fas fa-times" onclick="dismissParentNotification(this)"></i>
            ${message}
        `
	);
	notification.style.top = "-20px";
	notification.style.opacity = "0";
	if (params.width) {
		notification.style.width = params.width;
		notification.style.maxWidth = params.width;
	} else {
		notification.style.width = "fit-content";
		notification.style.maxWidth = "unset";
	}

	notification.classList.toggle("one_line", nonull(params.one_line, false));

	notification.classList.remove("success");
	if (params.type == "success") {
		notification.classList.add("success");
	}

	document.body.append(notification);
	setTimeout(() => {
		notification.style.top = "";
		notification.style.opacity = "";
	});

	var duration = nonull(params.duration, 2000);

	// @ts-ignore
	notification.addDismissTimeout = () => {
		notification.countdown_timeout = setTimeout(() => {
			dismissParentNotification(notification);
		}, duration);
	};
	notification.addDismissTimeout();

	const countdown = notification.find(".countdown");
	if (countdown) {
		createCountdown(countdown, {
			size: 26,
			duration: 5000,
			thickness: 3,
			color: "white",
		});

		const intervalCallback = () => {
			countdown
				.find(".countdown_number")
				.setContent(notification.countdown_time);
			notification.countdown_time -= 1;
		};
		notification.countdown_time = Math.round(duration / 1000);
		notification.countdown_interval = setInterval(intervalCallback, 1000);
		intervalCallback();
	} else {
		notification.addEventListener("mouseenter", () => {
			clearTimeout(notification.countdown_timeout);
		});
		notification.addEventListener("mouseleave", () => {
			notification.addDismissTimeout();
		});
	}
}

function dismissParentNotification(n) {
	if (!n) return;
	n = $(n).findParentByClassName("notification");
	if (!n) return;

	n.style.opacity = 0;
	n.style.pointerEvents = "none";
	setTimeout(() => {
		n.remove();
	}, 200);
}
