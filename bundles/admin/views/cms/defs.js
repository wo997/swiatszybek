/**
 * @typedef {{
 * id: number
 * tag: string
 * text?: string
 * styles: any
 * children?: vDomNode[]
 * attrs: object
 * classes: string[]
 * insert?: boolean
 * }} vDomNode
 */

/**
 * @typedef {"all" | "appearance" | "layout" | "advanced"} cmsEditableGroupEnum
 */

/**
 * @typedef {{
 * name: string
 * match_tag?: RegExp
 * groups: cmsEditableGroupEnum[]
 * }} cmsEditableProp
 */

/**
 *
 * @typedef {{
 * ignore_insert?: boolean
 * }} findVDomOptions
 */

/**
 * @typedef {{
 * _insert_action()
 * _popup_blcs: insertBlc[]
 * } & PiepNode} insertBlc
 */

/**
 * @typedef {"left" | "right" | "top" | "bottom" | "center"} insertPosEnum
 */
