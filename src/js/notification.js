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
 * type?: ("success" | "error")
 * duration?: number
 * }} params
 * @returns {PiepNotification}
 */
function showNotification(message, params = {}) {
	const top = 25;

	$$(".notification").forEach((e) => {
		e.style.pointerEvents = "none";
		e._animate(
			`
                0% {top:${top}px;opacity:1}
                100% {top:-20px;opacity:0}
            `,
			200,
			{
				callback: () => {
					e.remove();
				},
			}
		);
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

	notification.classList.toggle("success", params.type == "success");
	notification.classList.toggle("error", params.type == "error");

	document.body.append(notification);

	notification._animate(
		`
            0% {top:-20px;opacity:0}
            100% {top:${top}px;opacity:1}
        `,
		200,
		{
			callback: () => {
				notification.style.top = top + "px";
			},
		}
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
