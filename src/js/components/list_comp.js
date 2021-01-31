/* js[global] */

/**
 * @typedef {{
 * _data: Array
 * _prev_data: Array
 * _set_data(data?: Array, options?: SetCompDataOptions)
 * _nextRowId: number
 * _removeRow(row_index: number)
 * _moveRow(from: number, to: number)
 * _getRows(): AnyComp[]
 * _row_template: string
 * } & BaseComp} ListComp
 *
 * @typedef {{
 * row_index?: number
 * row_id?: number
 * }} ListCompRowData row_index is a part of set of consecutive numbers, meanwhile row_id is a number that uniquely defines a row even when it chagnes the order etc.
 */

/**
 * @param {ListComp} node
 * @param {*} parent
 * @param {Array} data
 */
function listComp(node, parent, data = []) {
	node._row_template = node.innerHTML;
	node._empty();

	node._set_data = (data = undefined, options = {}) => {
		if (data === undefined) {
			data = node._data;
		}

		let nextRowId = 0;

		data.forEach((row_data, index) => {
			// pass data no matter who the child is - should be defined by options cause it's inefficient to set each row every time u do anything
			if (row_data.row_id === undefined) {
				if (nextRowId === 0) {
					nextRowId = applyToArray(Math.min, [
						...data.map((e) => e.row_id).filter((e) => e),
						-1000,
					]); // that will be unique for sure
				}
				row_data.row_id = --nextRowId;
			}
			row_data.row_index = index;
			row_data.list_length = data.length;
		});

		setCompData(node, data, {
			...options,
			render: () => {
				const diff = diffArrays(node._prev_data, node._data, (e) => e.row_id);

				if (diff.length === 0) {
					return;
				}

				const diff_with_target_index = diff.map((e) => ({
					...e,
					target_index: e.to !== -1 ? e.to : e.from,
				}));

				const animation_duration = 250;

				const rows_before = node._getRows();

				/** @type {ClientRect[]} */
				const row_rects_before = [];
				rows_before.forEach((e) => {
					row_rects_before.push(e.getBoundingClientRect());
				});

				let removed_before_current = 0;

				diff_with_target_index
					.sort((a, b) => Math.sign(a.target_index - b.target_index))
					.forEach((diff_info) => {
						const remove = diff_info.to === -1;
						const add = diff_info.from === -1;

						let child = add ? undefined : rows_before[diff_info.from];

						if (add) {
							/** @type {AnyComp} */
							// @ts-ignore
							child = createNodeFromHtml(/*html*/ `
                                <div class="my_list_row_wrapper expand_y hidden animate_hidden">
                                    <div class="my_list_row"></div>
                                </div>
                            `);
						}

						const target_index_real =
							diff_info.target_index + removed_before_current;

						if (target_index_real !== diff_info.from) {
							node.insertBefore(child, node.children[target_index_real]);
						}

						if (add) {
							const row_data = node._data[diff_info.to];
							const the_row = child._child(".my_list_row");
							the_row._set_content(node._row_template);

							directComps(the_row).forEach((comp) => {
								const constructor = snakeCase(comp.tagName.toLocaleLowerCase());
								if (window[constructor]) {
									// @ts-ignore
									window[constructor](comp, node, row_data, {});
								}
							});

							expand(child, true, { duration: animation_duration });
						} else if (remove) {
							expand(child, false, { duration: animation_duration });
							child.classList.add("removing");
							setTimeout(() => {
								child.remove();
							}, animation_duration);

							removed_before_current++;
						} else {
							const rect_before = row_rects_before[diff_info.from];
							const rect_after = child.getBoundingClientRect();

							const offset_0 = Math.round(rect_before.top - rect_after.top);

							const ronscr = (r) => {
								return r.top < window.innerHeight && r.top + r.height > 0;
							};
							if (
								Math.abs(offset_0) > 2 &&
								(ronscr(rect_before) || ronscr(rect_after))
							) {
								child._animate(
									`
                                           0% {transform:translateY(${offset_0}px)}
                                           100% {transform:translateY(0px)}
                                       `,
									animation_duration
								);
							}
						}
					});
			},
		});
	};

	createComp(node, parent, data, {
		initialize: () => {
			node.classList.add("my_list");

			node._getRows = () => {
				/** @type {AnyComp[]} */
				// @ts-ignore
				const res = node._direct_children(":not(.removing)");
				return res;
			};

			node._pointChildsData = (child) => {
				let source_sub_data_index = node._data.findIndex((e) => {
					return e.row_id === child._data.row_id;
				});
				return {
					obj: node._data,
					key: source_sub_data_index === -1 ? null : source_sub_data_index,
				};
			};

			node._removeRow = (row_index) => {
				const remove_index = node._data.findIndex((d) => {
					return d.row_index === row_index;
				});
				if (remove_index !== -1) {
					node._data.splice(remove_index, 1);
					node._set_data();
				}
			};

			node._moveRow = (from, to) => {
				from = clamp(0, from, node._data.length - 1);
				to = clamp(0, to, node._data.length - 1);

				const temp = node._data.splice(from, 1);
				node._data.splice(to, 0, ...temp);
				node._set_data();
			};
		},
	});
}
