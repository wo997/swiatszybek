/**
 * @typedef {{
 * v_dom: vDomNode[]
 * text_selection: PiepTextSelection
 * focus_vid: number
 * resolution: string
 * }} PiepCMSEditHistory
 */

/**
 * @typedef {"needs_size" | "has_content" | "just_content"} BlcWidthSchema
 *
 * has_content - containers, text_containers, buttons, other modules
 * needs_size - images, videos (media?)
 * just_content - icons, textables
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
 * settings?: object
 * responsive_settings?: object
 * module_name?: string
 * module_hook_id?: string
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
 * }} EditBlcGroup
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
 * hide_for_empty_text_selection?: boolean
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
 * blc_groups?: EditBlcGroup[]
 * menu_html: string
 * advanced?: boolean
 * affects_selection?: boolean
 * init?(piep_cms: PiepCMS, menu_wrapper: PiepNode)
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
 * @typedef {"topleft" | "topright" | "bottomleft" | "bottomright"} CornerEnum
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
 * @typedef {"text" | "container" | "media" | "module"} CmsBlockGroup
 */

/**
 * @typedef {"column" | "row" | "inline" | "text_list" | "grid"} FlowDirectionEnum
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
 * standalone?: boolean
 * inline?: boolean
 * priority?: number
 * render_html?(v_node?: vDomNode): string
 * render?(v_node: vDomNode, node: PiepNode, piep_cms: PiepCMS)
 * place_node?(v_node: vDomNode, node: PiepNode, parent_node: PiepNode, piep_cms: PiepCMS)
 * rerender_on?: string[]
 * backend_render?: boolean
 * is_advanced?: boolean
 * group: CmsBlockGroup
 * can_have_aspect_ratio?: boolean
 * cannot_nest_in_itself?: boolean
 * layout_schema: BlcWidthSchema
 * exclude_from_add_blc_menu?: boolean
 * }} BlockSchema
 *
 * standalone stands for the blc not requiring a parent container that is responsible for width etc
 */

/**
 * @typedef {{
 * vid: number
 * opacity: number
 * }} ShowFocusToNodeData
 */

/**
 * @typedef {{
 * v_node: vDomNode
 * }} CmsClipboarItem
 */

/**
 * @typedef {"side" | "float"} PiepCMSMenuName
 */
