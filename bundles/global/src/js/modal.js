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
			<div id="modal_wrapper" class="hidden">
				<div class="modal_container"></div>
			</div>
		`
	);

	modal_wrapper_node = $("#modal_wrapper");
	modal_container_node = modal_wrapper_node._child(".modal_container");

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

/**
 *
 * @param {PiepNode} modal
 */
function registerModal(modal) {
	modal_container_node.appendChild(modal);
	modal.classList.add(modal.id, "hidden", "modal");
}

/**
 * @typedef {{
 * source?: PiepNode
 * source_rect?: DOMRect
 * callback?: CallableFunction
 * keep_size?: boolean
 * }} ShowModalParams
 */

/**
 *
 * @param {*} name
 * @param {ShowModalParams} params
 */
function showModal(name = null, params = {}) {
	let visible = name != null;
	if (visible) {
		let total = 1;
		let any = false;
		modal_wrapper_node._children(".modal_container > .modal").forEach((modal) => {
			let shownow = false;
			if (modal.id == name) {
				if (modal.classList.contains("hidden")) {
					shownow = true;
				}
				any = true;
			}
			if (!modal.classList.contains("hidden")) {
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
				//clearAllErrors(modal);
				const modal_container = modal_wrapper_node._child(".modal_container");
				modal_container.appendChild(modal);
				const modal_content = modal._child("*");

				registerForms();
				registerScrollShadows();

				modal.style.pointerEvents = "none";
				modal.classList.remove("hidden");
				modal_wrapper_node.classList.remove("hidden");

				const duration = 300;

				const basic_callback = () => {
					modal.style.pointerEvents = "";
					modal.style.opacity = "";

					if (params.callback) {
						params.callback();
					}

					window.dispatchEvent(
						new CustomEvent("modal-shown", {
							detail: {
								node: modal,
							},
						})
					);
				};

				let dx = 0;
				let dy = 0;
				if (params.source || params.source_rect) {
					const src_rect = params.source_rect ? params.source_rect : params.source.getBoundingClientRect();
					const modal_rect = modal_content.getBoundingClientRect();
					dx = src_rect.left - modal_rect.left + (src_rect.width - modal_rect.width) * 0.5;
					dy = src_rect.top - modal_rect.top + (src_rect.height - modal_rect.height) * 0.5;
				}

				const animation_1 = `0% {opacity: 0;} 100% {opacity: 1;}`;
				const animation_2 = `0% {transform: translate(${dx * 0.5}px,${dy * 0.5}px)scale(0.5);}
                    100% {transform: translate(0px,0px) scale(1);}`;

				if (def(params.keep_size, false)) {
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

							modal_copy.classList.add("hidden");
							setTimeout(() => {
								observer.disconnect();
								modal_copy.remove();
							}, 100);
						},
					});
				} else {
					modal._animate(animation_1, duration);
					modal_content.classList.add("showing_modal");
					modal_content._animate(animation_2, duration, {
						callback: () => {
							basic_callback();
							modal_content.classList.remove("showing_modal");
							setCustomHeights();
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
		if (modal) {
			const q = modal._child("*");
			if (q) {
				if (modal.getAttribute("data-expand") == "large") total = 0; //total--;
				q.classList.toggle("pad0", total == 0);
				q.classList.toggle("pad1", total == 1);
				q.classList.toggle("pad2", total == 2);
				q.classList.toggle("pad3", total >= 3);
			}
		}
	}

	modal_wrapper_node.classList.toggle("hidden", !visible);

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
		if (!modal.classList.contains("hidden")) {
			hideModal(modal ? modal.id : null);
			break;
		}
	}
}

/**
 *
 * @param {PiepNode} obj
 * @param {boolean} isCancel
 */
function hideParentModal(obj = null, isCancel = false) {
	if (obj) {
		const modal = obj._parent("[data-modal]", { skip: 0 });
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
				modal.classList.add("hidden");
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
		if (!modal.classList.contains("hidden")) visible_modal_count++;
	});

	if (visible_modal_count > 0) {
		modal_wrapper_node.classList.remove("hidden");
	} else {
		modal_wrapper_node.style.animation = "hide 0.4s";
		setTimeout(() => {
			modal_wrapper_node.classList.add("hidden");
			modal_wrapper_node.style.animation = "";
		}, 200);
	}
}

function setModalTitle(modal, title) {
	$(modal)._child(`.custom_toolbar .title`).innerHTML = title;
}

window.addEventListener("mousedown", (event) => {
	let form = null;

	const target = $(event.target);

	if (target._parent(".close_modal_btn", { skip: 0 })) {
		form = target._parent("[data-modal]");
	} else if (target.hasAttribute("data-dismissable")) {
		form = target;
	}

	if (form) {
		hideModal(form.id);
	}
});
