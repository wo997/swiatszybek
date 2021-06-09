/* js[piep_cms_dependencies] */

{
	/**
	 * @typedef {{
	 * name: string
	 * vid: number
	 * }} CMSSliderSlide
	 */

	piep_cms_manager.registerProp({
		name: "slider_settings",
		blc_groups: [{ module_names: ["slider"], priority: 100 }],
		type_groups: ["layout"],
		menu_html: html`
			<div class="label">Slajdy</div>
			<input class="hidden" data-blc_prop="settings.slider_slides" />

			<div class="slides_slide slides"></div>
			<button class="btn primary small add_btn" data-slide="columns">Dodaj slajd <i class="fas fa-plus"></i></button>
		`,
		init: (piep_cms, menu_wrapper) => {
			const slides_node = menu_wrapper._child(".slides");
			const slides_input = menu_wrapper._child(`[data-blc_prop="settings.slider_slides"]`);

			let ignore_render = false;

			/**
			 *
			 * @returns {CMSSliderSlide[]}
			 */
			const getSlides = () => {
				try {
					const slides = JSON.parse(slides_input._get_value());
					return slides;
				} catch (e) {}

				return [];
			};

			/**
			 *
			 * @param {CMSSliderSlide[]} slides
			 * @param {boolean} quiet
			 */
			const setSlides = (slides, quiet = false) => {
				if (quiet) {
					ignore_render = true;
				}
				slides_input._set_value(JSON.stringify(slides));
				ignore_render = false;
			};

			const render_slide = () => {
				if (ignore_render) {
					return;
				}

				const slides = getSlides();
				let slides_html = "";
				slides.forEach((slide, index) => {
					slides_html += html`
						<div class="slide_row" data-index="${index}">
							<input class="field small name" data-tooltip="Pomocnicza nazwa slajdu" />
							<button class="btn subtle small edit_btn">
								<i class="fas fa-cog"></i>
							</button>
							<button class="btn subtle small move_btn" ${index === slides.length - 1 ? "disabled" : ""} data-dir="1">
								<i class="fas fa-chevron-down"></i>
							</button>
							<button class="btn subtle small move_btn" ${index === 0 ? "disabled" : ""} data-dir="-1">
								<i class="fas fa-chevron-up"></i>
							</button>
							<button class="btn subtle small remove_btn">
								<i class="fas fa-times"></i>
							</button>
						</div>
					`;
				});
				slides_node._set_content(slides_html);
				registerForms();

				slides_node._children(".slide_row").forEach((e, index) => {
					const name_input = e._child(".name");
					name_input._set_value(slides[index].name, { quiet: true });

					const upd = () => {
						slides[index].name = name_input._get_value();
						setSlides(slides, true);
					};
					name_input.addEventListener("input", upd);
					name_input.addEventListener("change", upd);
				});
			};

			slides_input.addEventListener("value_set", render_slide);

			menu_wrapper.addEventListener("click", (ev) => {
				const target = $(ev.target);

				const slides = getSlides();

				const slide_row = target._parent(".slide_row");
				const remove_btn = target._parent(".remove_btn");

				const slide_id = slide_row ? +slide_row.dataset.index : undefined;
				const v_node = piep_cms.getVNodeById(piep_cms.focus_node_vid);

				let update = false;

				if (remove_btn) {
					v_node.children.splice(slide_id, 1);
					update = true;
				}
				const add_btn = target._parent(".add_btn");
				if (add_btn) {
					v_node.children.push({
						tag: "div",
						id: piep_cms.getNewBlcId(),
						styles: {},
						classes: ["vertical_container"],
						attrs: {},
						settings: {},
						children: [],
					});
					update = true;
				}

				const move_btn = target._parent(".move_btn");
				if (move_btn) {
					const next_id = +move_btn.dataset.dir + slide_id;
					const next_ref = v_node.children[next_id];
					v_node.children[next_id] = v_node.children[slide_id];
					v_node.children[slide_id] = next_ref;
					update = true;
				}

				if (update) {
					piep_cms.update({ all: true });
					piep_cms.setBlcMenuFromFocusedNode();
				}

				const edit_btn = target._parent(".edit_btn");
				if (edit_btn) {
					const slider_module_node = piep_cms.getNode(piep_cms.focus_node_vid);
					if (slider_module_node) {
						/** @type {PiepSliderNode} */
						// @ts-ignore
						const slider_node = slider_module_node._child(".wo997_slider");
						slider_node._slider.set_slide(slide_id);
					}
				}
			});
		},
	});

	// /** @type {CMSSliderSlide[]} */
	// const default_slides = [{ name: "Slajd 1", vid: undefined }];

	piep_cms_manager.registerBlcSchema({
		id: "slider",
		icon: html`<i class="fas fa-images"></i>`,
		label: html`Slajder`,
		group: "module",
		standalone: true,
		priority: 10,
		rerender_on: [],
		render: (v_node) => {
			/** @type {CMSSliderSlide[]} */
			let slides_data = [];
			try {
				slides_data = JSON.parse(v_node.settings.slider_slides);
			} catch (e) {}

			/** @type {CMSSliderSlide[]} */
			const slides = [];
			v_node.children.forEach((child, index) => {
				const slide = slides_data.find((slide) => slide.vid === child.id);
				if (slide) {
					slides.push(slide);
				} else {
					const max_id = Math.max(0, ...slides_data.map((slide) => +numberFromStr(slide.name)));

					slides.push({ name: `Slajd ${max_id + 1}`, vid: child.id });
				}
				child.module_hook_id = `slide_${index}`;
			});

			v_node.settings.slider_slides = JSON.stringify(slides);
		},
		render_html: (v_node) => {
			return html`
				<div class="wo997_slider">
					<div class="wo997_slides_container">
						<div class="wo997_slides_wrapper"></div>
					</div>
				</div>
			`;
		},
		place_node: (v_node, node, parent_node, piep_cms) => {
			// neat!
			//console.log(v_node, node, parent_node, piep_cms);

			const wo997_slides_wrapper = parent_node._child(".wo997_slides_wrapper");

			const index = numberFromStr(v_node.module_hook_id);

			const before_node = wo997_slides_wrapper._direct_children()[index];
			if (node._parent() !== wo997_slides_wrapper || node !== before_node) {
				wo997_slides_wrapper.insertBefore(node, before_node);
			}
		},
		v_node: {
			tag: "div",
			id: -1,
			styles: {
				// df: {
				// 	height: "40vw",
				// },
			},
			classes: [],
			attrs: {},
			settings: {
				slider_slides: JSON.stringify([]),
			},
			module_name: "slider",
			children: [
				{
					tag: "div",
					id: -1,
					styles: {},
					classes: ["vertical_container"],
					attrs: {},
					settings: {},
					children: [],
				},
			],
		},
	});
}
