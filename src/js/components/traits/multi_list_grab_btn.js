/* js[global] */

/**
 * @typedef {{
 * list: ListComp
 * index: number
 * x: number
 * y: number
 * w: number
 * h: number
 * }} MultiListPosition
 */

/**
 * @type {{
 * row: PiepNode
 * animate()
 * comp?: AnyComp
 * scroll_parent?: PiepNode
 * grabbed_at_x?: number
 * grabbed_at_y?: number
 * grabbed_at_y_scroll?: number
 * master_list?: PiepNode
 * list?: PiepNode
 * all_rows?: PiepNode[]
 * min_y?: number
 * max_y?: number
 * place_index?: number
 * height?: number
 * insert_rect?: PiepNode
 * positions?: MultiListPosition[]
 * row_selector?: string
 * best_position?: MultiListPosition
 * ticks?: number
 * }}
 */
let multi_list_grab = {
	row: undefined,
	animate: () => {
		const row = multi_list_grab.row;
		if (!row) {
			return;
		}

		const scroll_dy = multi_list_grab.scroll_parent.scrollTop - multi_list_grab.grabbed_at_y_scroll;

		const r = row.getBoundingClientRect();
		let mdx = mouse.pos.x - multi_list_grab.grabbed_at_x;
		let mdy = mouse.pos.y - multi_list_grab.grabbed_at_y + scroll_dy;
		mdy = clamp(multi_list_grab.min_y, mdy, multi_list_grab.max_y);
		// @ts-ignore
		row._translateX = mdx;
		// @ts-ignore
		row._translateY = mdy;
		// @ts-ignore
		row.style.transform = `translate(${Math.round(mdx)}px, ${Math.round(mdy)}px)`;

		multi_list_grab.ticks++;
		multi_list_grab.all_rows.forEach((e, index) => {
			const er = e.getBoundingClientRect();

			// @ts-ignore
			const above = e._initial_y < row._initial_y;

			// @ts-ignore
			const etry = def(e._translateY, 0);

			// @ts-ignore
			const initial_y = e._initial_y;

			let edy = 0;
			if (initial_y + er.height * 0.5 >= r.top + scroll_dy && above) {
				edy = multi_list_grab.height;
			}
			if (initial_y + er.height * 0.5 <= r.top + r.height + scroll_dy && !above) {
				edy = -multi_list_grab.height;
			}

			if (e === multi_list_grab.row || index > multi_list_grab.ticks) {
				return;
			}

			let d = (edy - etry) * 0.2;
			d = clamp(-40, d, 40);
			// @ts-ignore
			const ty = etry + d;
			// @ts-ignore
			e._translateY = ty;
			// @ts-ignore
			e._wants_y = edy;

			// @ts-ignore
			e.style.transform = `translateY(${Math.round(ty)}px)`;
		});

		/** @type {MultiListPosition} */
		let best_position = undefined;
		let min_dx = 100;
		let min_dy = 100;
		multi_list_grab.positions.forEach((e) => {
			const dy = Math.abs(e.y - scroll_dy - r.top);
			if (dy < min_dy) {
				min_dy = dy;
			}
		});
		multi_list_grab.positions.forEach((e) => {
			const dy = Math.abs(e.y - scroll_dy - r.top);
			if (dy < min_dy + 1) {
				const dx = Math.abs(e.x - r.left);
				if (dx < min_dx) {
					min_dx = dx;
					best_position = e;
				}
			}
		});

		removeMultiGrabHighlight();

		if (best_position) {
			const scrr = multi_list_grab.scroll_parent.getBoundingClientRect();
			multi_list_grab.insert_rect.style.left = best_position.x - scrr.left + "px";
			// @ts-ignore
			multi_list_grab.insert_rect.style.top = best_position.y - scrr.top + multi_list_grab.grabbed_at_y_scroll + "px";

			let list = best_position.list;
			while (list) {
				const list_row = list._parent(".list_row");
				if (list_row) {
					const row = list_row._child(multi_list_grab.row_selector);
					if (row) {
						row.classList.add("row_highlight");
					}
				}
				// @ts-ignore
				list = list._parent("list-comp");
			}
		}
		multi_list_grab.best_position = best_position;
		multi_list_grab.insert_rect.classList.toggle("active", !!best_position);

		requestAnimationFrame(multi_list_grab.animate);
	},
};

function removeMultiGrabHighlight() {
	multi_list_grab.master_list._children(".row_highlight").forEach((e) => e.classList.remove("row_highlight"));
}

document.addEventListener("mouseup", () => {
	const row_ref = multi_list_grab.row;
	if (!row_ref) {
		return;
	}

	const duration = 150; // multi_list_grab.all_rows.length > 50 ? 0 : 150;

	const rowsFix = () => {
		multi_list_grab.all_rows.forEach((x) => {
			// @ts-ignore
			x._translateX = 0;
			// @ts-ignore
			x._translateY = 0;
			// @ts-ignore
			x._wants_y = 0;
			x.style.transform = "";
		});
	};
	const otherRowsAnimate = (fall_back) => {
		if (!duration) {
			return;
		}
		multi_list_grab.all_rows.forEach((x) => {
			if (!fall_back && x === row_ref) {
				return;
			}
			// @ts-ignore
			const tx = def(x._translateX, 0);
			// @ts-ignore
			const ty = def(x._translateY, 0);
			// @ts-ignore
			const eny = fall_back ? 0 : def(x._wants_y, 0);

			if (fall_back && (Math.abs(tx) > 1 || Math.abs(ty - eny) > 1)) {
				x._animate(`0%{transform:translate(${tx}px, ${ty}px)}100%{transform:translate(0px, ${eny}px)}`, duration);
			}
			x.style.transform = `translate(0px, ${eny}px)`;
		});
	};

	const master_ref = multi_list_grab.master_list;

	removeMultiGrabHighlight();

	row_ref.style.zIndex = `200`;
	setTimeout(() => {
		master_ref.classList.remove("has_grabbed_row");
		row_ref.classList.remove("multi_grabbed");
		row_ref.style.zIndex = "";
	}, 100);

	const best_pos_ref = multi_list_grab.best_position;
	const insert_rect_ref = multi_list_grab.insert_rect;
	let change = false;
	if (best_pos_ref) {
		/** @type {ListComp} */
		// @ts-ignore
		const list = row_ref._parent("list-comp");
		const target_list = best_pos_ref.list;

		const row_index = +row_ref.dataset.row_index;
		const target_index = best_pos_ref.index;

		const same_list = target_list === list;
		if (!same_list || target_index !== row_index) {
			change = true;

			// @ts-ignore
			const tx = def(row_ref._translateX, 0);
			// @ts-ignore
			const ty = def(row_ref._translateY, 0);

			const rr = row_ref.getBoundingClientRect();
			const ir = insert_rect_ref.getBoundingClientRect();
			const etx = ir.left + tx - rr.left;
			const ety = ir.top + ty - rr.top;

			if (duration) {
				row_ref._animate(`0%{transform:translate(${tx}px, ${ty}px)}100%{transform:translate(${etx}px, ${ety}px)}`, duration);
			}
			row_ref.style.transform = `translate(${etx}px, ${ety}px)`;

			otherRowsAnimate(false);

			setTimeout(() => {
				master_ref.classList.add("freeze");
				master_ref.insertAdjacentHTML("afterend", html`<div class="overlay">${master_ref.outerHTML}</div>`);
				const overlay = master_ref._next();

				master_ref.style.height = master_ref.offsetHeight + "px";

				const data = cloneObject(list._data.splice(row_index, 1));
				// it's always a single row, but make it clear
				data.forEach((e) => {
					delete e.row_id;
				});

				const actual_index = target_index - (same_list && row_index <= target_index ? 1 : 0);

				list._render();
				//list._render({ delay_change: true });
				target_list._data.splice(actual_index, 0, ...data);
				target_list._render();
				//target_list._render({ delay_change: true });
				//list._finish_animation();
				//target_list._finish_animation();
				rowsFix();

				setTimeout(() => {
					master_ref.style.height = "";
					overlay.remove();
					master_ref.classList.remove("freeze");
				}, 0);
			}, duration);
		}
	}

	if (!change) {
		otherRowsAnimate(true);
		rowsFix();
	}

	multi_list_grab.insert_rect.remove();
	multi_list_grab.row = undefined;
});

{
	const trait_name = "multi_list_grab_btn";
	registerCompTrait(trait_name, {
		template: html`<button data-node="${trait_name}" class="btn subtle small">
			<i class="fas fa-arrows-alt"></i>
		</button>`,
		initialize: (comp) => {
			/** @type {PiepNode} */
			const n = comp._nodes[trait_name];

			if (!n.dataset.multi_row_selector) {
				console.error("Multi row selector not specified");
				return;
			}

			n.addEventListener("mousedown", () => {
				const key = Math.random().toString();
				const list_row = comp._parent(".list_row");
				if (!list_row) {
					console.error("List row missing");
					return;
				}

				if (list_row._parent(".has_grabbed_row")) {
					return;
				}

				list_row.classList.add("multi_grabbed");
				multi_list_grab.ticks = 0;
				multi_list_grab.comp = comp;
				multi_list_grab.row = list_row;
				multi_list_grab.grabbed_at_x = mouse.pos.x;
				multi_list_grab.grabbed_at_y = mouse.pos.y;
				multi_list_grab.scroll_parent = list_row._scroll_parent();
				multi_list_grab.grabbed_at_y_scroll = multi_list_grab.scroll_parent.scrollTop;
				let list = list_row._parent();
				while (true) {
					const p = list._parent("list-comp");
					if (!p) {
						break;
					}
					list = p;
				}
				multi_list_grab.master_list = list;
				multi_list_grab.row_selector = n.dataset.multi_row_selector;

				multi_list_grab.all_rows = multi_list_grab.master_list._children(multi_list_grab.row_selector).filter((e) => {
					return !list_row.contains(e);
				});
				if (multi_list_grab.all_rows.length === 0) {
					return;
				}
				multi_list_grab.all_rows.push(list_row);

				multi_list_grab.master_list.classList.add("has_grabbed_row");

				multi_list_grab.min_y = 100000;
				multi_list_grab.max_y = -100000;

				const cr = list_row.getBoundingClientRect();
				const xr = list_row._child(multi_list_grab.row_selector).getBoundingClientRect();

				[list_row, ...multi_list_grab.all_rows].forEach((e) => {
					const rr = e.getBoundingClientRect();

					// @ts-ignore
					e._initial_y = rr.top;

					const tmin = rr.top - cr.top;
					const tmax = rr.top + rr.height - cr.height - cr.top;
					if (tmin < multi_list_grab.min_y) multi_list_grab.min_y = tmin;
					if (tmax > multi_list_grab.max_y) multi_list_grab.max_y = tmax;
				});

				const st = window.getComputedStyle(list_row);
				multi_list_grab.height = numberFromStr(st.height) + (numberFromStr(st.marginTop) + numberFromStr(st.marginBottom));

				multi_list_grab.scroll_parent.insertAdjacentHTML("beforeend", html` <div class="multi_list_grab_insert_rect"></div> `);
				multi_list_grab.insert_rect = multi_list_grab.scroll_parent._child(".multi_list_grab_insert_rect");
				multi_list_grab.insert_rect.style.width = xr.width + "px";
				multi_list_grab.insert_rect.style.height = cr.height + "px";

				multi_list_grab.positions = [];
				[multi_list_grab.master_list, ...multi_list_grab.master_list._children("list-comp")]
					.filter((e) => {
						return !list_row.contains(e);
					})
					.forEach((/** @type {ListComp} */ list) => {
						/**
						 *
						 * @param {ListComp} list
						 * @param {number} index
						 * @param {DOMRect} rect
						 */
						const insertPos = (list, index, rect) => {
							let left = rect.left;
							let top = rect.top;
							let off_y = 0;
							if (index > 0) {
								off_y += rect.height;
							}
							if (rect.top + off_y > cr.top) {
								off_y -= cr.height;
							}
							top += off_y;

							multi_list_grab.positions.push({
								list,
								index,
								x: left,
								y: top,
								w: xr.width,
								h: cr.height,
							});
						};

						let n = 0;
						insertPos(list, n, list.getBoundingClientRect());
						list._direct_children().forEach((row) => {
							n++;
							insertPos(list, n, row.getBoundingClientRect());
						});
					});
				multi_list_grab.animate();
			});
		},
	});
}

/**
 * @typedef {{
 * multi_list_grab: PiepNode
 * }} MultiListGrabBtnTraitNodes
 */
