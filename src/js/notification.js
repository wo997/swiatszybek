/* js[global] */

/**
 * @typedef {Object} PiepNotificationData
 * @property {number} [countdown_timeout]
 * @property {number} [countdown_time]
 * @property {number} [countdown_interval]
 *
 * @typedef {PiepNotificationData & PiepNode} PiepNotification
 */
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
 * @returns {PiepNotification}
 */
function showNotification(message, params = {}) {
	//params.findAll(query)
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

	notification.classList.toggle("one_line", def(params.one_line, false));

	notification.classList.remove("success");
	if (params.type == "success") {
		notification.classList.add("success");
	}

	document.body.append(notification);
	setTimeout(() => {
		notification.style.top = "";
		notification.style.opacity = "";
	});

	const duration = def(params.duration, 2000);

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
			duration: duration,
			thickness: 3,
			color: "white",
		});
	} else {
		notification.addEventListener("mouseenter", () => {
			clearTimeout(notification.countdown_timeout);
		});
		notification.addEventListener("mouseleave", () => {
			notification.addDismissTimeout();
		});
	}

	return notification;
}

function dismissParentNotification(n) {
	if (!n) return;
	n = $(n)._parent(".notification");
	if (!n) return;

	n.style.opacity = 0;
	n.style.pointerEvents = "none";
	setTimeout(() => {
		n.remove();
	}, 200);
}
