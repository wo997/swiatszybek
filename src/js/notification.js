/* js[global] */

function showNotification(message, params = {}) {
  $$(".notification").forEach((e) => {
    e.style.opacity = 0;
    e.style.top = "-10px";
  });
  var notification = document.createElement("DIV");
  notification.className = "notification";
  notification.insertAdjacentHTML(
    "beforeend",
    `
      <i class="fa fa-times-circle" onclick="dismissNotification(this.parent())"></i>
      ${message}
    `
  );
  notification.style.top = "-20px";
  notification.style.opacity = "0";
  if (params.width) {
    notification.style.width = params.width;
    notification.style.maxWidth = params.width;
  } else {
    notification.style.width = "auto";
    notification.style.maxWidth = "unset";
  }
  document.body.insertAdjacentElement("beforeend", notification);
  setTimeout(() => {
    notification.style.top = "";
    notification.style.opacity = "";
  });

  setTimeout(() => {
    dismissNotification(notification);
  }, 2000);
}

function dismissNotification(n) {
  if (!n) return;
  n.style.opacity = 0;
  n.style.pointerEvents = "none";
  setTimeout(() => {
    removeNode(n);
  }, 200);
}
