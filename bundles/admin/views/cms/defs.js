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
 * match: RegExp
 * priority?: number
 * }} TagGroup
 */

/**
 * @typedef {{
 * selector: string
 * tag_groups?: TagGroup[]
 * }} cmsFloatingEditableProp
 */

/**
 * @typedef {{
 * selector: string
 * tag_groups?: TagGroup[]
 * type_groups: cmsEditableGroupEnum[]
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

/**
 * @typedef {{
 * var_name: string
 * hex: string
 * }} piepColor
 */
