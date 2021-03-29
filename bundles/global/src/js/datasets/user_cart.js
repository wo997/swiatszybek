/* js[!global] */

/**
 * @typedef {{
 * product_id: number
 * general_product_id: number
 * name: string
 * qty: number
 * gross_price: number
 * net_price: number
 * img_url: string
 * url: string
 * stock: number
 * }} UserCartProductData
 */

/**
 * @typedef {{
 * products: UserCartProductData[]
 * products_price: number
 * delivery_price: number
 * total_price: number
 * rebate_codes: {code:string, value:string}[]
 * }} UserCartData
 */

/**
 * @type {UserCartData}
 */
let user_cart = { products: [], total_price: 0, products_price: 0, delivery_price: 0, rebate_codes: [] };

function loadedUserCart() {
	window.dispatchEvent(new CustomEvent("user_cart_changed"));
	setTimeout(() => {
		resizeCartCallback();
	});
}
