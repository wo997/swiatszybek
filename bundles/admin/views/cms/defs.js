/**
 * @typedef {{
 * child_name?: string
 * } & vDomNode} vDomModuleNode
 * TODO: naming might be important when creating more complex modules and when we would want to assign a node to some predefined section
 */

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
 * module_children?: vDomModuleNode[]
 * }} vDomNode
 *
 * styles is an array "" "bg" "sm" ... and then another array of fontSize paddintTop ...
 */

/**
 * @typedef {"all" | "appearance" | "layout" | "advanced"} cmsEditableGroupEnum
 */

/**
 * @typedef {{
 * match_tag?: RegExp
 * has_classes?: string[]
 * matcher?(v_node: vDomNode): boolean
 * priority?: number
 * }} BlcGroup
 */

/**
 * @typedef {{
 * selector: string
 * tag_groups?: BlcGroup[]
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
