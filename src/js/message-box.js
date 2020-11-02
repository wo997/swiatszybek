/* js[global] */

function addMessageBox(elem, message, params = {}) {
  elem = $(elem);

  var mb = elem.find(".message-box");
  if (mb) {
    toggleMessageBox(elem, false, {
      callback: () => {
        mb.remove();
        addMessageBox(elem, message, params);
      },
    });
    return;
  }

  const type = nonull(params.type, "info");
  const show = nonull(params.show, true);
  const inline = nonull(params.inline, false);

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
          <button class="btn transparent" onclick="toggleMessageBox($(this).parent().parent().parent(), false)">
            <img class='cross-icon' src='/src/img/cross.svg'>
          </button>
        `
    : "";

  elem.setContent(`
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
  $("#message-modal .modal-message").setContent(message);
  showModal("message-modal", options);
}

function toggleMessageBox(elem, show = null, options = {}) {
  elem = $(elem);
  var duration = options.instant ? 0 : 350;
  expand(elem.find(".message-box"), show, {
    duration: duration,
  });
  if (options.callback) {
    setTimeout(() => {
      options.callback();
    }, duration);
  }
}
