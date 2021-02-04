/* js[global] */

/**
 * @typedef {{
 * countdown_timeout?: number
 * countdown_time?: number
 * countdown_interval?: number
 * addDismissTimeout()
 * } & PiepNode} PiepNotification
 */

/**
 *
 * @param {string} message
 * @param {{
 * one_line?: boolean
 * width?: string
 * type?: string
 * duration?: number
 * }} params
 * @returns {PiepNotification}
 */
function showNotification(message, params = {}) {
	$$(".notification").forEach((e) => {
		e.style.opacity = "0";
		e.style.top = "-10px";
	});

	/** @type {PiepNotification} */
	// @ts-ignore
	const notification = $(document.createElement("DIV"));
	notification.className = "notification";
	notification.insertAdjacentHTML(
		"beforeend",
		html`
			<i class="fas fa-times" onclick="dismissParentNotification(this)"></i>
			${message}
		`
	);
	if (params.width) {
		notification.style.width = params.width;
		notification.style.maxWidth = params.width;
	} else {
		notification.style.width = "";
		notification.style.maxWidth = "unset";
	}

	notification.classList.toggle("one_line", def(params.one_line, false));

	notification.classList.remove("success");
	if (params.type == "success") {
		notification.classList.add("success");
	}

	document.body.append(notification);

	notification.style.top = "";
	notification.style.opacity = "";
	notification._animate(
		`
            0% {top:-20px;opacity:0}
            100% {top:${notification.getBoundingClientRect().top}px;opacity:1}
        `,
		200
	);

	const duration = def(params.duration, 2000);

	// @ts-ignore
	notification.addDismissTimeout = () => {
		notification.countdown_timeout = setTimeout(() => {
			dismissParentNotification(notification);
		}, duration);
	};
	notification.addDismissTimeout();

	const countdown = notification._child(".countdown");
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
	n = $(n)._parent(".notification", { skip: 0 });
	if (!n) return;

	n.style.animation = "hide 200ms";
	setTimeout(() => {
		n.remove();
	}, 200);
}
