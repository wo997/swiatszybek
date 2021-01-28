/* js[global] */

function showMessageModal(message, options) {
	$("#messagebox_modal > .modal-body > *")._set_content(message);
	showModal("messagebox_modal", options);
}

/**
 *
 * @param {{
 * type?: ("success" | "error")
 * header?: string
 * body?: string
 * footer?: string
 * }} params
 */
function getMessageHTML(params = {}) {
	let html = "";

	const header_color =
		params.type === "error" ? "var(--error-clr)" : "var(--success-clr)";

	const header_icon =
		params.type === "error"
			? /*html*/ `<i class='fas fa-times-circle'></i>`
			: /*html*/ `<i class='fas fa-check-circle'></i>`;

	params.header = def(
		params.header,
		params.type === "error" ? "Coś poszło nie tak" : "Udało się!"
	);

	html += /*html*/ `
        <div class='messagebox_header' style='background:${header_color}'>
            ${header_icon} ${params.header}
        </div>
    `;

	if (params.body) {
		html += /*html*/ `<div class='messagebox_body'>${params.body}</div>`;
	}

	if (!params.footer) {
		params.footer = `<button class='btn subtle medium' onclick='hideParentModal(this)' style='width:80px'>Ok</button>`;
	}

	html += /*html*/ `<div class='messagebox_footer'>${params.footer}</div>`;

	return html;
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
		? /*html*/ `
            <button class="btn transparent dismiss_btn" onclick="toggleMessageBox($(this)._parent()._parent()._parent(), false)">
                <i class="fas fa-times"></i>
            </button>
        `
		: "";

	elem._set_content(/*html*/ `
        <div class="messagebox expand_y hidden animate_hidden">
            <div class="message-container ${types[type].className}
                ${inline ? "inline" : ""}"
                >
                    ${types[type].icon}
                    <span style="margin: 0 3px;">
                        ${message}
                    </span>
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
