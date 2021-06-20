/* js[!global] */

/**
 * @typedef {{
 * carrier_id: number
 * name: string
 * delivery_type_id: number
 * active: number
 * api_key: string
 * delivery_time_days: number
 * dimensions_json: number
 * google_maps_embed_code: string
 * google_maps_share_link: string
 * img_url: string
 * pos: number
 * __full_name: string
 * }} CarrierData
 *
 */

/**
 * @type {CarrierData[]}
 */
let carriers = [];

function loadedCarriers() {}
