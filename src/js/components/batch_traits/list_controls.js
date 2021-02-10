/* js[global] */

/**
 * @typedef {{
 * } & ListDownBtnTraitNodes & ListUpBtnTraitNodes & ListDeleteBtnTraitNodes} ListControlTraitNodes
 */

registerCompBatchTrait(
	"list_controls",
	IS_TOUCH_DEVICE
		? html`
				<p-trait data-trait="list_down_btn"></p-trait>
				<p-trait data-trait="list_up_btn"></p-trait>
				<p-trait data-trait="list_delete_btn"></p-trait>
		  `
		: html`
				<p-trait data-trait="list_grab_btn"></p-trait>
				<p-trait data-trait="list_delete_btn"></p-trait>
		  `
);
