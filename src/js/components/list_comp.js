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
 * @param {ListComp} comp
 * @param {*} parent
 * @param {Array} data
 */
function listComp(comp, parent, data = []) {
	comp._row_template = comp.innerHTML;
	const is_horizontal = comp.classList.contains("horizontal");
	comp._empty();

	comp._primary_key = comp.dataset.primary;

	comp._pointChildsData = (child) => {
		let source_sub_data_index = comp._data.findIndex((e) => {
			return e.row_id === child._data.row_id;
		});
		return {
			obj: comp._data,
			key: source_sub_data_index === -1 ? null : source_sub_data_index,
		};
	};

	comp._set_data = (data = undefined, options = {}) => {
		if (data === undefined) {
			data = comp._data;
		}

		let nextRowId = 0;

		data.forEach((row_data, index) => {
			// pass data no matter who the child is - should be defined by options cause it's inefficient to set each row every time u do anything
			if (row_data.row_id === undefined) {
				const pk = comp._primary_key;
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

		setCompData(comp, data, {
			...options,
			render: () => {
				const diff = diffArrays(comp._prev_data, comp._data, (e) => e.row_id);

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

				const animation_duration = instant ? 0 : 250;

				let removed_before_current = 0;

				const rows_before = comp._getRows();

				rows_before.forEach((child) => {
					// @ts-ignore
					child.rect_before = child.getBoundingClientRect();
				});

				/** @type {PiepNode[]} */
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
					}

					if (remove) {
						setTimeout(() => {
							child.remove();
						}, animation_duration);

						removed_before_current++;
					}

					const target_index_real = diff_info.target_index + removed_before_current;

					comp.insertBefore(child, comp.children[target_index_real]);

					if (add) {
						const row_data = comp._data[diff_info.to];
						child._set_content(comp._row_template);

						directComps(child).forEach((dc) => {
							const constructor = snakeCase(dc.tagName.toLocaleLowerCase());
							if (window[constructor]) {
								// @ts-ignore
								window[constructor](dc, comp, row_data);
							}
						});
					}

					animatable_rows.push(child);

					// @ts-ignore
					if (!child.rect_before) {
						// @ts-ignore
						child.rect_before = child.getBoundingClientRect();
					}
				});

				const list_rect_before = comp.getBoundingClientRect();

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

				const list_rect_after = comp.getBoundingClientRect();

				const list_dl = list_rect_after.left - list_rect_before.left;
				const list_dt = list_rect_after.top - list_rect_before.top;

				index = -1;
				diff_with_target_index.forEach((diff_info) => {
					index++;

					const remove = diff_info.to === -1;
					const add = diff_info.from === -1;

					const child = animatable_rows[index];

					if (remove) {
						child.classList.remove("cramp_row");
						if (is_horizontal) {
							child.style.marginRight = -child.offsetWidth + "px";
						} else {
							child.style.marginBottom = -child.offsetHeight + "px";
						}
					}

					// @ts-ignore
					let rect_before = child.rect_before;
					// @ts-ignore
					let rect_after = child.rect_after;

					let off_x = list_dl;
					let off_y = list_dt;

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
						child.classList.add("removing");
					}
					if (add) {
						if (is_horizontal) {
							off_x -= rect_after.width;
						} else {
							off_y -= rect_after.height;
						}
					}

					/**
					 *
					 * @param {ClientRect} r
					 */
					const ronscr = (r) => {
						return r.top < window.innerHeight && r.top + r.height > 0 && r.left < window.innerWidth && r.left + r.width > 0;
					};
					child.style.zIndex = "" + (1 + Math.abs(off_x) + Math.abs(off_y) + (add || remove ? 0 : 1000));

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

				comp.classList.add("animating");
				comp._animate(
					`
                        0% {width:${list_rect_before.width}px;height:${list_rect_before.height}px;}
				        100% {width:${list_rect_after.width}px;height:${list_rect_after.height}px;}
				    `,
					animation_duration,
					{
						callback: () => {
							comp.classList.remove("animating");
						},
					}
				);
			},
		});
	};

	createComp(comp, parent, data, {
		initialize: () => {
			comp._getRows = () => {
				/** @type {AnyComp[]} */
				// @ts-ignore
				const res = comp._direct_children(":not(.removing)");
				return res;
			};

			comp._removeRow = (row_index) => {
				const remove_index = comp._data.findIndex((d) => {
					return d.row_index === row_index;
				});
				if (remove_index !== -1) {
					comp._data.splice(remove_index, 1);
					comp._set_data();
				}
			};

			comp._moveRow = (from, to) => {
				from = clamp(0, from, comp._data.length - 1);
				to = clamp(0, to, comp._data.length - 1);

				const temp = comp._data.splice(from, 1);
				comp._data.splice(to, 0, ...temp);
				comp._set_data();
			};
		},
	});
}
