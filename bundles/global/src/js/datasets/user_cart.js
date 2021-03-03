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
 * }} UserCartProductData
 */

/**
 * @typedef {{
 * products: UserCartProductData[]
 * products_data: any
 * }} UserCartData
 */

/**
 * @type {UserCartData}
 */
let user_cart = { products: [], products_data: [] };

function loadedUserCart() {
	user_cart.products.forEach((product) => {
		const data = user_cart.products_data.find((x) => x.product_id === product.product_id);
		if (data) {
			product.net_price = data.net_price;
			product.gross_price = data.gross_price;
			product.name = data.__name;
			product.url = data.__url;
			product.general_product_id = data.general_product_id;
			product.img_url = data.__img_url;
		}
	});
}
