/* js[global] */
function resizeCartCallback() {
	$$("cart-products-comp").forEach((cart) => {
		if (cart._parent("header")) {
			return;
		}

		cart.classList.toggle("skinny", cart.offsetWidth < 390);
	});
}

window.addEventListener("resize", () => {
	resizeCartCallback();
});

domload(() => {
	setTimeout(() => {
		resizeCartCallback();
	});
	initBuy();

	const loadCart = () => {
		const empty = user_cart.products.length === 0;
		$$(".case_cart_not_empty").forEach((ne) => {
			expand(ne, !empty);
		});
		$$(".case_cart_empty").forEach((e) => {
			expand(e, empty);
		});

		$$(".cart_product_count").forEach((e) => {
			e._set_content(user_cart.products.length);
		});
		$$(".cart_products_price").forEach((e) => {
			e._set_content(user_cart.products_price + " zł");
		});
		$$(".cart_delivery_price").forEach((e) => {
			e._set_content(user_cart.delivery_price + " zł");
		});
		$$(".cart_total_price").forEach((e) => {
			e._set_content(user_cart.total_price + " zł");
		});
		$$(".cod_fee").forEach((e) => {
			e._set_content(user_cart.cod_fee + " zł");
		});
	};

	window.addEventListener("user_cart_changed", loadCart);
	loadCart();
});

/* js[global] */

// prevent multiple requests
let adding_product_from_cart = false;

function initBuy() {
	$$(".qty_controls:not(.qty_rgstrd)").forEach((qty_controls) => {
		qty_controls.classList.add("qty_rgstrd");

		const val_qty = qty_controls._child(".val_qty");
		const sub_qty = qty_controls._child(".sub_qty");
		const add_qty = qty_controls._child(".add_qty");
		const spinner_wrapper = qty_controls._child(".spinner_wrapper");

		const setQty = (qty) => {
			if (adding_product_from_cart) {
				return;
			}

			const ref = def(qty_controls.dataset.product, "");
			if (ref === "single_product") {
				val_qty._set_value(qty);
			} else {
				const product = getProduct();
				if (qty !== product.qty) {
					adding_product_from_cart = true;

					spinner_wrapper.classList.add("spinning");
					xhr({
						url: "/cart/add-product",
						params: {
							product_id: getProduct().product_id,
							qty,
						},
						success: (res) => {
							user_cart = res.user_cart;
							loadedUserCart();
							adding_product_from_cart = false;

							removeClasses(".spinning", ["spinning"]);
						},
					});
				}
			}
		};

		const getProduct = () => {
			/** @type {string} */
			const ref = def(qty_controls.dataset.product, "");

			if (ref.startsWith("user_cart")) {
				const product_id = numberFromStr(ref);
				const product = user_cart.products.find((e) => e.product_id === product_id);
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

		sub_qty.addEventListener("click", () => {
			const product = getProduct();
			if (!product) {
				return;
			}
			setQty(val_qty._get_value() - 1);
		});
		add_qty.addEventListener("click", () => {
			const product = getProduct();
			if (!product) {
				return;
			}
			setQty(val_qty._get_value() + 1);
		});

		val_qty.addEventListener("click", () => {
			// @ts-ignore
			val_qty.select();
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
