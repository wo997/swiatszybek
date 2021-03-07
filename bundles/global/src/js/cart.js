/* js[global] */
function resizeCartCallback() {
	$$("cart-products-comp").forEach((cart) => {
		if (cart._parent("header")) {
			return;
		}

		cart.classList.toggle("skinny", cart.offsetWidth < 350);
	});
}

window.addEventListener("resize", () => {
	resizeCartCallback();
});

domload(() => {
	setTimeout(() => {
		resizeCartCallback();
	});
});

function initBuy() {
	$$(".qty_controls:not(.qty_rgstrd)").forEach((qty_controls) => {
		qty_controls.classList.add("qty_rgstrd");

		const val_qty = qty_controls._child(".val_qty");
		const sub_qty = qty_controls._child(".sub_qty");
		const add_qty = qty_controls._child(".add_qty");

		const setQty = (qty) => {
			const ref = def(qty_controls.dataset.product, "");
			if (ref === "single_product") {
				val_qty._set_value(val_qty._get_value() + qty);
			} else {
				// @ts-ignore
				if (qty_controls._add_product_timeout) {
					// @ts-ignore
					clearTimeout(qty_controls._add_product_timeout);
					// @ts-ignore
					qty_controls._add_product_timeout = undefined;
				}
				// @ts-ignore
				qty_controls._add_product_timeout = setTimeout(() => {
					// @ts-ignore
					if (qty_controls._add_product_request) {
						// @ts-ignore
						console.log(qty_controls._add_product_request);
						// @ts-ignore
						qty_controls._add_product_request.abort();
						// @ts-ignore
						qty_controls._add_product_request = undefined;
					}

					const product = getProduct();
					if (qty !== product.qty) {
						// @ts-ignore
						qty_controls._add_product_request = xhr({
							url: "/cart/add-product",
							params: {
								product_id: getProduct().product_id,
								qty,
							},
							success: (res) => {
								// @ts-ignore
								qty_controls._add_product_request = undefined;
								user_cart = res.user_cart;
								loadedUserCart();
							},
						});
					}
				});
			}
		};

		const getProduct = () => {
			/** @type {string} */
			const ref = def(qty_controls.dataset.product, "");

			if (ref.startsWith("user_cart")) {
				const product = user_cart.products.find((e) => e.product_id === numberFromStr(ref));
				return product;
			} else if (ref === "single_product") {
				return single_product;
			}
			return undefined;
		};

		const getMin = () => {
			return 1;
		};

		const getMax = () => {
			const product = getProduct();
			return product ? Math.min(product.stock, 10) : 100;
		};

		val_qty.addEventListener("click", () => {
			// @ts-ignore
			val_qty.select();
		});
		sub_qty.addEventListener("click", () => {
			setQty(getProduct().qty - 1);
		});
		add_qty.addEventListener("click", () => {
			setQty(getProduct().qty + 1);
		});

		val_qty.addEventListener("change", () => {
			if (!getProduct()) {
				return;
			}

			const qty = val_qty._get_value();
			const bound_val = clamp(getMin(), val_qty._get_value(), getMax());
			if (qty !== bound_val) {
				val_qty._set_value(clamp(getMin(), val_qty._get_value(), getMax()));
				return;
			}

			sub_qty.toggleAttribute("disabled", qty === getMin());
			add_qty.toggleAttribute("disabled", qty === getMax());

			const ref = def(qty_controls.dataset.product, "");
			if (ref.startsWith("user_cart")) {
				setQty(qty);
			}
		});
	});

	$$(".qty_controls").forEach((qty_controls) => {
		const val_qty = qty_controls._child(".val_qty");
		val_qty._dispatch_change();
	});
}

domload(initBuy);
