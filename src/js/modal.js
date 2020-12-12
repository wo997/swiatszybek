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

	var div = document.createElement("DIV");
	div.insertAdjacentHTML("afterbegin", html);
	var modal = $(div.children[0]);
	if ($("#" + modal.id)) {
		console.error("modal defined already");
		return;
	}
	modal.setAttribute("data-modal", "true");
	registerModal(modal);
	if (callback) {
		callback(modal);
	}
}

function registerModal(e) {
	$("#modal-wrapper .modal-content").appendChild(e);
}

function showModal(name = null, params = {}) {
	var modal_wrapper = $("#modal-wrapper");
	var visible = name != null;
	modal_wrapper.classList.toggle("visible", visible);
	if (visible) {
		var total = 0;
		modal_wrapper.findAll(".modal-content > *").forEach((modal) => {
			var shownow = false;
			if (modal.id == name && !modal.classList.contains("visible")) {
				shownow = true;
			}
			if (modal.classList.contains("visible")) {
				var expand = modal.getAttribute("data-expand");
				if (expand == "large") {
					total = 1;
				} else if (expand == "previous") {
					// same
				} else {
					total++;
				}
			}

			if (shownow) {
				clearAllErrors(modal);
				modal_wrapper.find(".modal-content").appendChild(modal);
				let origin = "center";
				if (params.source) {
					var r = params.source.getBoundingClientRect();
					var p = $(".modal-content").getBoundingClientRect();
					var x = 1 * (r.left - p.left) + r.width / 2;
					var y = 1 * (r.top - p.top) + r.height / 2;
					origin = `${x}px ${y}px`;
				}
				modal.style.transformOrigin = origin;
				modal.classList.add("visible");
				modal.style.pointerEvents = "none";

				animate(
					modal,
					`
                        0% {
                            transform: scale(0.5);
                            opacity: 0;
                        }
                        100% {
                            transform: scale(1);
                            opacity: 1;
                        }
                    `,
					300,
					() => {
						if (params.callback) {
							modal.style.pointerEvents = "";
							params.callback();
						}
					}
				);

				var event = new CustomEvent("modal-show", {
					detail: {
						node: modal,
					},
				});
				window.dispatchEvent(event);
			}
		});
		var modal = $(`#${name}`);
		if (modal && modal.hasAttribute("data-expand")) {
			var q = $(`#${name} > div`);
			if (q) {
				if (modal.getAttribute("data-expand") == "large") total = 0; //total--;
				q.classList.toggle("pad0", total == 0);
				q.classList.toggle("pad1", total == 1);
				q.classList.toggle("pad2", total == 2);
				q.classList.toggle("pad3", total >= 3);
			}
		}

		registerScrollShadows();
	}

	toggleBodyScroll(!visible);

	//setCustomHeightsQuickly(30);
	lazyLoadImages();

	return visible;
}

function hideAllModals() {
	$$("#modal-wrapper .modal-content > *").forEach((e) => {
		hideModal(e.id);
	});

	// just in case?
	toggleBodyScroll(true);
}

function hideModalTopMost() {
	var o = $$("#modal-wrapper .modal-content > *");
	for (i = o.length - 1; i >= 0; i--) {
		var modal = o[i];
		if (modal.classList.contains("visible")) {
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
		if (!checkFormCloseWarning(`#${name}`)) {
			return false;
		}
	}

	let visible_modal_count = 0;

	let modal_wrapper = $("#modal-wrapper");

	if (name) {
		let modal = $(`#${name}`);
		if (modal) {
			modal.style.animation = "hide 0.4s";
			visible_modal_count--;
			setTimeout(() => {
				modal.classList.remove("visible");
				modal.style.animation = "";
			}, 200);
		}

		// cleanup validators
		modal.findAll("[data-validate]").forEach((e) => {
			e.classList.remove("required");
		});

		modal.findAll(".fa-exclamation-triangle").forEach((e) => {
			e.remove();
		});

		window.dispatchEvent(
			new CustomEvent("modal-hide", {
				detail: {
					node: modal,
				},
			})
		);
	}

	modal_wrapper.findAll(".modal-content > *").forEach((modal) => {
		if (modal.classList.contains("visible")) visible_modal_count++;
	});

	if (visible_modal_count > 0) {
		modal_wrapper.classList.add("visible");
	} else {
		toggleBodyScroll(true);
		modal_wrapper.style.animation = "hide 0.4s";
		setTimeout(() => {
			modal_wrapper.classList.remove("visible");
			modal_wrapper.style.animation = "";
		}, 200);
	}
}

function anyModalActive() {
	return !!$("#modal-wrapper.visible");
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

window.addEventListener("mousedown", (event) => {
	var form = null;

	if (event.target.classList.contains("close-modal-btn")) {
		form = event.target.findParentByAttribute("data-modal");
	} else if (event.target.hasAttribute("data-dismissable")) {
		form = event.target;
	}

	if (form) {
		//hideModalTopMost();
		// hmm, might work
		//hideAllModals();
		hideModal(form.id);
	}
});
