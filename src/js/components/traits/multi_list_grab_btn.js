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
 * list?: PiepNode
 * all_rows?: PiepNode[]
 * min_y?: number
 * max_y?: number
 * place_index?: number
 * height?: number
 * insert_rect?: PiepNode
 * positions?: MultiListPosition[]
 * row_selector?: string
 * }}
 */
let multi_list_grab = {
	row: undefined,
	animate: () => {
		const row = multi_list_grab.row;
		if (!row) {
			return;
		}

		const r = row.getBoundingClientRect();
		let mdx = mouse.pos.x - multi_list_grab.grabbed_at_x;
		let mdy = mouse.pos.y - multi_list_grab.grabbed_at_y + multi_list_grab.scroll_parent.scrollTop - multi_list_grab.grabbed_at_y_scroll;
		mdy = clamp(multi_list_grab.min_y, mdy, multi_list_grab.max_y);
		// @ts-ignore
		row._translateX = mdx;
		// @ts-ignore
		row._translateY = mdy;
		// @ts-ignore
		row._scale = Math.max(def(row._scale, 1) - 0.002, 0.99);
		// @ts-ignore
		row.style.transform = `translate(${Math.round(mdx)}px, ${Math.round(mdy)}px) scale(${row._scale})`;

		let probably_y = undefined;
		multi_list_grab.all_rows.forEach((e) => {
			const er = e.getBoundingClientRect();

			// @ts-ignore
			const above = e._initial_y < row._initial_y;

			// @ts-ignore
			const etry = def(e._translateY, 0);

			// @ts-ignore
			const initial_y = e._initial_y;

			let edy = 0;
			if (initial_y + er.height * 0.5 > r.top && above) {
				edy = multi_list_grab.height;
			}
			if (initial_y + er.height * 0.5 < r.top + r.height && !above) {
				edy = -multi_list_grab.height;
			}

			if (initial_y - er.height * 0.5 <= r.top && initial_y + er.height * 0.5 >= r.top) {
				probably_y = initial_y;
			}

			if (e === multi_list_grab.row) {
				return;
			}

			let d = (edy - etry) * 0.2;
			d = clamp(-20, d, 20);
			// @ts-ignore
			const ty = etry + d;
			// @ts-ignore
			e._translateY = ty;
			// @ts-ignore
			e.style.transform = `translateY(${Math.round(ty)}px)`;
		});

		/** @type {MultiListPosition} */
		let best_position = undefined;
		let min_dx = 1000;

		if (probably_y) {
			multi_list_grab.positions.forEach((e) => {
				const dy = Math.abs(e.y - probably_y);
				if (dy < 5) {
					const dx = Math.abs(e.x - r.left);
					if (dx < min_dx) {
						min_dx = dx;
						best_position = e;
					}
				}
			});
		}

		multi_list_grab.list._children(".row_highlight").forEach((e) => e.classList.remove("row_highlight"));

		if (best_position) {
			const scrr = multi_list_grab.scroll_parent.getBoundingClientRect();
			multi_list_grab.insert_rect.style.left = best_position.x - scrr.left + "px";
			// @ts-ignore
			multi_list_grab.insert_rect.style.top = best_position.y - scrr.top + "px";

			const list = best_position.list;
			if (list) {
				const list_row = list._parent(".list_row");
				if (list_row) {
					const row = list_row._child(multi_list_grab.row_selector);
					if (row) {
						row.classList.add("row_highlight");
					}
				}
			}
		}
		multi_list_grab.insert_rect.classList.toggle("active", !!best_position);

		requestAnimationFrame(multi_list_grab.animate);
	},
};

document.addEventListener("mouseup", () => {
	const row_ref = multi_list_grab.row;
	if (!row_ref) {
		return;
	}

	multi_list_grab.all_rows.forEach((x) => {
		// @ts-ignore
		const sc = def(x._scale, 1);
		// @ts-ignore
		const tx = def(x._translateX, 0);
		// @ts-ignore
		const ty = def(x._translateY, 0);
		if (Math.abs(tx) > 1 || Math.abs(ty) > 1 || sc < 0.999) {
			x._animate(`0%{transform:scale(${sc}) translate(${tx}px, ${ty}px)}100%{transform:scale(1) translate(0px, 0px)}`, 250);
		}
		// @ts-ignore
		x._scale = 1;
		// @ts-ignore
		x._translateX = 0;
		// @ts-ignore
		x._translateY = 0;
		x.style.transform = "";
	});

	row_ref.style.zIndex = `200`;
	setTimeout(() => {
		multi_list_grab.list.classList.remove("has_grabbed_row");
		row_ref.classList.remove("multi_grabbed");
		row_ref.style.zIndex = "";
	}, 150);
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
				const list_row = comp._parent(".list_row");
				if (!list_row) {
					console.error("List row missing");
					return;
				}

				if (list_row._parent().classList.contains("has_grabbed_row")) {
					return;
				}

				list_row.classList.add("multi_grabbed");
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
				multi_list_grab.list = list;
				multi_list_grab.row_selector = n.dataset.multi_row_selector;

				multi_list_grab.all_rows = multi_list_grab.list._children(multi_list_grab.row_selector).filter((e) => {
					return !list_row.contains(e);
				});
				if (multi_list_grab.all_rows.length === 0) {
					return;
				}
				multi_list_grab.all_rows.push(list_row);

				multi_list_grab.list.classList.add("has_grabbed_row");

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
				[multi_list_grab.list, ...multi_list_grab.list._children("list-comp")]
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
