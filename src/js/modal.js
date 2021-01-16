/* js[global] */

/** @type {PiepNode} */
let modal_wrapper_node = undefined;
/** @type {PiepNode} */
let modal_container_node = undefined;

let modalObserverTimeout = undefined;

function initModal() {
	if (modal_wrapper_node !== undefined) {
		return;
	}

	document.body.insertAdjacentHTML(
		"beforeend",
		/*html*/ `
            <div id="modal_wrapper">
                <div class="modal_container"></div>
            </div>
        `
	);

	modal_wrapper_node = $("#modal_wrapper");
	modal_container_node = $(".modal_container");
	modal_wrapper_node.addEventListener("touchmove", (ev) => {
		ev.preventDefault();
		//if (ev.target && $(ev.target)._parent() === modal_container_node) {
		//}
		//ev.stopPropagation();
	});

	registerModals();
}

domload(initModal);

function registerModals() {
	$$("[data-modal]").forEach((e) => {
		registerModal(e);
	});
}

function registerModalContent(html, callback) {
	if (!document.body) {
		domload(() => {
			registerModalContent(html, callback);
			return;
		});
	}

	initModal();

	const div = document.createElement("DIV");
	div.insertAdjacentHTML("afterbegin", html);
	const modal = $(div.children[0]);
	if (modal_container_node._child("#" + modal.id)) {
		console.error("modal defined already");
		return;
	}
	modal.setAttribute("data-modal", "true");
	registerModal(modal);
	if (callback) {
		callback(modal);
	}
}

function registerModal(modal) {
	modal_container_node.appendChild(modal);

	const modal_content = modal._child("*");

	modal_content.addEventListener("touchmove", (ev) => {
		console.log(ev);
		ev.stopPropagation();
		//ev.stopImmediatePropagation();
	});
	console.log(modal);
}

function showModal(name = null, params = {}) {
	let visible = name != null;
	modal_wrapper_node.classList.toggle("visible", visible);
	if (visible) {
		let total = 0;
		modal_wrapper_node._children(".modal_container > *").forEach((modal) => {
			let shownow = false;
			if (modal.id == name && !modal.classList.contains("visible")) {
				shownow = true;
			}
			if (modal.classList.contains("visible")) {
				const expand = modal.getAttribute("data-expand");
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
				const modal_container = modal_wrapper_node._child(".modal_container");
				modal_container.appendChild(modal);

				modal.style.pointerEvents = "none";
				modal.classList.add("visible");

				// why a copy? it's required to get bounding client rect to work properly on modal open
				modal_container.insertAdjacentHTML("beforeend", modal.outerHTML);
				const modal_copy = $(modal_container.lastElementChild);
				const modal_copy_content = modal_copy._child("*");
				const modal_content = modal._child("*");
				modal_copy.id = "";

				let dx = 0;
				let dy = 0;
				if (params.source) {
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

				// observe changes and apply them to the copied modal
				const observer = new MutationObserver(() => {
					modal_copy_content.style.width = modal_content.offsetWidth + "px";
					modal_copy_content.style.height = modal_content.offsetHeight + "px";

					if (modalObserverTimeout) {
						clearTimeout(modalObserverTimeout);
					}
					modalObserverTimeout = setTimeout(() => {
						modalObserverTimeout = undefined;
						modal_copy_content.setContent(modal_content.innerHTML);
						modal_copy_content._children(".lazy").forEach((e) => {
							e.classList.remove("lazy");
						});
						modal_copy_content._children("[data-height]").forEach((e) => {
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
				modal_copy._animate(
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

				modal_copy_content._animate(
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
		const modal = modal_container_node._child(`#${name}`);
		if (modal && modal.hasAttribute("data-expand")) {
			const q = modal._child("*");
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

	return visible;
}

function hideAllModals() {
	modal_container_node._direct_children().forEach((e) => {
		hideModal(e.id);
	});
}

function hideModalTopMost() {
	const o = modal_container_node._direct_children();
	for (let i = o.length - 1; i >= 0; i--) {
		const modal = o[i];
		if (modal.classList.contains("visible")) {
			hideModal(modal ? modal.id : null);
			break;
		}
	}
}

function hideParentModal(obj = null, isCancel = false) {
	if (obj) {
		const modal = obj._parent("[data-modal]");
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
		modal._children("[data-validate]").forEach((e) => {
			e.classList.remove("required");
		});

		modal._children(".fa-exclamation-triangle").forEach((e) => {
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

	modal_wrapper_node._children(".modal_container > *").forEach((modal) => {
		if (modal.classList.contains("visible")) visible_modal_count++;
	});

	if (visible_modal_count > 0) {
		modal_wrapper_node.classList.add("visible");
	} else {
		modal_wrapper_node.style.animation = "hide 0.4s";
		setTimeout(() => {
			modal_wrapper_node.classList.remove("visible");
			modal_wrapper_node.style.animation = "";
		}, 200);
	}
}

function setModalTitle(modal, title) {
	$(modal)._child(`.custom-toolbar .title`).innerHTML = title;
}

window.addEventListener("mousedown", (event) => {
	let form = null;

	const target = $(event.target);

	if (target.classList.contains("close-modal-btn")) {
		form = target._parent("[data-modal]");
	} else if (target.hasAttribute("data-dismissable")) {
		form = target;
	}

	if (form) {
		hideModal(form.id);
	}
});
