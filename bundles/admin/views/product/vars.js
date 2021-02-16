/**
 * @type {{
 * product_feature_id: number
 * name: string
 * options?: string
 * }[]}
 */
let product_features = [];

/**
 * @type {{
 * product_feature_option_id: number
 * product_feature_id: number
 * name: string
 * feature_name?: string
 * }[]}
 */
let product_feature_options = [];

/**
 * @type {{
 * vat_id: number
 * value: number
 * }[]}
 */
let vats = [];
