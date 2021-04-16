/* js[global] */

/**
 * @type {{
 * name: string
 * getHtml(column: DatatableColumnDef, data: DatatableCompData): string
 * open(elem: PiepNode, data: any)
 * apply(elem: PiepNode)
 * }[]}
 */
let filter_menus = [
	{
		name: "string",
		getHtml: (column, data) => html`
			<span>Wpisz frazę</span>
			<input type="text" class="field" />
			<div class="checkbox_area" style="margin-top:10px">
				<p-checkbox class="square inline"></p-checkbox>
				Dopasuj całość
			</div>
		`,
		open: (elem, data = { string: "", full_match: false }) => {
			elem._child("input")._set_value(data.string);
		},
		apply: (elem) => {
			const string = elem._child("input")._get_value();
			return { type: "string", string, full_match: elem._child("p-checkbox")._get_value(), display: string };
		},
	},
	{
		name: "select",
		getHtml: (column, data) => {
			const options_ids = data.dataset.map((e) => e[column.key]).filter(onlyUnique);

			let options = "";
			let number = "";
			if (!column.map_name) {
				console.error("You must define a map for select");
			}
			const map = data.maps.find((e) => e.name === column.map_name);
			if (map) {
				let map_map = map.map;

				if (!data.search_url) {
					map_map = map_map.filter((e) => options_ids.includes(e.val));
				}

				map_map.forEach((e) => {
					options += html`<option value="${e.val}">${e.label}</option>`;
					if (typeof e.val === "number") {
						number = "number";
					}
				});
			}

			return html`
				<span>Wybierz opcję</span>
				<select class="field ${number}">
					<option value=""></option>
					${options}
				</select>
			`;
		},
		open: (elem, data = { string: "", value: "" }) => {
			elem._child("select")._set_value(data.value);
			elem._child("select").addEventListener("change", () => {
				elem._child(".apply").click();
			});
		},
		apply: (elem) => {
			const select = elem._child("select");
			const value = select._get_value();
			return { type: "exact", value, display: getSelectDisplayValue(select) };
		},
	},
	{
		name: "boolean",
		getHtml: (column, data) => html`
			<div style="display:flex;justify-content:space-around" class="radio_group unselectable" data-validate="radio">
				<div class="inline checkbox_area">
					<p-checkbox data-value="1"></p-checkbox>
					<span class="semi_bold">Tak</span>
				</div>
				<div class="inline checkbox_area">
					<p-checkbox data-value="0"></p-checkbox>
					<span class="semi_bold">Nie</span>
				</div>
			</div>
		`,
		open: (elem, data = { value: "" }) => {
			elem._child(".radio_group")._set_value(data.value);
		},
		apply: (elem) => {
			const radio_group = elem._child(".radio_group");
			const value = radio_group._get_value();
			let display = undefined;
			if (value === "1") {
				display = "Tak";
			}
			if (value === "0") {
				display = "Nie";
			}
			const validate = validateInputs([radio_group]);
			if (validate.length > 0) {
				return false;
			}

			return { type: "boolean", value: +value, display };
		},
	},
	{
		name: "number",
		getHtml: (column, data) => html`
			<span class="label first">
				<span>Typ wyszukiwania</span>
			</span>
			<select class="type field">
				<option value="=">Równa</option>
				<option value=">=">Większa, bądź równa</option>
				<option value="<=">Mniejsza, bądź równa</option>
				<option value="<>">Przedział</option>
			</select>
			<span class="label case_single input_wrapper glue_children">
				<input type="text" class="field num number" data-validate="" />
			</span>
			<span class="label case_range input_wrapper glue_children ">
				<input type="text" class="field more_than number" data-validate="" />
				<span class="field_desc"> do </span>
				<input type="text" class="field less_than number" data-validate="" />
			</span>
		`,
		open: (elem, data = { equal: "", smaller: "", bigger: "" }) => {
			const type = elem._child(".type");
			const num = elem._child(".num");
			const more_than = elem._child(".more_than");
			const less_than = elem._child(".less_than");

			type.addEventListener("change", () => {
				const type_v = type._get_value();
				const is_range = type_v === "<>";
				elem._child(".case_single").style.display = is_range ? "none" : "";
				elem._child(".case_range").style.display = is_range ? "" : "none";
			});

			num._set_value(def(data.num, ""));
			more_than._set_value(def(data.more_than, ""));
			less_than._set_value(def(data.less_than, ""));

			type._set_value(def(data.operator, "="));
		},
		apply: (elem) => {
			const type = elem._child(".type");
			const num = elem._child(".num");
			const more_than = elem._child(".more_than");
			const less_than = elem._child(".less_than");
			const type_v = type._get_value();
			const num_v = num._get_value();
			const more_than_v = more_than._get_value();
			const less_than_v = less_than._get_value();

			if (type_v === "<>") {
				const validate = validateInputs([less_than, more_than]);
				if (validate.length > 0) {
					return false;
				}

				return {
					type: "number",
					more_than: more_than_v,
					less_than: less_than_v,
					operator: type_v,
					display: `${more_than_v} <= X <= ${less_than_v}`,
				};
			} else {
				const validate = validateInputs([num]);
				if (validate.length > 0) {
					return false;
				}
				return { type: "number", num: num_v, operator: type_v, display: `X ${type_v} ${num_v}` };
			}
		},
	},
	{
		name: "date",
		getHtml: (column, data) => html`
			<span class="label first">
				<span>Typ wyszukiwania</span>
			</span>
			<select class="type field">
				<option value="=">Równa</option>
				<option value=">=">Większa, bądź równa</option>
				<option value="<=">Mniejsza, bądź równa</option>
				<option value="<>">Przedział</option>
			</select>
			<span class="label case_single input_wrapper glue_children">
				<input type="text" class="field num default_datepicker inline" data-validate="" />
			</span>
			<span class="label case_range input_wrapper glue_children default_daterangepicker">
				<input type="text" class="field more_than inline" data-validate="" />
				<span class="field_desc"> do </span>
				<input type="text" class="field less_than inline" data-validate="" />
			</span>
		`,
		open: (elem, data = { equal: "", smaller: "", bigger: "" }) => {
			const type = elem._child(".type");
			const num = elem._child(".num");
			const more_than = elem._child(".more_than");
			const less_than = elem._child(".less_than");

			type.addEventListener("change", () => {
				const type_v = type._get_value();
				const is_range = type_v === "<>";
				elem._child(".case_single").style.display = is_range ? "none" : "";
				elem._child(".case_range").style.display = is_range ? "" : "none";
			});

			num._set_value(def(data.num, ""));
			more_than._set_value(def(data.more_than, ""));
			less_than._set_value(def(data.less_than, ""));

			type._set_value(def(data.operator, "="));
		},
		apply: (elem) => {
			const type = elem._child(".type");
			const num = elem._child(".num");
			const more_than = elem._child(".more_than");
			const less_than = elem._child(".less_than");
			const type_v = type._get_value();
			const num_v = num._get_value();
			const more_than_v = more_than._get_value();
			const less_than_v = less_than._get_value();

			if (type_v === "<>") {
				const validate = validateInputs([less_than, more_than]);
				if (validate.length > 0) {
					return false;
				}

				return {
					type: "number",
					more_than: more_than_v,
					less_than: less_than_v,
					operator: type_v,
					display: `${more_than_v} <= X <= ${less_than_v}`,
				};
			} else {
				const validate = validateInputs([num]);
				if (validate.length > 0) {
					return false;
				}
				return { type: "number", num: num_v, operator: type_v, display: `X ${type_v} ${num_v}` };
			}
		},
	},
];
