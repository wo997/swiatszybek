/**
 * @typedef {{
 * id: number
 * tag: string
 * text?: string
 * styles: object
 * children?: vDomNode[]
 * attrs: object
 * classes: string[]
 * insert_on_release?: boolean
 * settings?: object
 * module_name?: string
 * module_children?: vDomNode[]
 * template_hook_id?: string
 * disabled?: boolean
 * }} vDomNode
 *
 * styles is an array "df" "bg" "sm" ... and then another array of fontSize paddingTop ...
 * template_hook_id is used to place a v_node in a template or module
 */

/**
 * @typedef {"all" | "appearance" | "layout" | "advanced"} cmsEditableGroupEnum
 */

/**
 * @typedef {{
 * match_tag?: RegExp
 * has_classes?: string[]
 * module_names?: string[]
 * matcher?(v_node_data: vDomNodeData): boolean
 * priority?: number
 * }} BlcGroup
 */

/**
 *
 * @typedef {{
 * v_node: vDomNode
 * v_nodes: vDomNode[]
 * index: number
 * parent_v_nodes: vDomNode[]
 * }} vDomNodeData
 *
 * parent_v_nodes are ordered so the closest one is the direct parent
 */

/**
 * @typedef {{
 * name: string
 * blc_groups?: BlcGroup[]
 * menu_html: string
 * }} cmsFloatingEditableProp
 */

/**
 * @typedef {{
 * name: string
 * blc_groups?: BlcGroup[]
 * type_groups: cmsEditableGroupEnum[]
 * menu_html: string
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
 * @typedef {"left" | "right" | "top" | "bottom"} DirectionEnum
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

/**
 * @typedef {{
 * type: ("move" | "insert")
 * }} GrabBlockOptions
 */

/**
 * @typedef {"column" | "row"} FlowDirectionEnum
 */

/**
 * @typedef {{
 * id: string
 * label: string
 * icon: string
 * v_node: vDomNode
 * single_usage?: boolean
 * }} BlockToAdd
 */
