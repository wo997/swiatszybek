/* js[global] */

window.addEventListener("DOMContentLoaded", function () {
  registerModals();
});
function registerModals() {
  $$("[data-modal]").forEach((e) => {
    registerModal(e);
  });
}

function registerModalContent(html, callback) {
  if (!document.body) {
    window.addEventListener("DOMContentLoaded", function () {
      registerModalContent(html, callback);
      return;
    });
  }

  try {
    var div = document.createElement("DIV");
    div.insertAdjacentHTML("afterbegin", html);
    var modal = div.children[0];
    if ($("#" + modal.id)) throw "modal defined already";
    modal.setAttribute("data-modal", "true");
    registerModal(modal);
    if (callback) callback();
  } catch (e) {
    console.warn(e);
  }
}

function registerModal(e) {
  $("#modal-wrapper .modal-content").appendChild(e);
  e.style.display = "none";
  e.style.pointerEvents = "none";
}

var modalHideCallbacks = {};

function showModal(name = null, params = {}) {
  // setModalInitialState(name);
  modalHideCallbacks[name] = params.hideCallback;

  var m = $("#modal-wrapper");
  var visible = name != null;
  m.classList.toggle("displayModal", visible);
  if (visible) {
    var total = 0;
    m.findAll(".modal-content > *").forEach((e) => {
      var shownow = false;
      if (e.id == name && e.style.display == "none") {
        e.style.display = "";
        e.style.pointerEvents = "";
        shownow = true;
      }
      if (e.style.display != "none") {
        if (e.getAttribute("data-expand") == "large") {
          total = 1;
        } else {
          total++;
        }
      }

      if (shownow) {
        var node = e;
        m.find(".modal-content").appendChild(node);
        if (params.source) {
          var r = params.source.getBoundingClientRect();
          var p = $(".modal-content").getBoundingClientRect();
          var x = 1 * (r.left - p.left) + r.width / 2;
          var y = 1 * (r.top - p.top) + r.height / 2;
          node.style.transformOrigin = `${x}px ${y}px`;
        } else node.style.transformOrigin = ``;
        node.style.transition = "0s";
        node.style.transform = "scale(0.5)";
        e.style.opacity = 0;
        setTimeout(() => {
          e.style.opacity = 1;
          node.style.transition = "";
          node.style.transform = "";
        }, 0);
      }
    });
    var modal = $(`#${name}`);
    if (modal.hasAttribute("data-expand")) {
      var q = $(`#${name} > div`);
      if (q) {
        if (window.innerWidth >= 800) {
          if (modal.getAttribute("data-expand") == "large") total = 0; //total--;
          q.classList.toggle("pad0", total == 0);
          q.classList.toggle("pad1", total == 1);
          q.classList.toggle("pad2", total == 2);
          q.classList.toggle("pad3", total >= 3);
        } else {
          q.classList.toggle("pad0", false);
          q.classList.toggle("pad1", false);
          q.classList.toggle("pad2", false);
          q.classList.toggle("pad3", false);
        }
      }
    }
  }

  toggleBodyScroll(visible);

  return visible;
}

function hideAllModals() {
  $$("#modal-wrapper .modal-content > *").forEach((e) => {
    hideModal(e.id);
  });

  toggleBodyScroll(true);
}

function hideModalTopMost() {
  var o = $$("#modal-wrapper .modal-content > *");
  for (i = o.length - 1; i >= 0; i--) {
    var modal = o[i];
    if (modal.style.display != "none") {
      hideModal(modal ? modal.id : null);
      break;
    }
  }
}

function hideParentModal(obj = null, isCancel = false) {
  if (obj) {
    var modal = findParentByAttribute(obj, "data-modal");
    hideModal(modal ? modal.id : null, isCancel);
  }
  hideModal(null);
}

function hideModal(name, isCancel = false) {
  if (isCancel) {
    if (!checkFormCloseWarning(name)) {
      return false;
    }
  }

  var m = $("#modal-wrapper");

  if (name) {
    var modal = $(`#${name}`);
    if (modal) {
      modal.style.animation = "fadeOut 0.4s";
      visibleModalCount--;
      setTimeout(() => {
        modal.style.display = "none";
        modal.style.pointerEvents = "none";
        modal.style.animation = "";
      }, 200);
    }

    // cleanup validators
    modal.findAll("[data-validate]").forEach((e) => {
      if (e.classList.contains("required")) {
        e.removeEventListener("input", checkRemoveRequired);
        e.removeEventListener("change", checkRemoveRequired);
        e.classList.remove("required");
      }
    });

    modal.findAll(".fa-exclamation-triangle").forEach((e) => {
      e.remove();
    });

    const hideCallback = modalHideCallbacks[name];
    if (hideCallback) {
      hideCallback();
    }
  }

  var visibleModalCount = 0;
  m.findAll(".modal-content > *").forEach((e) => {
    if (e.style.display == "" && e.style.animation == "") visibleModalCount++;
  });

  if (visibleModalCount > 0) {
    m.classList.add("displayModal");
  } else {
    toggleBodyScroll(false);
    m.style.animation = "fadeOut 0.4s";
    setTimeout(() => {
      m.classList.remove("displayModal");
      m.style.animation = "";
    }, 200);
  }
}

function isModalActive(name) {
  var next = $(`#${name}`);
  var anythingAbove = false;
  if (next.style.display != "") {
    return false;
  }
  while (true) {
    next = next.next();
    if (!next) {
      break; // top most :)
    }
    var nextVisible = next.style.display == "";
    if (nextVisible) {
      anythingAbove = true;
      break;
    }
  }
  return !anythingAbove;
}

function setModalTitle(modal, title) {
  $(modal).find(`.custom-toolbar .title`).innerHTML = title;
}
