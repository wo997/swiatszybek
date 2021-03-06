/* js[global] */

/**
 * @typedef {{
 * _data: Array
 * _prev_data: Array
 * _set_data(data?: Array, options?: SetCompDataOptions)
 * _remove_row(row_index: number)
 * _move_row(from: number, to: number)
 * _getRows(): AnyComp[]
 * _row_template: string
 * _primary_key: string | undefined
 * _finish_animation()
 * } & BaseComp} ListComp
 *
 * @typedef {{
 * row_index?: number
 * row_id?: number
 * list_length?: number
 * }} ListCompRowData row_index is a part of set of consecutive numbers, meanwhile row_id is a number that uniquely defines a row even when it chagnes the order etc.
 */

/**
 * @param {ListComp} comp
 * @param {*} parent
 * @param {Array} data
 */
function ListComp(comp, parent, data = []) {
	comp._row_template = comp.innerHTML;
	const is_horizontal = comp.classList.contains("horizontal");
	comp._empty();

	comp._primary_key = comp.dataset.primary;

	comp._pointChildsData = (child) => {
		if (!child || !child._data) {
			return undefined;
		}
		let source_sub_data_index = comp._data.findIndex((e) => {
			return e.row_id === child._data.row_id;
		});
		return {
			obj: comp._data,
			key: source_sub_data_index === -1 ? null : source_sub_data_index,
		};
	};

	comp._finish_animation = () => {
		comp._children(".to_remove").forEach((e) => {
			e.remove();
		});

		comp._direct_children().forEach((child) => {
			child.classList.remove("cramp_row");
			child.style.transform = "";
			// @ts-ignore
			child._translateX = 0;
			// @ts-ignore
			child._translateY = 0;
			// @ts-ignore
			child._scale = 1;
		});
	};

	comp._set_data = (data, options = {}) => {
		if (!data) {
			return;
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
				}
				if (row_data.row_id === undefined || row_data.row_id === -1) {
					if (nextRowId === 0) {
						nextRowId = Math.min(-1000, ...data.map((e) => e.row_id).filter((e) => e));
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
				const timer = Math.floor(Math.random() * 1000) + "";
				const diff = diffArrays(comp._prev_data, data, (e) => e.row_id);

				if (diff.length === 0) {
					return;
				}

				let instant = !!(comp._parent(".freeze") || comp._parent(".hidden")) || OPTIMIZE_COMPONENTS; // || diff.length > 15;
				let chaos = false;

				finishNodeAnimation(comp);
				let row_c_before = 0;
				comp._getRows().forEach((e) => {
					row_c_before++;
					finishNodeAnimation(e);
				});

				const diff_with_target_index = diff
					.map((e) => ({
						...e,
						target_index: e.to !== -1 ? e.to : e.from,
					}))
					.sort((a, b) => Math.sign(a.target_index - b.target_index));

				let added = 0;
				let removed = 0;

				let removed_before_current = 0;

				const rows_before = comp._getRows();

				rows_before.forEach((child) => {
					// @ts-ignore
					child.rect_before = child.getBoundingClientRect();
				});

				/** @type {PiepNode[]} */
				const animatable_rows = [];

				// console.log(comp);
				// console.time(timer);
				diff_with_target_index.forEach((diff_info) => {
					const remove = diff_info.to === -1;
					const add = diff_info.from === -1;

					let child = add ? undefined : rows_before[diff_info.from];

					if (add) {
						/** @type {AnyComp} */
						// @ts-ignore
						child = $(document.createElement("DIV"));
						child.classList.add("list_row", "cramp_row");
						child.style.opacity = "0";
						added++;
					}

					if (remove) {
						child.classList.add("to_remove");
						removed_before_current++;
						removed++;
					}

					const target_index_real = diff_info.target_index + removed_before_current;

					comp.insertBefore(child, comp.children[target_index_real]);

					if (add) {
						const row_data = data[diff_info.to];
						child._set_content(comp._row_template);
						const pk = comp._primary_key;
						if (pk) {
							let ref = row_data;
							pk.split(".").forEach((e) => {
								ref = ref[e];
							});

							// @ts-ignore
							if (isNaN(ref) && !comp.shown_primary_key_error) {
								console.error("Error with primary key", comp);
								// @ts-ignore
								comp.shown_primary_key_error = true;
							}
							child.dataset.primary = ref;
						}

						directComps(child).forEach((dc) => {
							const constructor = compTitleCase(dc.tagName.toLocaleLowerCase());
							if (window[constructor]) {
								// TODO: add pass_list_data to row_data XD,
								// then Product_VariantOptionComp will work better without unnecessary checks
								// @ts-ignore
								window[constructor](dc, comp, row_data);
							} else {
								console.error(`Constructor ${constructor} is missing`);
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
				//console.timeEnd(timer);

				// adding and removing, if we have too many of these we won't animate the list, simple
				const row_c_after = diff_with_target_index.length - removed;
				const row_c = Math.min(row_c_before, row_c_after);
				if (added * removed > row_c * row_c * 0.25) {
					//instant = true;
					chaos = true;
					instant = true;
				}

				const duration = instant ? 0 : 250;

				registerForms();

				const list_rect_before = comp.getBoundingClientRect();

				const finish = () => {
					if (!options.delay_change) {
						comp._finish_animation();
					}
				};

				if (instant) {
					comp.dispatchEvent(new CustomEvent("instant"));
				}

				// chaos = true;
				// console.log(instant, chaos);
				// if (chaos) {
				// 	finish();
				// } else {
				let row_margin_top = undefined;

				let index = -1;
				diff_with_target_index.forEach((diff_info) => {
					index++;

					const remove = diff_info.to === -1;
					const add = diff_info.from === -1;

					let child = animatable_rows[index];

					if (add) {
						if (!options.delay_change) {
							child.classList.remove("cramp_row");
						}
					}
					if (remove) {
						let before_top;
						if (row_margin_top === undefined) {
							before_top = child.offsetTop;
						}
						if (!options.delay_change) {
							child.classList.add("cramp_row");
						}
						if (row_margin_top === undefined) {
							row_margin_top = before_top - child.offsetTop;
						}
					}
				});

				animatable_rows.forEach((child) => {
					// @ts-ignore
					child.rect_after = child.getBoundingClientRect();
				});

				const list_rect_after = comp.getBoundingClientRect();

				const list_dl = list_rect_after.left - list_rect_before.left;
				const list_dt = list_rect_after.top - list_rect_before.top;

				let row_index = -1;
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
					} else {
						row_index++;
						child.dataset.row_index = row_index + "";
					}

					// @ts-ignore
					let rect_before = child.rect_before;
					// @ts-ignore
					let rect_after = child.rect_after;

					// @ts-ignore
					let off_x = list_dl + def(child._translateX, 0);
					// @ts-ignore
					let off_y = list_dt + def(child._translateY, 0);
					child.style.transform = "";
					// @ts-ignore
					child._translateX = 0;
					// @ts-ignore
					child._translateY = 0;

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
						if (instant) {
							child.style.opacity = "0";
						}
						if (row_margin_top) {
							off_y -= row_margin_top;
						}
					}
					if (add) {
						const fac = chaos ? 1 : 1.5;
						if (is_horizontal) {
							off_x -= rect_after.width * fac;
						} else {
							off_y -= rect_after.height * fac;
						}
					}

					/**
					 *
					 * @param {ClientRect} r
					 */
					const ronscr = (r) => {
						return r.top < window.innerHeight && r.top + r.height > 0 && r.left < window.innerWidth && r.left + r.width > 0;
					};

					child.style.zIndex = "" + Math.round((Math.abs(off_x) + Math.abs(off_y)) * 0.02 + (add || remove ? 1 : 2));

					const ppp = () => {
						child.style.zIndex = "";
						child.style.opacity = "";
					};
					if (duration > 0) {
						setTimeout(ppp, duration);
					} else {
						ppp();
					}

					if (duration && ((rect_before && ronscr(rect_before)) || (rect_after && ronscr(rect_after)))) {
						let step_0 = "";
						let step_1 = "";

						// @ts-ignore
						const scale = def(child._scale, 1);
						// @ts-ignore
						child._scale = 1;
						if (Math.abs(off_y) > 2 || Math.abs(off_x) > 2 || scale < 0.999) {
							step_0 += `transform:translate(${Math.round(off_x)}px,${Math.round(off_y)}px) scale(${scale});`;
							step_1 += `transform:translate(${after_x}px,${after_y}px) scale(1);`;
						}

						if (add) {
							step_0 += "opacity:0;transform:scale(0.94);";
							step_1 += "opacity:1;";
						}
						if (remove) {
							step_0 += "opacity:1;";
							step_1 += "opacity:0;transform:scale(0.94);";
						}

						if (step_1) {
							child._animate(`0%{ ${step_0} }100%{ ${step_1} }`, duration, { early_callback: false });
						}
					}
				});

				comp.classList.add("animating");

				const w1 = list_rect_before.width;
				const w2 = list_rect_after.width;

				const h1 = list_rect_before.height;
				const h2 = list_rect_after.height;

				let step_0 = "";
				let step_1 = "";

				if (!instant) {
					if (Math.abs(w1 - w2) > 1) {
						step_0 = `width:${w1}px;`;
						step_1 = `width:${w2}px;`;
					}
					if (Math.abs(h1 - h2) > 1) {
						step_0 = `height:${h1}px;`;
						step_1 = `height:${h2}px;`;
					} else {
						comp.style.height = comp.offsetHeight + "px";
					}
				}

				comp._animate(`0%{ ${step_0} }100%{ ${step_1} }`, duration, {
					callback: () => {
						comp.classList.remove("animating");
						comp.style.width = "";
						comp.style.height = "";
					},
				});

				if (duration > 0) {
					setTimeout(finish, duration);
				} else {
					finish();
				}
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

			let res = {};
			comp._remove_row = (row_index) => {
				comp.dispatchEvent(
					new CustomEvent("remove_row", {
						detail: {
							row_index,
							res,
						},
					})
				);
				if (!res.removed) {
					const remove_index = comp._data.findIndex((d) => {
						return d.row_index === row_index;
					});
					if (remove_index !== -1) {
						comp._data.splice(remove_index, 1);
						comp._render();
					}
				}
				res = {};
			};

			res = {};
			comp._move_row = (from, to) => {
				comp.dispatchEvent(
					new CustomEvent("move_row", {
						detail: {
							from,
							to,
							res,
						},
					})
				);

				if (!res.moved) {
					const data = comp._data;
					from = clamp(0, from, data.length - 1);
					to = clamp(0, to, data.length - 1);

					const temp = data.splice(from, 1);
					data.splice(to, 0, ...temp);
					comp._render();
				}
				res = {};
			};
		},
	});
}
