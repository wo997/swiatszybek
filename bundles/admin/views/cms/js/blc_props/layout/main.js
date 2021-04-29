/* js[piep_cms_dependencies] */
{
	/**
	 *
	 * @param {vDomNode} v_node
	 * @returns
	 */
	const inVerticalContainerMatcher = (v_node) => {
		const parent_v_node = piep_cms.getVDomNodeDataById(piep_cms.v_dom, v_node.id).parent_v_nodes[0];
		return !parent_v_node || parent_v_node.classes.includes("vertical_container");
	};

	/**
	 *
	 * @param {vDomNode} v_node
	 * @returns
	 */
	const verticalContainerMatcher = (v_node) => {
		return v_node.classes.includes("vertical_container");
	};

	/**
	 *
	 * @param {vDomNode} v_node
	 * @returns
	 */
	const columnsContainerMatcher = (v_node) => {
		return v_node.classes.includes("columns_container");
	};

	piep_cms_props_handler.registerProp({
		selector: ".prop_width",
		blc_groups: [
			{ match_tag: this.match_media_tags, priority: 1 },
			{ match_tag: /.*/, priority: 0 },
		],
		type_groups: ["layout"],
	});

	piep_cms_props_handler.registerProp({
		selector: ".prop_height",
		type_groups: ["layout"],
	});

	piep_cms_props_handler.registerProp({
		selector: ".prop_margin",
		type_groups: ["layout"],
	});

	piep_cms_props_handler.registerProp({
		selector: ".prop_padding",
		type_groups: ["layout"],
	});

	piep_cms_props_handler.registerProp({
		selector: ".prop_alignSelfHorizontally",
		blc_groups: [
			{
				matcher: inVerticalContainerMatcher,
				//priority: 1,
			},
		],
		type_groups: ["layout"],
	});

	piep_cms_props_handler.registerProp({
		selector: ".prop_alignSelfVertically",
		blc_groups: [
			{
				matcher: verticalContainerMatcher,
				//priority: 1,
			},
		],
		type_groups: ["layout"],
	});

	piep_cms_props_handler.registerProp({
		selector: ".prop_justifyContentHorizontally",
		blc_groups: [
			{
				matcher: columnsContainerMatcher,
				//priority: 1,
			},
		],
		type_groups: ["layout"],
	});

	piep_cms_props_handler.registerProp({
		selector: ".prop_alignItemsVertically",
		blc_groups: [
			{
				matcher: columnsContainerMatcher,
				//priority: 1,
			},
		],
		type_groups: ["layout"],
	});

	piep_cms_props_handler.registerProp({
		selector: ".prop_justifyContentVertically",
		blc_groups: [
			{
				matcher: verticalContainerMatcher,
				//priority: 1,
			},
		],
		type_groups: ["layout"],
	});

	piep_cms_props_handler.registerProp({
		selector: ".prop_alignItemsHorizontally",
		blc_groups: [
			{
				matcher: verticalContainerMatcher,
				//priority: 1,
			},
		],
		type_groups: ["layout"],
	});

	piep_cms_props_handler.registerFloatingProp({
		selector: ".layout_btn",
	});

	piep_cms_props_handler.registerFloatingProp({
		selector: ".move_btn",
	});

	piep_cms_props_handler.registerFloatingProp({
		selector: ".remove_btn",
	});
}
