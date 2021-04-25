/* js[!admin] */

/**
 * @typedef {{
 * active: number
 * general_product_id: number
 * gross_price: string
 * height: string
 * length: string
 * net_price: string
 * product_id: number
 * stock: number
 * vat_id: number
 * weight: string
 * width: string
 * __img_url: string
 * __name: string
 * __options_json: string
 * __queue_count: number
 * __url: string
 * }} ProductData
 */

/** @type {ProductData[]} */
let products = [];

function loadedProducts() {}
