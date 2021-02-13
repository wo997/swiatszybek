/* js[global] */

/**
 * @type {{
 * name: string
 * html: string
 * open(elem: PiepNode, data: any)
 * apply(elem: PiepNode)
 * clear(elem: PiepNode)
 * }[]}
 */
let filter_menus = [
	{
		name: "string",
		html: html`
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
		clear: (elem) => {
			elem._child("input")._set_value("");
			elem._child("p-checkbox")._set_value(0);
		},
	},
	{
		name: "boolean",
		html: html`
			<div style="display:flex;justify-content:space-around" class="radio_group">
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
			const value = elem._child(".radio_group")._get_value();
			let display = undefined;
			if (value === "1") {
				display = "Tak";
			}
			if (value === "0") {
				display = "Nie";
			}
			return { type: "boolean", value: +value, display };
		},
		clear: (elem) => {
			return elem._child(".radio_group")._set_value("");
		},
	},
	{
		name: "number",
		html: html`
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
					<span>X <b class="single_operator">=</b></span>
				</span>
				<input type="text" class="field num" />
			</span>
			<span class="label case_range input_wrapper glue_children">
				<input type="text" class="field more_than" />
				<span class="field_desc">
					<span><b><=</b> X <b><=</b></span>
				</span>
				<input type="text" class="field less_than" />
			</span>
		`,
		open: (elem, data = { equal: "", smaller: "", bigger: "" }) => {
			const type = elem._child(".type");
			const num = elem._child(".num");
			const more_than = elem._child(".more_than");
			const less_than = elem._child(".less_than");

			type.addEventListener("change", () => {
				const _type = type._get_value();
				const is_range = _type === "<>";
				elem._child(".case_single").style.display = is_range ? "none" : "";
				elem._child(".case_range").style.display = is_range ? "" : "none";
				elem._child(".single_operator")._set_content(_type);
			});

			num._set_value(def(data.num, ""));
			more_than._set_value(def(data.more_than, ""));
			less_than._set_value(def(data.less_than, ""));

			type._set_value(def(data.operator, "="));
		},
		apply: (elem) => {
			const type = elem._child(".type")._get_value();
			const num = elem._child(".num")._get_value();
			const more_than = elem._child(".more_than")._get_value();
			const less_than = elem._child(".less_than")._get_value();

			if (type === "<>") {
				return { type: "number", more_than, less_than, operator: type, display: `${more_than} <= X <= ${less_than}` };
			} else {
				return { type: "number", num, operator: type, display: `X ${type} ${num}` };
			}
		},
		clear: (elem) => {},
	},
	{
		name: "date",
		html: html`
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
		clear: (elem) => {
			return elem._child("input")._set_value("");
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
