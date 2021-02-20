/**
 * @type {{
 * product_feature_id: number
 * name: string
 * options?: string
 * }[]}
 */
let product_features = [];

/**
 * @typedef {{
 * product_feature_option_id: number
 * product_feature_id: number
 * parent_product_feature_option_id: number
 * name: string
 * feature_name?: string
 * }} ProductFeatureOptionData
 *
 */

/**
 * @type {ProductFeatureOptionData[]}
 */
let product_feature_options = [];

/**
 * @type {{
 * vat_id: number
 * value: number
 * }[]}
 */
let vats = [];

let general_product_data;
