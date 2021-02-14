/* js[global] */

/**
 * @type {{
 * row: PiepNode
 * animate()
 * comp?: AnyComp
 * scroll_parent?: PiepNode
 * grabbed_at_y?: number
 * grabbed_at_y_scroll?: number
 * list?: PiepNode
 * all_rows?: PiepNode[]
 * min_y?: number
 * max_y?: number
 * place_index?: number
 * height?: number
 * }}
 */
let list_grab = {
	row: undefined,
	animate: () => {
		const row = list_grab.row;
		if (!row) {
			return;
		}

		const r = row.getBoundingClientRect();
		let dy = mouse.pos.y - list_grab.grabbed_at_y + list_grab.scroll_parent.scrollTop - list_grab.grabbed_at_y_scroll;
		dy = clamp(list_grab.min_y, dy, list_grab.max_y);
		// @ts-ignore
		row._translateY = dy;
		// @ts-ignore
		row._scale = Math.min(def(row._scale, 1) + 0.001, 1.007);
		// @ts-ignore
		row.style.transform = `scale(${row._scale}) translateY(${Math.round(dy)}px)`;

		list_grab.place_index = 0;
		list_grab.all_rows.forEach((e) => {
			if (e === list_grab.row) {
				return;
			}
			const er = e.getBoundingClientRect();

			// @ts-ignore
			const above = e._row_id < row._row_id;

			// @ts-ignore
			const etry = def(e._translateY, 0);
			let edy = 0;
			if (er.top - 0.95 * etry + er.height * 0.5 > r.top && above) {
				edy = list_grab.height;
			}
			if (er.top - 0.95 * etry + er.height * 0.5 < r.top + r.height && !above) {
				edy = -list_grab.height;
			}

			if (er.top + edy - etry + er.height * 0.5 < r.top + r.height * 0.5) {
				list_grab.place_index++;
			}

			let d = (edy - etry) * 0.2;
			d = clamp(-20, d, 20);
			// @ts-ignore
			e._translateY += d;
			// @ts-ignore
			e.style.transform = `translateY(${Math.round(e._translateY)}px)`;
		});

		requestAnimationFrame(list_grab.animate);
	},
};

document.addEventListener("mouseup", () => {
	const row_ref = list_grab.row;
	if (!row_ref) {
		return;
	}

	const comp = list_grab.comp;
	/** @type {ListComp} */
	// @ts-ignore
	const parent = comp._parent_comp;
	if (parent._move_row) {
		if (comp._data.row_index === list_grab.place_index) {
			list_grab.all_rows.forEach((x) => {
				// @ts-ignore
				const sc = def(x._scale, 1);
				// @ts-ignore
				const ty = x._translateY;
				if (Math.abs(ty) > 1 || sc > 1.001) {
					x._animate(`0%{transform:scale(${sc}) translateY(${ty}px)}100%{transform:scale(1) translateY(0px)}`, 250);
				}
				// @ts-ignore
				x._scale = 1;
				// @ts-ignore
				x._translateY = 0;
				x.style.transform = "";
			});
		} else {
			parent._move_row(comp._data.row_index, list_grab.place_index);
		}
	}

	row_ref.style.zIndex = `200`;
	setTimeout(() => {
		row_ref.classList.remove("grabbed");
		row_ref.style.zIndex = "200";
	}, 150);
	list_grab.row = undefined;
});

{
	const trait_name = "list_grab_btn";
	registerCompTrait(trait_name, {
		template: html`<button data-node="${trait_name}" class="btn subtle small grab_btn"><i class="fas fa-sort"></i></button>`,
		initialize: (comp) => {
			/** @type {PiepNode} */
			const n = comp._nodes[trait_name];
			n.addEventListener("mousedown", () => {
				const list_row = comp._parent(".list_row");
				if (!list_row) {
					console.error("List row missing");
					return;
				}

				list_row.classList.add("grabbed");
				list_grab.comp = comp;
				list_grab.row = list_row;
				list_grab.grabbed_at_y = mouse.pos.y;
				list_grab.scroll_parent = list_row._scroll_parent();
				list_grab.grabbed_at_y_scroll = list_grab.scroll_parent.scrollTop;
				list_grab.list = list_row._parent();
				list_grab.all_rows = list_grab.list._direct_children();
				let i = 0;
				list_grab.all_rows.forEach((e) => {
					// @ts-ignore
					e._row_id = i++;
				});

				const cr = list_row.getBoundingClientRect();

				list_grab.min_y = list_grab.all_rows[0].getBoundingClientRect().top - cr.top;

				/** @type {PiepNode} */
				const last = getLast(list_grab.all_rows);
				const lr = last.getBoundingClientRect();
				list_grab.max_y = lr.top + lr.height - cr.height - cr.top;

				const st = window.getComputedStyle(list_row);
				list_grab.height = numberFromStr(st.height) + (numberFromStr(st.marginTop) + numberFromStr(st.marginBottom));

				list_grab.animate();
			});
		},
	});
}

/**
 * @typedef {{
 * list_grab_btn: PiepNode
 * }} ListGrabBtnTraitNodes
 */
