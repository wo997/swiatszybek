/* js[global] */

/**
 * @type {{
 * name: string
 * html: string
 * open(elem: PiepNode, val: string)
 * apply(elem: PiepNode)
 * clear(elem: PiepNode)
 * }[]}
 */
let filter_menus = [
	{
		name: "string",
		html: html`<span>Wpisz frazę</span>
			<input type="text" class="field" style="width: 210px;" />
			<label style="margin-top:10px">
				<p-checkbox class="square inline"></p-checkbox>
				Dopasuj całość
			</label>`,
		open: (elem, val = "") => {
			elem._child("input")._set_value(val);
		},
		apply: (elem) => {
			return elem._child("input")._get_value();
		},
		clear: (elem) => {
			return elem._child("input")._set_value("");
		},
	},
	{
		name: "boolean",
		html: html`<p-radio class="default columns_1">
			<radio-option value="1">Tak</radio-option>
			<radio-option value="0">Nie</radio-option>
		</p-radio>`,
		open: (elem, val) => {
			elem._child("p-radio")._set_value(val);
		},
		apply: (elem) => {
			return elem._child("p-radio")._get_value();
		},
		clear: (elem) => {
			return elem._child("p-radio")._set_value("");
		},
	},
	{
		name: "date",
		html: html`<span class="label first">Typ wyszukiwania</span>
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
			</div>`,
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
