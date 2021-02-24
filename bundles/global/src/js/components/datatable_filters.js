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
			<input type="text" class="field" style="width: 210px;" />
			<label style="margin-top:10px">
				<p-checkbox class="square inline"></p-checkbox>
				Dopasuj całość
			</label>
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
				map.map
					.filter((e) => options_ids.includes(e.val))
					.forEach((e) => {
						options += html`<option value="${e.val}">${e.label}</option>`;
						if (typeof e.val === "number") {
							number = "data-number";
						}
					});
			}

			return html`
				<span>Wybierz opcję</span>
				<select class="field" style="width: 210px;" ${number}>
					<option value=""></option>
					${options}
				</select>
			`;
		},
		open: (elem, data = { string: "" }) => {
			elem._child("select")._set_value(data.val);
		},
		apply: (elem) => {
			const select = elem._child("select");
			const val = select._get_value();
			return { type: "exact", val, display: getSelectDisplayValue(select) };
		},
	},
	{
		name: "boolean",
		getHtml: (column, data) => html`
			<div style="display:flex;justify-content:space-around" class="radio_group" data-validate="radio">
				<label class="inline">
					<p-checkbox data-value="1"></p-checkbox>
					<span class="semi-bold">Tak</span>
				</label>
				<label class="inline">
					<p-checkbox data-value="0"></p-checkbox>
					<span class="semi-bold">Nie</span>
				</label>
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
				<option value="=">Równy</option>
				<option value=">=">Większy, bądź równy</option>
				<option value="<=">Mniejszy, bądź równy</option>
				<option value="<>">Przedział</option>
			</select>
			<span class="label case_single input_wrapper glue_children">
				<span class="field_desc">
					<b>x <span class="single_operator">=</span></b>
				</span>
				<input type="text" class="field num" data-validate="number" data-number />
			</span>
			<span class="label case_range input_wrapper glue_children">
				<input type="text" class="field more_than" data-validate="number" data-number />
				<span class="field_desc">
					<b>≤ x ≤</b>
				</span>
				<input type="text" class="field less_than" data-validate="number" data-number />
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
				elem._child(".single_operator")._set_content({ "<=": "≤", ">=": "≥", "=": "=" }[type_v]);
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
			TODO same as numbers
			<span class="label first">Typ wyszukiwania</span>
			<select class="field date_type" onchange="dateTypeChanged(this)">
				<option value="=">Dokładna data</option>
				<option value=">">Data od</option>
				<option value="<">Data do</option>
				<option value="<>">Przedział</option>
			</select>
			<div class="singledate_wrapper">
				<span class="label">Data</span>
				<input type="text" class="field default_datepicker margin_bottom" data-orientation="auto bottom" style="width: 254px;" />
			</div>

			<div class="margin_bottom date_range_picker" style="width: 254px;display:flex;">
				<div style="margin-right:5px">
					<span class="label">Od</span>
					<input type="text" class="field start" data-orientation="left bottom" />
				</div>
				<div>
					<span class="label">Do</span>
					<input type="text" class="field end" data-orientation="right bottom" />
				</div>
			</div>
		`,
		open: (elem, val) => {
			elem._child(".phrase")._set_value(val);
		},
		apply: (elem) => {
			return elem._child(".phrase")._get_value();
		},
	},
];

// 	if (filters == "text") {
// 		menu_header = `Wpisz frazę`;
// 		menu_body += html`<input type="text" class="field margin_bottom">
//       <label class='checkbox-wrapper block margin_bottom' text-align:center;color:#555'>
//         <input type='checkbox' name='exact'><div class='checkbox'></div> Dopasuj całą frazę
//       </label>
//     `;
// 	} else if (filters == "date") {
// 		if (!IS_TOUCH_DEVICE) {
// 			menu_header = `Wybierz datę`;
// 		}
// 		menu_body += html`
//       <span class="label first">Typ wyszukiwania</span>
//       <select class="field date_type" onchange="dateTypeChanged(this)">
//         <option value='='>Dokładna data</option>
//         <option value='>'>Data od</option>
//         <option value='<'>Data do</option>
//         <option value='<>'>Przedział</option>
//       </select>
//       <div class="singledate_wrapper">
//         <span class="label">Data</span>
//         <input type="text" class="field default_datepicker margin_bottom" data-orientation="auto bottom" style='width: 254px;'>
//       </div>

//       <div class="margin_bottom date_range_picker hidden" style='width: 254px;display:flex;'>
//         <div style="margin-right:5px">
//           <span class="label">Od</span>
//           <input type="text" class="field start" data-orientation="left bottom">
//         </div>
//         <div>
//           <span class="label">Do</span>
//           <input type="text" class="field end" data-orientation="right bottom">
//         </div>
//       </div>
//     `;
// 	} else if (filters == "select") {
// 		menu_header = `Zaznacz pola`;
// 		for (i = 0; i < col_def.select_values.length; i++) {
// 			var val = col_def.select_values[i];
// 			var label = col_def.select_labels ? col_def.select_labels[i] : val;
// 			var select_single = col_def.select_single ? "true" : "false";

// 			menu_body += html`<label class='checkbox-wrapper block'>
//                 <input type='checkbox' value='${val}' onchange='filterCheckboxChanged(this,${select_single})'><div class='checkbox'></div> ${label}
//             </label>`;
// 		}
// 	}