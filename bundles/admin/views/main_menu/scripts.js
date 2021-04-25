/* js[view] */

domload(() => {
	/** @type {MenusComp} */
	// @ts-ignore
	const menus_comp = $("menus-comp.main");

	MenusComp(menus_comp, undefined);

	$(".main_header .history_btns_wrapper").appendChild(menus_comp._nodes.history);
	$(".main_header .save_btn_wrapper").appendChild(menus_comp._nodes.save_btn);

	/** @type {SelectableComp} */
	// @ts-ignore
	const selectable = $("selectable-comp");

	SelectableComp(selectable, undefined, {
		value: "xxx",
		dataset: [
			{ value: "11", label: "abc" },
			{ value: "12", label: "abcd" },
			{ value: "13", label: "xx x vcvxcv dvxc vx" },
		],
	});
});
