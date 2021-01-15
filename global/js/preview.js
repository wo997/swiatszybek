/* js[admin_everywhere] */

// get info bout closest block so u can scroll baby oh yeah mmhmmmmhmhmmhmh
const half_screen_height = window.innerHeight * 0.5;

function getCenterCmsBlockInfo(cms_container) {
	const dist_info = cms_container._children(".cms-block").reduce(
		(dist_info, block, block_index) => {
			const block_rect = block.getBoundingClientRect();
			const dist_to_center =
				block_rect.top + block_rect.height * 0.5 - half_screen_height;
			if (Math.abs(dist_to_center) < Math.abs(dist_info.dist_to_center)) {
				dist_info.dist_to_center = dist_to_center;
				dist_info.block_index = block_index;
			}
			return dist_info;
		},
		{ dist_to_center: 100000000, block_index: -1 }
	);

	return dist_info;
}

domload(() => {
	setTimeout(() => {
		if (typeof preview_params !== "undefined") {
			const cms_wrapper = $(`[data-cms-src="${preview_params.content_name}"]`);
			const cms_blocks = cms_wrapper._children(".cms-block").filter((block) => {
				return !block._parent("[data-module-block]");
			});
			const block_index = preview_params.dist_info.block_index;
			const block_we_wanna_see = cms_blocks[block_index];
			if (block_we_wanna_see) {
				block_we_wanna_see_rect = block_we_wanna_see.getBoundingClientRect();
				const dist_to_center =
					block_we_wanna_see_rect.top +
					block_we_wanna_see_rect.height * 0.5 -
					half_screen_height;

				var diff = dist_to_center - preview_params.dist_info.dist_to_center;

				const scroll_parent = findScrollParent(cms_wrapper);
				scroll_parent.scrollBy(0, diff);
				smoothScroll();
			}
		}
	}, 0);
});
