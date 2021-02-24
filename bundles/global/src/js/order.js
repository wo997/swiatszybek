/* js[global] */

function _setBasketData(res, options = {}) {
	window.was_basket_data = def(window.basket_data, {
		basket: [],
	});
	if (res.basket) {
		window.basket_data = res;
	} else {
		return;
	}

	res.options = options;
	res.changes = {
		added: [],
		removed: [],
		quantity: [],
	};

	for (let item of window.basket_data.basket) {
		var basket_item = window.was_basket_data.basket.find((e) => {
			return e.variant_id === item.variant_id;
		});
		if (basket_item) {
			if (item.quantity !== basket_item.quantity) {
				res.changes.quantity.push(item.variant_id);
			}
		} else {
			res.changes.added.push(item.variant_id);
		}
	}

	for (let item of window.was_basket_data.basket) {
		if (
			!window.basket_data.basket.find((e) => {
				return e.variant_id === item.variant_id;
			})
		) {
			res.changes.removed.push(item.variant_id);
		}
	}

	var event = new CustomEvent("basket-change", {
		detail: {
			res: res,
		},
	});
	window.dispatchEvent(event);
}

var basketActionDelayed = false;
function enableBasketActions() {
	basketActionDelayed = false;
}

function addVariantToBasket(variant_id, quantity_diff, options = {}) {
	if (basketActionDelayed) {
		return;
	}

	if (typeof variant_id === "object") {
		variant_id = $(variant_id)._parent("[data-variant_id]").getAttribute("data-variant_id");

		if (!variant_id) {
			return;
		}
	}

	variant_id = parseInt(variant_id);
	const variant = basket_data.basket.find((e) => {
		return e.variant_id === variant_id;
	});
	if (variant && quantity_diff < -variant.quantity) {
		quantity_diff = -variant.quantity;
	}

	basketActionDelayed = true;
	delay("enableBasketActions", 1000); // just in case the server crashes, should be less than 100ms

	const basket_data_ref = cloneObject(window.basket_data);

	xhr({
		url: "/basket_action",
		params: {
			quantity_diff,
			variant_id,
		},
		success: (res) => {
			_setBasketData(res, options);
			delay("enableBasketActions", 100);

			if (options.cancellable) {
				const variant = basket_data_ref.basket.find((e) => {
					return e.variant_id === variant_id;
				});

				if (variant && variant.quantity + quantity_diff <= 0) {
					const notification = showNotification(
						html`
							<div style="text-align:center;line-height:1.8">
								<div class="header">Usunięto produkt</div>
								<div style="padding:10px">${variant.title} ${variant.name}</div>
								<button class="btn primary semi-bold cancel_btn">
									Przywróć
									<span class="countdown"></span>
								</button>
							</div>
						`,
						{
							duration: 8000,
						}
					);

					const cancel_btn = notification._child(".cancel_btn");
					cancel_btn.addEventListener("click", () => {
						addVariantToBasket(variant_id, -quantity_diff, options);
						dismissParentNotification(cancel_btn);
					});
				}
			}
		},
	});
}

window.addEventListener("basket-change", (event) => {
	var res = event.detail.res;

	if (res.options && res.options.show_modal) {
		if (res.changes) {
			var variant = null;
			if (res.changes.added.length === 1) {
				variant = basket_data.basket.find((v) => {
					return v.variant_id == res.changes.added[0];
				});
			}

			if (!variant && res.changes.quantity.length === 1) {
				variant = basket_data.basket.find((v) => {
					return v.variant_id == res.changes.quantity[0];
				});
			}

			if (!variant) {
				return;
			}

			var modal_name = "variantAdded";

			$(`#${modal_name} .variant_image`)._set_value(variant.zdjecie);
			$(`#${modal_name} .variant_name`)._set_content(variant.title + " " + variant.name);
			$(`#${modal_name} .variant_qty`)._set_content(variant.quantity + " szt.");
			$(`#${modal_name} .variant_price`)._set_content(variant.real_price + " zł");

			var options = {};
			if (res.options.modal_source) {
				options.source = res.options.modal_source;
			}
			showModal(modal_name, options);
		}
	}
});

window.addEventListener("basket-change", (event) => {
	var res = event.detail.res;

	const setSummary = () => {
		$$(".basket_item_count").forEach((e) => {
			e._set_content(res.item_count);
		});

		$$(".total_basket_cost").forEach((e) => {
			e._set_content(basket_data.total_basket_cost + " zł");
		});
	};

	if ((res.changes.added.length > 0 || res.changes.quantity.length > 0 || res.changes.removed.length > 0) && !res.options.instant) {
		$$(".basket_item_count, .total_basket_cost").forEach((e) => {
			e._animate(ANIMATIONS.replace(0.2), 400);
		});

		setTimeout(setSummary, 200);
	} else {
		setSummary();
	}

	$$(".gotobuy").forEach((e) => {
		e.toggleAttribute("disabled", res.item_count === 0);
	});

	var options = {};
	if (res.options.instant) {
		options.duration = 0;
	}

	var toggle = (node, visible) => {
		var empty = basket_data.basket.length === 0;

		var product_id = node.getAttribute("data-product_id");

		if (product_id) {
			empty = true;
			basket_data.basket.forEach((v) => {
				if (v.product_id == product_id) {
					empty = false;
				}
			});
		}

		var show = !empty;
		if (!visible) {
			show = !show;
		}

		if (node.classList.contains("expand_y")) {
			expand(node, show, options);
		} else {
			node.classList.toggle("hidden", !show);
		}
	};
	$$(".case_basket_not_empty").forEach((e) => {
		toggle(e, true);
	});
	$$(".case_basket_empty").forEach((e) => {
		toggle(e, false);
	});
});

// also order.php
function renderStatus(status_id) {
	var status = getRowById(status_list, status_id);
	if (!status) {
		return "";
	}
	return `<div class='rect status_rect' style='background:#${def(status.color)}'>${status.title}</div>`;
}

function setVariantRowQty(variant_node, variant_data) {
	var qty = variant_node._child(".qty-label");
	if (qty) {
		qty._set_content(variant_data.quantity);
		variant_node._child(".qty-btn.add").toggleAttribute("disabled", variant_data.quantity >= variant_data.stock);
	}

	var ptc = variant_node._child(".variant_total_price");
	if (ptc) {
		ptc._set_content(variant_data.total_price + " zł");
	}
}

function showVariantChanges(res, basket_node, basket_row_template, data_source) {
	if (!basket_node) {
		return;
	}
	basket_node = $(basket_node);

	var product_id = basket_node.getAttribute("data-product_id");

	if (res.changes) {
		res.changes.quantity.forEach((variant_id) => {
			var variant_node = basket_node._child(`[data-variant_id="${variant_id}"]`);
			if (!variant_node) {
				return;
			}

			var qty = variant_node._child(".qty-label");
			var ptp = variant_node._child(".variant_total_price");
			if (qty) {
				qty._animate(ANIMATIONS.replace(0.4), 400);
			}
			if (ptp) {
				ptp._animate(ANIMATIONS.replace(0.25), 400);
			}

			setTimeout(() => {
				var variant_data = data_source.find((e) => {
					return e.variant_id == variant_id;
				});

				if (!variant_data) {
					return;
				}
				setVariantRowQty(variant_node, variant_data);
			}, 200);
		});
		res.changes.added.forEach((variant_id) => {
			var variant_data = data_source.find((e) => {
				return e.variant_id == variant_id;
			});

			if (!variant_data) {
				return;
			}

			if (product_id && product_id != variant_data.product_id) {
				return;
			}

			basket_node.insertAdjacentHTML("beforeend", basket_row_template);
			const variant_node_children = basket_node._direct_children();
			var variant_node = variant_node_children[variant_node_children.length - 1];

			if (!res.options.instant) {
				variant_node.classList.add("hidden");
				variant_node.classList.add("animate_hidden");
			}

			setVariantRowQty(variant_node, variant_data);
			var pi = variant_node._child(".variant_image");
			if (pi) {
				pi._set_value(variant_data.zdjecie);
			}
			var pp = variant_node._child(".variant_price");
			if (pp) {
				pp._set_content(variant_data.real_price);
			}
			var pl = variant_node._child(".product_link");
			if (pl) {
				pl.setAttribute("href", variant_data.full_link);
			}
			var pn = variant_node._child(".variant_full_name");
			if (pn) {
				pn._set_content(variant_data.title + " " + variant_data.name);
			}

			var pvn = variant_node._child(".variant_name");
			if (pvn) {
				pvn._set_content(variant_data.name);
			}

			variant_node.setAttribute("data-variant_id", variant_id);

			lazyLoadImages(false);
			setCustomHeights();

			if (!res.options.instant) {
				expand(variant_node, true);
			}
		});
		res.changes.removed.forEach((variant_id) => {
			var variant_node = basket_node._child(`[data-variant_id="${variant_id}"]`);
			expand(variant_node, false, {
				callback: () => {
					variant_node.remove();
				},
			});
		});
	}

	lazyLoadImages(false);

	setTimeout(() => {
		lazyLoadImages();
		setCustomHeights();
		tooltip.resizeCallback();
	});
}

function showProductChanges(res, basket_node, basket_row_template, data_source) {
	if (!basket_node) {
		return;
	}
	basket_node = $(basket_node);

	if (res.changes) {
		res.changes.added.forEach((product_id) => {
			var product_data = data_source.find((e) => {
				return e.product_id == product_id;
			});
			if (!product_data) {
				return;
			}

			basket_node.insertAdjacentHTML("beforeend", basket_row_template);
			product_node_children = basket_node._direct_children();
			var product_node = product_node_children[product_node_children.length - 1];

			if (!res.options.instant) {
				product_node.classList.add("hidden");
				product_node.classList.add("animate_hidden");
			}

			var pi = product_node._child(".product_image");
			if (pi) {
				pi._set_value(product_data.cache_thumbnail);
			}
			var pp = product_node._child(".product_price");
			if (pp) {
				var price = product_data.price_min;
				if (product_data.price_max) {
					price += " - " + product_data.price_max;
				}
				pp._set_content(price + " zł");
			}
			var pl = product_node._child(".product_link");
			if (pl) {
				pl.setAttribute("href", product_data.full_link);
			}
			var pn = product_node._child(".product_name");
			if (pn) {
				pn._set_content(product_data.title);
			}

			product_node.setAttribute("data-product_id", product_id);

			lazyLoadImages(false);
			setCustomHeights();

			if (!res.options.instant) {
				expand(product_node, true);
			}
		});
		res.changes.removed.forEach((product_id) => {
			var product_node = basket_node._child(`[data-product_id="${product_id}"]`);
			expand(product_node, false, {
				callback: () => {
					product_node.remove();
				},
			});
		});
	}

	lazyLoadImages(false);

	setTimeout(() => {
		lazyLoadImages();
		setCustomHeights();
		tooltip.resizeCallback();
	});
}