/* js[!admin] */

/**
 * @typedef {{
 * transaction_id: number
 * buyer_id?: number
 * buyer?: AddressCompData
 * seller_id?: number
 * seller?: AddressCompData
 * is_expense: number
 * created_at?: string
 * paid_at?: string
 * net_price: number
 * gross_price: number
 * transaction_products?: TransactionProductData[]
 * }} TransactionData
 */
