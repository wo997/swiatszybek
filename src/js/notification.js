/* js[global] */

function showNotification(message, params = {}) {
	$$(".notification").forEach((e) => {
		e.style.opacity = 0;
		e.style.top = "-10px";
	});
	var notification = $(document.createElement("DIV"));
	notification.className = "notification";
	notification.insertAdjacentHTML(
		"beforeend",
		`
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

	document.body.insertAdjacentElement("beforeend", notification);
	setTimeout(() => {
		notification.style.top = "";
		notification.style.opacity = "";
	});

	var duration = nonull(params.duration, 2000);

	notification.addDismissTimeout = () => {
		notification.timeout = setTimeout(() => {
			dismissParentNotification(notification);
		}, duration);
	};
	notification.addDismissTimeout();

	var timer = notification.find(".timer");
	if (timer) {
		timer.innerHTML = `<i class="fas fa-hourglass-half"></i> <span class='just-time'></span>`;
		var intervalCallback = () => {
			timer.find(".just-time").innerHTML = `${notification.time}s`;
			notification.time -= 1;
		};
		notification.time = duration / 1000;
		notification.interval = setInterval(intervalCallback, 1000);
		intervalCallback();
	} else {
		notification.addEventListener("mouseenter", () => {
			clearTimeout(notification.timeout);
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
