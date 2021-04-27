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
 * styles: any
 * children?: vDomNode[]
 * attrs: object
 * classes: string[]
 * insert_on_release?: boolean
 * module_name?: string
 * module_attrs?: object
 * module_children?: vDomModuleNode[]
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

/**
 * @typedef {{
 * type: ("move" | "insert")
 * }} GrabBlockOptions
 */

/**
 * @typedef {"column" | "row"} FlowDirectionEnum
 */
