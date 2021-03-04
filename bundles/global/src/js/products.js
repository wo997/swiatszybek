/* js[global] */

function resizeProductsCallback() {
	$$(".product_list").forEach((list) => {
		const target_width = evalCss(def(list.dataset.product_width, "2vw + 280px"), list);

		const list_width = list.offsetWidth;

		const product_width = Math.floor(10000 / Math.round(list_width / target_width)) / 100;

		list.style.setProperty("--product_width", `${product_width}%`);
	});
}

window.addEventListener("resize", () => {
	resizeProductsCallback();
});
