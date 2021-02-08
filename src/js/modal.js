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
		html`
			<div id="modal_wrapper">
				<div class="modal_container"></div>
			</div>
		`
	);

	modal_wrapper_node = $("#modal_wrapper");
	modal_container_node = $(".modal_container");

	modal_wrapper_node.addEventListener("mousewheel", (ev) => {
		ev.preventDefault();
	});

	modal_wrapper_node.addEventListener("touchmove", (ev) => {
		ev.preventDefault(); // the modal panel etc. can stop propagation tho
	});

	registerModals();
}

domload(initModal);

function registerModals() {
	$$("[data-modal]").forEach((e) => {
		registerModal(e);
	});
}

function registerModalContent(html, callback = undefined) {
	if (!document.body) {
		domload(() => {
			registerModalContent(html, callback);
		});
		return;
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
	registerModalScroll(modal);
}

/**
 *
 * @param {PiepNode} modal
 */
function registerModalScroll(modal) {
	modal._children(`.scroll-panel:not(.horizontal):not(.modal_scroll_registered)`).forEach((scr) => {
		scr.classList.add("modal_scroll_registered");

		const panel_on_edge = (dy) => {
			return scr.scrollHeight < 2 || (scr.scrollTop >= scr.scrollHeight - scr.offsetHeight - 1 && dy > 0) || (scr.scrollTop < 1 && dy < 0);
		};

		scr.addEventListener("mousewheel", (ev) => {
			if (!panel_on_edge(ev.deltaY)) {
				ev.stopPropagation();
			}
		});
		scr.addEventListener("touchmove", (ev) => {
			for (let i = 0; i < scr._touches.length; i++) {
				if (ev.targetTouches[i] && scr._touches[i]) {
					const dy = scr._touches[i].clientY - ev.targetTouches[i].clientY;
					if (!panel_on_edge(dy)) {
						ev.stopPropagation();
					}
				}
			}
			scr._touches = ev.targetTouches;
		});
		scr.addEventListener("touchstart", (ev) => {
			scr._touches = ev.targetTouches;
		});
	});
}

/**
 *
 * @param {*} name
 * @param {{
 * source?: PiepNode
 * callback?: CallableFunction
 * keep_size?: boolean
 * }} params
 */
function showModal(name = null, params = {}) {
	let visible = name != null;
	if (visible) {
		let total = 1;
		let any = false;
		modal_wrapper_node._children(".modal_container > *").forEach((modal) => {
			let shownow = false;
			if (modal.id == name && !modal.classList.contains("visible")) {
				shownow = true;
				any = true;
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
				const modal_content = modal._child("*");

				registerModalScroll(modal);

				modal.style.pointerEvents = "none";
				modal.classList.add("visible");

				const duration = 300;

				const basic_callback = () => {
					modal.style.pointerEvents = "";
					modal.style.opacity = "";

					if (params.callback) {
						params.callback();
					}
				};

				let dx = 0;
				let dy = 0;
				if (params.source) {
					const src_rect = params.source.getBoundingClientRect();
					const modal_rect = modal_content.getBoundingClientRect();
					dx = src_rect.left - modal_rect.left + (src_rect.width - modal_rect.width) * 0.5;
					dy = src_rect.top - modal_rect.top + (src_rect.height - modal_rect.height) * 0.5;
				}

				const animation_1 = `0% {opacity: 0;} 100% {opacity: 1;}`;
				const animation_2 = `0% {transform: translate(${dx * 0.5}px,${dy * 0.5}px)scale(0.5);}
                    100% {transform: translate(0px,0px) scale(1);}`;

				if (params.keep_size) {
					// why a copy? it's required to get bounding client rect to work properly on modal open
					modal_container.insertAdjacentHTML("beforeend", modal.outerHTML);
					const modal_copy = $(modal_container.lastElementChild);
					const modal_copy_content = modal_copy._child("*");
					modal_copy.id = "";

					// observe changes and apply them to the copied modal
					const observer = new MutationObserver(() => {
						modal_copy_content.style.width = modal_content.offsetWidth + 1 + "px"; // weird but let's just keep it like this
						modal_copy_content.style.height = modal_content.offsetHeight + 1 + "px";

						if (modalObserverTimeout) {
							clearTimeout(modalObserverTimeout);
						}
						modalObserverTimeout = setTimeout(() => {
							modalObserverTimeout = undefined;
							modal_copy_content._set_content(modal_content.innerHTML);
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

					modal_copy._animate(animation_1, duration);
					modal_copy_content._animate(animation_2, duration, {
						callback: () => {
							basic_callback();

							modal_copy.classList.remove("visible");
							setTimeout(() => {
								observer.disconnect();
								modal_copy.remove();
							}, 100);
						},
					});
				} else {
					modal._animate(animation_1, duration);
					modal_content._animate(animation_2, duration, {
						callback: () => {
							basic_callback();
						},
					});
				}

				window.dispatchEvent(
					new CustomEvent("modal-show", {
						detail: {
							node: modal,
						},
					})
				);
			}
		});

		if (!any) {
			console.error(`Modal ${name} doesn't exist!`);
			return;
		}

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

	modal_wrapper_node.classList.toggle("visible", visible);

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

			// cleanup validators
			// TODO: we already clean them up on modal show hmmmm, remove?
			modal._children("[data-validate]").forEach((e) => {
				e.classList.remove("required");
			});

			modal._children(".fa-exclamation-triangle").forEach((e) => {
				e.remove();
			});
		}

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

	if (target._parent(".close-modal-btn", { skip: 0 })) {
		form = target._parent("[data-modal]");
	} else if (target.hasAttribute("data-dismissable")) {
		form = target;
	}

	if (form) {
		hideModal(form.id);
	}
});
