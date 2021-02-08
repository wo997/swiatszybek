/* js[global] */

/**
 * @typedef {{
 * } & ListDownBtnTraitNodes & ListUpBtnTraitNodes & ListDeleteBtnTraitNodes} ListControlTraitNodes
 */

registerCompBatchTrait(
	"list_controls",
	html`
		<p-trait data-trait="list_down_btn"></p-trait>
		<p-trait data-trait="list_up_btn"></p-trait>
		<p-trait data-trait="list_delete_btn"></p-trait>
	`
);
