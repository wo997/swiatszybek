/**
 * @typedef {{
 * id: number
 * tag: string
 * text?: string
 * styles: object
 * children?: vDomNode[]
 * attrs: object
 * classes: string[]
 * settings?: object
 * module_name?: string
 * module_children?: vDomNode[]
 * template_hook_id?: string
 * disabled?: boolean
 * rendered_body?: string
 * rendered_css_content?: string
 * }} vDomNode
 *
 * styles is an array "df" "bg" "sm" ... and then another array of fontSize paddingTop ...
 * template_hook_id is used to place a v_node in a template or module
 */

/**
 * @typedef {{
 * vid: number
 * start: number
 * end: number
 * }} PiepTextPartialRange
 */

/**
 * @typedef {-1 | 0 | 1} Direction
 */

/**
 * @typedef {{
 * anchor_vid: number
 * anchor_offset: number
 * focus_vid: number
 * focus_offset: number
 * middle_vids: number[]
 * partial_ranges: PiepTextPartialRange[]
 * direction: Direction
 * length: number
 * single_node: boolean
 * }} PiepTextSelection
 */

/**
 * @typedef {"all" | "appearance" | "layout" | "advanced"} cmsEditableGroupEnum
 */

/**
 * @typedef {{
 * match_tag?: RegExp
 * has_classes?: string[]
 * module_names?: string[]
 * matcher?(v_node_data: vDomNodeData, piep_cms: PiepCMS): boolean
 * priority?: number
 * exclude?: boolean
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
 * } & cmsEditablePropBase} cmsFloatingEditableProp
 */

/**
 * @typedef {{
 * name: string
 * type_groups: cmsEditableGroupEnum[]
 * } & cmsEditablePropBase} cmsEditableProp
 */

/**
 * @typedef {{
 * name: string
 * blc_groups?: BlcGroup[]
 * menu_html: string
 * affects_selection?: boolean
 * init?(piep_cms: PiepCMS)
 * }} cmsEditablePropBase
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
 * type?: ("move" | "insert")
 * is_new?: boolean
 * }} GrabBlockOptions
 */

/**
 * @typedef {"column" | "row" | "inline" | "text_list"} FlowDirectionEnum
 */

/**
 * @typedef {{
 * id: string
 * label: string
 * icon: string
 * v_node: vDomNode
 * single_usage?: boolean
 * tooltip?: string
 * page_type?: string
 * nonclickable?: boolean
 * priority?: number
 * render?(v_node?: vDomNode): string
 * rerender_on?: string[]
 * backend_render?: boolean
 * is_advanced?: boolean
 * }} BlockSchema
 */

/**
 * @typedef {{
 * vid: number
 * opacity: number
 * }} ShowFocusToNodeData
 */

/**
 * @typedef {"side" | "float"} PiepCMSMenuName
 */
