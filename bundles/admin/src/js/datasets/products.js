/* js[!admin] */

/**
 * @typedef {{
 * active: number
 * general_product_id: number
 * net_price: number
 * vat_id: number
 * gross_price: number
 * discount_gross_price?: number,
 * discount_untill?: string,
 * __current_gross_price: number
 * height: string
 * length: string
 * product_id: number
 * stock: number
 * weight: string
 * width: string
 * __img_url: string
 * __name: string
 * __options_json: string
 * __queue_count: number
 * __url: string
 * gp_active: number
 * gp_name: string
 * gp_product_type: string
 * gp__avg_rating: string
 * gp__features_html: string
 * gp__images_json: string
 * gp__img_url: string
 * gp__options_json: string
 * gp__rating_count: number
 * gp__search: string
 * gp__url: string
 * }} ProductData
 */

/** @type {ProductData[]} */
let products;

function loadedProducts() {}
