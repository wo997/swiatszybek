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
let multi_xxx_grab = {
	row: undefined,
	animate: () => {
		const row = multi_xxx_grab.row;
		if (!row) {
			return;
		}

		const r = row.getBoundingClientRect();
		let dy = mouse.pos.y - multi_xxx_grab.grabbed_at_y + multi_xxx_grab.scroll_parent.scrollTop - multi_xxx_grab.grabbed_at_y_scroll;
		dy = clamp(multi_xxx_grab.min_y, dy, multi_xxx_grab.max_y);
		// @ts-ignore
		row._translateY = dy;
		// @ts-ignore
		row._scale = Math.max(def(row._scale, 1) - 0.002, 0.99);
		// @ts-ignore
		row.style.transform = `translateY(${Math.round(dy)}px) scale(${row._scale})`;

		multi_xxx_grab.place_index = 0;
		multi_xxx_grab.all_rows.forEach((e) => {
			if (e === multi_xxx_grab.row) {
				return;
			}
			const er = e.getBoundingClientRect();

			// @ts-ignore
			const above = e._row_id < row._row_id;

			// @ts-ignore
			const etry = def(e._translateY, 0);
			let edy = 0;
			if (er.top - 0.95 * etry + er.height * 0.5 > r.top && above) {
				edy = multi_xxx_grab.height;
			}
			if (er.top - 0.95 * etry + er.height * 0.5 < r.top + r.height && !above) {
				edy = -multi_xxx_grab.height;
			}

			if (er.top + edy - etry + er.height * 0.5 < r.top + r.height * 0.5) {
				multi_xxx_grab.place_index++;
			}

			let d = (edy - etry) * 0.2;
			d = clamp(-20, d, 20);
			// @ts-ignore
			e._translateY += d;
			// @ts-ignore
			e.style.transform = `translateY(${Math.round(e._translateY)}px)`;
		});

		requestAnimationFrame(multi_xxx_grab.animate);
	},
};

document.addEventListener("mouseup", () => {
	const row_ref = multi_xxx_grab.row;
	if (!row_ref) {
		return;
	}

	const comp = multi_xxx_grab.comp;
	/** @type {ListComp} */
	// @ts-ignore
	const parent = comp._parent_comp;
	if (parent._move_row) {
		if (comp._data.row_index === multi_xxx_grab.place_index) {
			multi_xxx_grab.all_rows.forEach((x) => {
				// @ts-ignore
				const sc = def(x._scale, 1);
				// @ts-ignore
				const ty = x._translateY;
				if (Math.abs(ty) > 1 || sc < 0.999) {
					x._animate(`0%{transform:scale(${sc}) translateY(${ty}px)}100%{transform:scale(1) translateY(0px)}`, 250);
				}
				// @ts-ignore
				x._scale = 1;
				// @ts-ignore
				x._translateY = 0;
				x.style.transform = "";
			});
		} else {
			parent._move_row(comp._data.row_index, multi_xxx_grab.place_index);
		}
	}

	row_ref.style.zIndex = `200`;
	setTimeout(() => {
		multi_xxx_grab.list.classList.remove("has_grabbed_row");
		row_ref.classList.remove("grabbed");
		row_ref.style.zIndex = "";
	}, 150);
	multi_xxx_grab.row = undefined;
});

{
	const trait_name = "multi_list_grab_btn";
	registerCompTrait(trait_name, {
		template: html`<button data-node="${trait_name}" class="btn subtle small"><i class="fas fa-arrows-alt"></i></button>`,
		initialize: (comp) => {
			/** @type {PiepNode} */
			const n = comp._nodes[trait_name];
			n.addEventListener("mousedown", () => {
				const list_row = comp._parent(".list_row");
				if (!list_row) {
					console.error("List row missing");
					return;
				}

				if (list_row._parent().classList.contains("has_grabbed_row")) {
					return;
				}

				list_row.classList.add("grabbed");
				multi_xxx_grab.comp = comp;
				multi_xxx_grab.row = list_row;
				multi_xxx_grab.grabbed_at_y = mouse.pos.y;
				multi_xxx_grab.scroll_parent = list_row._scroll_parent();
				multi_xxx_grab.grabbed_at_y_scroll = multi_xxx_grab.scroll_parent.scrollTop;
				multi_xxx_grab.list = list_row._parent();
				multi_xxx_grab.all_rows = multi_xxx_grab.list._direct_children();
				multi_xxx_grab.list.classList.add("has_grabbed_row");

				let i = 0;
				multi_xxx_grab.all_rows.forEach((e) => {
					// @ts-ignore
					e._row_id = i++;
				});

				const cr = list_row.getBoundingClientRect();

				multi_xxx_grab.min_y = multi_xxx_grab.all_rows[0].getBoundingClientRect().top - cr.top;

				/** @type {PiepNode} */
				const last = getLast(multi_xxx_grab.all_rows);
				const lr = last.getBoundingClientRect();
				multi_xxx_grab.max_y = lr.top + lr.height - cr.height - cr.top;

				const st = window.getComputedStyle(list_row);
				multi_xxx_grab.height = numberFromStr(st.height) + (numberFromStr(st.marginTop) + numberFromStr(st.marginBottom));

				multi_xxx_grab.animate();
			});
		},
	});
}

/**
 * @typedef {{
 * multi_list_grab: PiepNode
 * }} MultiListGrabBtnTraitNodes
 */
