/* js[!global] */

/**
 * @typedef {{
 * price: number
 * }} FitDimensionData
 */

/**
 * @typedef {{
 * carrier_id: number
 * delivery_type_id: number
 * api_key: string
 * delivery_time_days: number
 * name: string
 * img_url: string
 * fit_dimensions: FitDimensionData
 * }} AvailableCarrierData
 */

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
 * delivery_type_id: number
 * carrier_id: number
 * delivery_price: number
 * total_price: number
 * rebate_codes: {code:string, value:string}[]
 * available_carriers: AvailableCarrierData[]
 * allow_cod: boolean
 * payment_time: string
 * cod_fee: number
 * }} UserCartData
 */

/** @type {UserCartData} */
let user_cart;
/* = {
	products: [],
	total_price: 0,
	products_price: 0,
	delivery_type_id: -1,
	delivery_price: 0,
	rebate_codes: [],
	allow_cod: false,
	available_carriers: [],
};*/

function loadedUserCart() {
	window.dispatchEvent(new CustomEvent("user_cart_changed"));
	setTimeout(() => {
		resizeCartCallback();
	});
}
