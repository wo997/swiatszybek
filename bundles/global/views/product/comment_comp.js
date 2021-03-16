/* js[global] */

/**
 *
 * @typedef {{
 *  nickname?: string,
 *  created_at?: string,
 *  comment?: string
 *  rating?: number
 * } & ListCompRowData} CommentCompData
 *
 * @typedef {{
 *  _data: CommentCompData
 *  _set_data(data?: CommentCompData, options?: SetCompDataOptions)
 *  _getData()
 *  _nodes: {
 *      rating: PiepNode
 *  }
 * } & BaseComp} CommentComp
 */

/**
 * @param {CommentComp} comp
 * @param {*} parent
 * @param {CommentCompData} data
 */
function commentComp(comp, parent, data = {}) {
	comp._set_data = (data, options = {}) => {
		setCompData(comp, data, {
			...options,
			render: () => {
				let rating_html = "";
				for (let i = 1; i <= 5; i++) {
					const cls = i <= data.rating ? "fas fa-star" : "far fa-star";
					rating_html += html`<i class="${cls}"></i>`;
				}
				comp._nodes.rating._set_content(rating_html);
			},
		});
	};

	createComp(comp, parent, data, {
		template: html`
			<span class="nick_rating">
				<span class="nickname" html="{${data.nickname}}"></span>
				<span class="rating" data-node="{${comp._nodes.rating}}"></span>
			</span>
			<span class="created_at" html="{${data.created_at}}"></span>
			<div class="comment" html="{${data.comment}}"></div>
		`,
		ready: () => {},
	});
}
