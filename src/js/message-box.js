/* js[global] */

function addMessageBox(elem, message, params = {}) {
	elem = $(elem);

	var mb = elem._child(".message-box");
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

	var dismiss_btn = params.dismissable
		? `
          <button class="btn transparent" onclick="toggleMessageBox($(this)._parent()._parent()._parent(), false)">
            <img class='cross-icon' src='/src/img/cross.svg'>
          </button>
        `
		: "";

	elem._set_content(`
        <div class="message-box expand_y hidden animate_hidden">
          <div class="message-container ${types[type].className} ${
		inline ? "inline" : ""
	}"
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
		var options = {};
		if (params.instant) {
			options.instant = params.instant;
		}
		toggleMessageBox(elem, true, options);
	}
}

function showMessageModal(message, options) {
	$("#message-modal .modal-message")._set_content(message);
	showModal("message-modal", options);
}

function toggleMessageBox(elem, show = null, options = {}) {
	elem = $(elem);
	var duration = options.instant ? 0 : 350;
	expand(elem._child(".message-box"), show, {
		duration: duration,
	});
	if (options.callback) {
		setTimeout(() => {
			options.callback();
		}, duration);
	}
}
