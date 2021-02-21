/* js[global] */

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
		let dx = mouse.pos.x - multi_list_grab.grabbed_at_x;
		let dy = mouse.pos.y - multi_list_grab.grabbed_at_y + multi_list_grab.scroll_parent.scrollTop - multi_list_grab.grabbed_at_y_scroll;
		dy = clamp(multi_list_grab.min_y, dy, multi_list_grab.max_y);
		// @ts-ignore
		row._translateX = dx;
		// @ts-ignore
		row._translateY = dy;
		// @ts-ignore
		row._scale = Math.max(def(row._scale, 1) - 0.002, 0.99);
		// @ts-ignore
		row.style.transform = `translate(${Math.round(dx)}px, ${Math.round(dy)}px) scale(${row._scale})`;

		multi_list_grab.place_index = 0;
		multi_list_grab.all_rows.forEach((e) => {
			if (e === multi_list_grab.row) {
				return;
			}
			const er = e.getBoundingClientRect();

			// @ts-ignore
			const above = e._initial_y < row._initial_y;

			// @ts-ignore
			const etry = def(e._translateY, 0);

			let edy = 0;
			if (er.top - 0.95 * etry + er.height * 0.5 > r.top && above) {
				edy = multi_list_grab.height;
			}
			if (er.top - 0.95 * etry + er.height * 0.5 < r.top + r.height && !above) {
				edy = -multi_list_grab.height;
			}

			if (er.top + edy - etry + er.height * 0.5 < r.top + r.height * 0.5) {
				multi_list_grab.place_index++;
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
		// @ts-ignore
		template: html`<button data-node="${trait_name}" class="btn subtle small" disabled="{${data.list_length < 2}}">
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

				multi_list_grab.all_rows = multi_list_grab.list._children(n.dataset.multi_row_selector).filter((e) => {
					return !list_row.contains(e);
				});
				if (multi_list_grab.all_rows.length === 0) {
					return;
				}
				multi_list_grab.all_rows.push(list_row);

				multi_list_grab.list.classList.add("has_grabbed_row");

				multi_list_grab.all_rows.forEach((e) => {
					// @ts-ignore
					e._initial_y = e.getBoundingClientRect().top;
				});

				const cr = list_row.getBoundingClientRect();

				multi_list_grab.min_y = 100000;
				multi_list_grab.max_y = -100000;
				multi_list_grab.all_rows.forEach((e) => {
					const rr = e.getBoundingClientRect();
					const tmin = rr.top - cr.top;
					const tmax = rr.top + rr.height - cr.height - cr.top;
					if (tmin < multi_list_grab.min_y) multi_list_grab.min_y = tmin;
					if (tmax > multi_list_grab.max_y) multi_list_grab.max_y = tmax;
				});

				const st = window.getComputedStyle(list_row);
				multi_list_grab.height = numberFromStr(st.height) + (numberFromStr(st.marginTop) + numberFromStr(st.marginBottom));

				const xr = list_row._child(n.dataset.multi_row_selector).getBoundingClientRect();
				multi_list_grab.scroll_parent.insertAdjacentHTML("beforeend", html` <div class="multi_list_grab_insert_rect"></div> `);
				multi_list_grab.insert_rect = multi_list_grab.scroll_parent._child(".multi_list_grab_insert_rect");
				multi_list_grab.insert_rect.style.width = xr.width + "px";
				multi_list_grab.insert_rect.style.height = cr.height + "px";

				const scrr = multi_list_grab.scroll_parent.getBoundingClientRect();
				multi_list_grab.insert_rect.style.left = xr.left - scrr.left + "px";
				multi_list_grab.insert_rect.style.top = cr.top - scrr.top + "px";

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
