/* js[!global] */

/**
 * @typedef {{
 * general_product_id: number
 * name: string
 * img_url: string
 * url: string
 * }} LastViewedProduct
 */

/**
 * @type {LastViewedProduct[]}
 */
let last_viewed_products = [];

function loadedLastViewedProducts() {
	window.dispatchEvent(new CustomEvent("last_viewed_products_changed"));
}
