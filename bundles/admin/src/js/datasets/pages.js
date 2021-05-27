/* js[!admin] */

/**
 * @typedef {{
 * page_id: number
 * template_id: number
 * seo_title: string
 * active: number
 * version: number
 * url: string
 * link_what_id: string
 * v_dom_json: string
 * created_at: string
 * modified_at: string
 * page_type: string
 * }} PageData
 */

/** @type {PageData[]} */
let pages;

function loadedPages() {}
