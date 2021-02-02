/* js[global] */

/**
 * @typedef {{
 * _data: Array
 * _prev_data: Array
 * _set_data(data?: Array, options?: SetCompDataOptions)
 * _removeRow(row_index: number)
 * _moveRow(from: number, to: number)
 * _getRows(): AnyComp[]
 * _row_template: string
 * _primary_key: string | undefined
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
	const is_horizontal = node.classList.contains("horizontal");
	node._empty();

	node._primary_key = node.dataset.primary;

	node._pointChildsData = (child) => {
		let source_sub_data_index = node._data.findIndex((e) => {
			return e.row_id === child._data.row_id;
		});
		return {
			obj: node._data,
			key: source_sub_data_index === -1 ? null : source_sub_data_index,
		};
	};

	node._set_data = (data = undefined, options = {}) => {
		if (data === undefined) {
			data = node._data;
		}

		let nextRowId = 0;

		data.forEach((row_data, index) => {
			// pass data no matter who the child is - should be defined by options cause it's inefficient to set each row every time u do anything
			if (row_data.row_id === undefined) {
				const pk = node._primary_key;
				if (pk) {
					let ref = row_data;
					pk.split(".").forEach((e) => {
						ref = ref[e];
					});
					row_data.row_id = ref;
				} else {
					if (nextRowId === 0) {
						nextRowId = applyToArray(Math.min, [...data.map((e) => e.row_id).filter((e) => e), -1000]); // that will be unique for sure
					}
					row_data.row_id = --nextRowId;
				}
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

				const diff_with_target_index = diff
					.map((e) => ({
						...e,
						target_index: e.to !== -1 ? e.to : e.from,
					}))
					.sort((a, b) => Math.sign(a.target_index - b.target_index));

				let instant = false;

				let added = 0;
				let removed = 0;
				let all = diff.length;

				// if (!instant) {
				// 	for (const d of diff) {
				// 		if (d.from === -1) {
				// 			added++;
				// 		}
				// 		if (d.to === -1) {
				// 			removed++;
				// 		}
				// 	}
				// }

				// adding and removing, if we have too many of these we won't animate the list, simple
				if (added * removed > all * all * 0.25) {
					//instant = true;
				}

				const animation_duration = instant ? 0 : 1000;

				const list_w_before = node.offsetWidth;
				const list_h_before = node.offsetHeight;

				let removed_before_current = 0;

				const rows_before = node._getRows();

				rows_before.forEach((child) => {
					// @ts-ignore
					child.rect_before = child.getBoundingClientRect();
				});

				const animatable_rows = [];

				diff_with_target_index.forEach((diff_info) => {
					const remove = diff_info.to === -1;
					const add = diff_info.from === -1;

					let child = add ? undefined : rows_before[diff_info.from];

					if (add) {
						/** @type {AnyComp} */
						// @ts-ignore
						child = createNodeFromHtml(/*html*/ `<div class="list_row"></div>`);
						child.classList.add("cramp_row");

						const row_data = node._data[diff_info.to];
						child._set_content(node._row_template);

						directComps(child).forEach((comp) => {
							const constructor = snakeCase(comp.tagName.toLocaleLowerCase());
							if (window[constructor]) {
								// @ts-ignore
								window[constructor](comp, node, row_data, {});
							}
						});
					}

					if (remove) {
						setTimeout(() => {
							child.remove();
						}, animation_duration);

						removed_before_current++;
					}

					const target_index_real = diff_info.target_index + removed_before_current;

					node.insertBefore(child, node.children[target_index_real]);

					animatable_rows.push(child);

					// @ts-ignore
					if (!child.rect_before) {
						// @ts-ignore
						child.rect_before = child.getBoundingClientRect();
					}
				});

				let index = -1;
				diff_with_target_index.forEach((diff_info) => {
					index++;

					const remove = diff_info.to === -1;
					const add = diff_info.from === -1;

					let child = animatable_rows[index];

					if (add) {
						child.classList.remove("cramp_row");
					}
					if (remove) {
						child.classList.add("cramp_row");
					}
				});

				animatable_rows.forEach((child) => {
					// @ts-ignore
					child.rect_after = child.getBoundingClientRect();
				});

				index = -1;
				diff_with_target_index.forEach((diff_info) => {
					index++;

					const remove = diff_info.to === -1;
					const add = diff_info.from === -1;

					const child = animatable_rows[index];

					// @ts-ignore
					let rect_before = child.rect_before;
					// @ts-ignore
					let rect_after = child.rect_after;

					let off_x = 0;
					let off_y = 0;

					if (rect_before && rect_after) {
						off_x += rect_before.left - rect_after.left;
						off_y += rect_before.top - rect_after.top;
					}

					let after_x = 0;
					let after_y = 0;
					if (remove) {
						if (is_horizontal) {
							after_x -= rect_after.width * 0.5;
						} else {
							after_y -= rect_after.height * 0.5;
						}
					}
					if (add) {
						if (is_horizontal) {
							off_x -= rect_after.width * 0.5;
						} else {
							off_y -= rect_after.height * 0.5;
						}
					}

					/**
					 *
					 * @param {ClientRect} r
					 */
					const ronscr = (r) => {
						return r.top < window.innerHeight && r.top + r.height > 0 && r.left < window.innerWidth && r.left + r.width > 0;
					};
					child.style.zIndex = "" + (Math.abs(off_x) + Math.abs(off_y) + (add || remove ? 0 : 1000));

					setTimeout(() => {
						child.style.zIndex = "";
					}, animation_duration);

					if (
						(add || remove || Math.abs(off_y) > 2 || Math.abs(off_x) > 2) &&
						((rect_before && ronscr(rect_before)) || (rect_after && ronscr(rect_after)))
					) {
						child._animate(
							`
						        0% {transform:translate(${off_x}px,${off_y}px);opacity:${add ? 0 : 1};}
						        100% {transform:translate(${after_x}px,${after_y}px);opacity:${remove ? 0 : 1};}
						    `,
							animation_duration
						);
					}
				});
				node._animate(
					`
				        0% {width:${list_w_before}px;height:${list_h_before}px;}
				        100% {width:${node.offsetWidth}px;height:${node.offsetHeight}px;}
				    `,
					animation_duration
				);
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
