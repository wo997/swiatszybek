/* js[global] */

function showMessageModal(message, options = {}) {
	$("#messageboxModal > .modal_body > *")._set_content(message);
	showModal("messageboxModal", options);
}

/**
 *
 * @param {{
 * type?: ("success" | "error" | "info")
 * header?: string
 * body?: string
 * footer?: string
 * }} params
 */
function getMessageHTML(params = {}) {
	let message_html = "";

	let header_color = "";
	let header_icon = "";

	if (params.type === "info") {
		header_icon = html`<i class="fas fa-info-circle"></i>`;
		header_color = "var(--info-clr)";
		if (!params.header) {
			params.header = "Ciekawe";
		}
	} else if (params.type === "error") {
		header_icon = html`<i class="fas fa-exclamation-circle"></i>`;
		header_color = "var(--error-clr)";
		params.header = "Coś poszło nie tak";
	} else {
		header_icon = html`<i class="fas fa-check-circle"></i>`;
		header_color = "var(--success-clr)";
		params.header = "Udało się!";
	}

	message_html += html`<div class="messagebox_header" style="background:${header_color}">${params.header} ${header_icon}</div> `;

	if (params.body !== undefined) {
		message_html += html`<div class="messagebox_body">${params.body}</div>`;
	}

	if (params.footer === undefined) {
		params.footer = `<button class='btn subtle' onclick='hideParentModal(this)' style='width:80px'>Ok</button>`;
	}

	message_html += html`<div class="messagebox_footer">${params.footer}</div>`;

	return message_html;
}

/**
 *
 * @param {*} elem
 * @param {*} message
 * @param {{
 * type?: ("info" | "error" | "success")
 * show?: boolean
 * inline?: boolean
 * dismissable?: boolean
 * instant?: boolean
 * }} params
 */
function addMessageBox(elem, message, params = {}) {
	elem = $(elem);

	var mb = elem._child(".messagebox");
	if (mb) {
		toggleMessageBox(elem, false, {
			callback: () => {
				mb.remove();
				addMessageBox(elem, message, params);
			},
		});
		return;
	}

	const type = def(params.type, "info");
	const show = def(params.show, true);
	const inline = def(params.inline, false);

	const types = {
		// default type
		info: {
			className: "",
			icon: "<i class='fas fa-info-circle'></i>",
		},
		warning: {
			className: "warning",
			icon: "<i class='fas fa-exclamation-circle'></i>",
		},
	};

	const dismiss_btn = params.dismissable
		? html`
				<button class="btn transparent dismiss_btn" onclick="toggleMessageBox($(this)._parent()._parent()._parent(), false)">
					<i class="fas fa-times"></i>
				</button>
		  `
		: "";

	elem._set_content(html`
		<div class="messagebox expand_y hidden animate_hidden">
			<div
				class="message-container ${types[type].className}
                ${inline ? "inline" : ""}"
			>
				${types[type].icon}
				<span style="margin: 0 3px;"> ${message} </span>
				${dismiss_btn}
			</div>
		</div>
	`);

	if (show) {
		let options = {};
		if (params.instant) {
			options.instant = params.instant;
		}
		toggleMessageBox(elem, true, options);
	}
}

function toggleMessageBox(elem, show = null, options = {}) {
	elem = $(elem);
	var duration = options.instant ? 0 : 350;
	expand(elem._child(".messagebox"), show, {
		duration: duration,
	});
	if (options.callback) {
		setTimeout(() => {
			options.callback();
		}, duration);
	}
}

domload(() => {
	registerModalContent(html`
		<div id="messageboxModal" class="messageboxModal" data-dismissable>
			<div class="modal_body">
				<div></div>
			</div>
		</div>
	`);
});
