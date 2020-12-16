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
	$("#modal-wrapper .modal_container").appendChild(e);
}

function showModal(name = null, params = {}) {
	var modal_wrapper = $("#modal-wrapper");
	var visible = name != null;
	modal_wrapper.classList.toggle("visible", visible);
	if (visible) {
		var total = 0;
		modal_wrapper.findAll(".modal_container > *").forEach((modal) => {
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
				const modal_container = modal_wrapper.find(".modal_container");
				modal_container.appendChild(modal);

				modal.style.pointerEvents = "none";
				modal.classList.add("visible");

				// why a copy? it's required to get bounding client rect to work properly on modal open
				modal_container.insertAdjacentHTML("beforeend", modal.outerHTML);
				const modal_copy = $(modal_container.lastElementChild);
				const modal_copy_content = modal_copy.find("*");
				const modal_content = modal.find("*");
				modal_copy.id = "";

				let dx = 0;
				let dy = 0;
				if (params.source) {
					/*var r = params.source.getBoundingClientRect();
					var p = modal_copy_content.getBoundingClientRect();
					console.log(r, p);
					dx = 1 * (r.left - p.left) + r.width / 2;
					dy = 1 * (r.top - p.top) + r.height / 2;*/
					//origin = `${dx}px ${dy}px`;
					const src_rect = params.source.getBoundingClientRect();
					const modal_rect = modal_copy_content.getBoundingClientRect();
					dx =
						src_rect.left -
						modal_rect.left +
						(src_rect.width - modal_rect.width) * 0.5;
					dy =
						src_rect.top -
						modal_rect.top +
						(src_rect.height - modal_rect.height) * 0.5;
				}
				//modal_copy.style.transformOrigin = origin;
				//return;

				// observe changes and apply them to the copied modal
				const observer = new MutationObserver(() => {
					modal_copy_content.style.width = modal_content.offsetWidth + "px";
					modal_copy_content.style.height = modal_content.offsetHeight + "px";

					if (window.modalOBserverTimeout) {
						clearTimeout(window.modalOBserverTimeout);
					}
					window.modalOBserverTimeout = setTimeout(() => {
						window.modalOBserverTimeout = null;
						//console.log(123);
						modal_copy_content.setContent(modal_content.innerHTML);
						//modal_copy_content.innerHTML = modal_content.innerHTML;
						modal_copy_content.findAll(".lazy").forEach((e) => {
							e.classList.remove("lazy");
						});
						modal_copy_content.findAll("[data-height]").forEach((e) => {
							e.removeAttribute("data-height");
						});
					}, 0);
				});
				observer.observe(modal, {
					attributes: true,
					childList: true,
					subtree: true,
				});

				modal.style.opacity = "0.001";

				const duration = 300;
				modal_copy.animate(
					`
                        0% {
                            opacity: 0;
                        }
                        100% {
                            opacity: 1;
                        }
                    `,
					duration
				);

				modal_copy_content.animate(
					`
                        0% {
                            transform: translate(
                                ${dx * 0.5}px,
                                ${dy * 0.5}px)
                            scale(0.5);
                        }
                        100% {
                            transform: translate(0px,0px) scale(1);
                        }
                    `,
					duration,
					{
						callback: () => {
							modal.style.pointerEvents = "";
							modal.style.opacity = "";
							modal_copy.classList.remove("visible");

							setTimeout(() => {
								observer.disconnect();
								modal_copy.remove();
							}, 100);

							if (params.callback) {
								params.callback();
							}
						},
					}
				);
				window.dispatchEvent(
					new CustomEvent("modal-show", {
						detail: {
							node: modal,
						},
					})
				);
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
	$$("#modal-wrapper .modal_container > *").forEach((e) => {
		hideModal(e.id);
	});

	// just in case?
	toggleBodyScroll(true);
}

function hideModalTopMost() {
	var o = $$("#modal-wrapper .modal_container > *");
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
		// TODO: we already clean them up on modal show hmmmm, remove?
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

	modal_wrapper.findAll(".modal_container > *").forEach((modal) => {
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
