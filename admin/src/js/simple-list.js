/* js[admin] */

var simple_lists = [];
function createSimpleList(params = {}) {
	var list = {};

	//window[params.name] = list;
	const simple_list_id = simple_lists.length;
	simple_lists.push(list);

	//list.name = params.name;
	//list.form_name = def(params.form_name, params.name);
	list.fields = params.fields;
	list.params = params;
	list.recursive = def(params.recursive, 0);

	list.wrapper = def(params.wrapper, $(`[name="${params.name}"]`));
	list.wrapper.list = list;
	list.wrapper.classList.add("simple-list");
	list.wrapper.classList.add("warn-triangle");

	if (!params.title) {
		params.title = "";
	}

	if (list.recursive) {
		list.wrapper.classList.add("recursive");
	}

	/*var btnTop = "";*/
	var add_btns = "";

	add_btns = `
    <div class="btn primary add_btn add_begin" onclick="simple_lists[${simple_list_id}].insertRowFromBtn(this,true)">
      <i class="fas fa-plus-circle"></i> <i class="fas fa-arrow-up"></i>
    </div>
    <div class="btn primary add_btn add_end" onclick="simple_lists[${simple_list_id}].insertRowFromBtn(this,false)">
      <i class="fas fa-plus-circle"></i> <i class="fas fa-arrow-down"></i>
    </div>
  `;
	if (params.header) {
		list.wrapper.classList.add("has_header");
	} /*else {
    btnTop = `
      <div class="btn primary add_btn add_begin" onclick="simple_lists[${simple_list_id}].insertRowFromBtn(this,true)">
        Dodaj <i class="fas fa-chevron-up"></i>
      </div>
      <div class="btn primary add_btn add_begin" onclick="simple_lists[${simple_list_id}].insertRowFromBtn(this,false)">
        Dodaj <i class="fas fa-chevron-down"></i>
      </div>
      `;
  }*/

	//${btnTop}

	if (params.injectAddButtons) {
		params.injectAddButtons(add_btns);
	} else {
		var success = false;
		var prev = list.wrapper.prev();
		prev.classList.add("above-simple-list");
		if (prev) {
			var add_buttons = prev.find(".add_buttons");
			if (add_buttons) {
				add_buttons.setContent(add_btns);
				success = true;
			}
		}
		if (!success) {
			list.wrapper.insertAdjacentHTML("afterbegin", add_btns);
		}
	}

	var list_html = `
    ${
			params.table
				? `<table class="list"><thead><tr>${def(
						params.header
				  )}</tr></thead><tbody></tbody></table>`
				: `<div class="list"></div>`
		}
    <div class="list-empty" style="display:none">${def(params.empty, "")}</div>
  `;

	list.wrapper.insertAdjacentHTML("beforeend", list_html);

	if (
		!list.wrapper.findParentByClassName(
			["scroll-panel", "scroll-shadow", "horizontal"],
			{ require_all: true }
		)
	) {
		list.wrapper.insertAdjacentHTML(
			"afterend",
			`
      <div class='simple-list-scroll-wrapper'>
        <div class='scroll-panel scroll-shadow horizontal'>
          <div class='simple-list-scroll-content'>
            
          </div>
        </div>
      </div>
    `
		);
		list.wrapper
			.next()
			.find(".simple-list-scroll-content")
			.appendChild(list.wrapper);
	}

	//<div class="btn primary add_btn add_end main_add_btn" onclick="simple_lists[${simple_list_id}].insertRowFromBtn(this,false)">Dodaj <i class="fas fa-plus"></i>

	list.insertRowFromBtn = (btn, begin = true, user = true) => {
		const slr = btn.findParentByClassName("sub-list");
		console.log(btn, slr);

		var row = list.insertRow(
			params.default_row,
			slr
				? slr.find(".list")
				: btn.findParentByClassName("above-simple-list").next().find(".list"),
			begin,
			user
		);

		if (user) {
			scrollIntoView(row);
		}
	};

	list.insertRowFromTopBtn = (btn, begin = true, user = true) => {
		var add_btn = btn.parent().next().find(".add_btn");
		if (add_btn) {
			list.insertRowFromBtn(add_btn, begin, user);
		}
	};

	list.target = params.table
		? list.wrapper.find(`.list tbody`)
		: list.wrapper.find(`.list`);
	list.target.setAttribute("data-depth", 1);

	//list.outputNode = $(`.${params.name} .simple-list-value`);

	list.emptyNode = list.wrapper.find(`.list-empty`);

	list.rows = [];

	list.clear = () => {
		removeContent(list.target);
		list.valuesChanged();
	};

	list.setListValues = (values) => {
		if (typeof values === "string") {
			try {
				values = JSON.parse(values);
				list.setListValues(values);
			} catch (e) {}
			return;
		}

		const addValues = (values, listTarget = null) => {
			if (listTarget === null) {
				listTarget = list.target;
			}

			if (params.table) {
				for (var value_data of values) {
					var parent_value_list = list
						.insertRow(value_data, listTarget)
						.find(".list");
				}
			} else {
				for (var value_data of values) {
					// TODO: remove once u get rid of everything, .values and .children shouldnt be there anymore
					var parent_value_list = list
						.insertRow(
							value_data.values ? value_data.values : value_data,
							listTarget
						)
						.find(".list");
					if (value_data.children || value_data._children) {
						addValues(
							value_data._children ? value_data._children : value_data.children,
							parent_value_list
						);
					}
				}
			}
		};

		list.setting_values = true;
		list.clear();
		addValues(values);
		delete list.setting_values;
	};

	list.removeRowFromBtn = (btn) => {
		var tar = null;
		if (list.params.table) {
			tar = $(btn).parent().parent();
		} else {
			tar = $(btn).parent().parent().parent();
		}
		list.removeRow(tar);
	};

	list.removeRow = (row) => {
		row.remove();
		list.valuesChanged(row);
	};

	list.insertRow = (values, listTarget = null, begin = false, user = false) => {
		if (listTarget === null) {
			listTarget = list.target;
		}
		if (list.params.table && listTarget.tagName != "TBODY") {
			listTarget = listTarget.find("tbody");
		}

		var depth = parseInt(listTarget.getAttribute("data-depth"));

		var btnTop = "";
		var btnAddTop = "";

		if (depth < list.recursive) {
			btnAddTop = `<div class="btn primary add_btn_top" style="margin-right:5px;white-space:nowrap" onclick="simple_lists[${simple_list_id}].insertRowFromTopBtn(this,true)" data-tooltip="Dodaj wartości podrzędne">
        <i class="fas fa-plus"></i>
        <i class="fas fa-list-ul add_btn_top"></i>
      </div>`;

			btnTop = `
        <div class='field-title'>
          Wartości podrzędne
          <div class="btn primary add_btn add_begin" onclick="simple_lists[${simple_list_id}].insertRowFromBtn(this,true)">
          <i class="fas fa-plus"></i> <i class="fas fa-arrow-up"></i>
          </div>
          <div class="btn primary add_btn add_end" onclick="simple_lists[${simple_list_id}].insertRowFromBtn(this,false)">
          <i class="fas fa-plus"></i> <i class="fas fa-arrow-down"></i>
          </div>
        </div>
      `;
		}

		if (params.table) {
			listTarget.insertAdjacentHTML(
				begin ? "afterbegin" : "beforeend",
				`<tr class='simple-list-row'>
            ${params.render()}
            <td class='action_buttons'>
              <i class="btn secondary fas fa-arrow-up swap-row-btn btn-up" onclick="swapNodes($(this).parent().parent(),this.parent().parent().prev());simple_lists[${simple_list_id}].valuesChanged();"></i>
              <i class="btn secondary fas fa-arrow-down swap-row-btn btn-down" onclick="swapNodes($(this).parent().parent(),this.parent().parent().next());simple_lists[${simple_list_id}].valuesChanged();"></i>
              <i class="btn secondary fas fa-times remove-row-btn" 
                onclick="simple_lists[${simple_list_id}].removeRowFromBtn(this);">
              </i>
            </td>
        </tr>`
			);
		} else {
			listTarget.insertAdjacentHTML(
				begin ? "afterbegin" : "beforeend",
				`<div class='simple-list-row-wrapper'>
            <div class='simple-list-row'>
                ${params.render()}
                <div style="width:5px;margin-left:auto"></div>
                ${btnAddTop}
                <div class='action_buttons'>
                  <i class="btn secondary fas fa-arrow-up swap-row-btn btn-up" onclick="swapNodes($(this).parent().parent().parent(),this.parent().parent().parent().prev());simple_lists[${simple_list_id}].valuesChanged();"></i>
                  <i class="btn secondary fas fa-arrow-down swap-row-btn btn-down" onclick="swapNodes($(this).parent().parent().parent(),this.parent().parent().parent().next());simple_lists[${simple_list_id}].valuesChanged();"></i>
                  <i class="btn secondary fas fa-times remove-row-btn" 
                    onclick="simple_lists[${simple_list_id}].removeRowFromBtn(this);">
                  </i>
                </div>
            </div>
            <div class="sub-list">
                ${btnTop}
                <div class="list" data-depth="${1 + depth}"></div>
            </div>
        </div>`
			);
		}

		var n = begin ? 0 : listTarget.children.length - 1;
		var addedNode = $(listTarget.children[n]);

		//list.valuesChanged(addedNode);

		if (list.params.onRowInserted) {
			list.params.onRowInserted(addedNode, values, list, {
				user: user,
			});
		}

		// do it after any sub components were created in onRowInserted callback :)
		list.setting_data = true;
		setFormData(values, addedNode, { quiet: true });
		delete list.setting_data;

		list.registerFields(list.target);
		list.valuesChanged(addedNode);

		if (list.params.onNewRowDataSet) {
			list.params.onNewRowDataSet(addedNode, values, list, {
				user: user,
			});
		}

		return addedNode;
	};

	list.registerFields = (listTarget = null) => {
		if (listTarget === null) {
			listTarget = list.target;
		}

		listTarget.findAll("[name]:not(.param-registered)").forEach((e) => {
			var parent_named_node = e.findParentByAttribute("name", {
				skip: 1,
			});
			// only direct named children communicate with subform
			if (parent_named_node && parent_named_node.findParentNode(listTarget)) {
				return;
			}

			e.classList.add("param-registered");

			e.addEventListener("change", () => {
				list.registerFields(listTarget);
				list.valuesChanged(
					e.findParentByClassName(
						list.table ? "simple-list-row" : "simple-list-row-wrapper"
					)
				);
			});
		});

		registerForms();
	};

	list.valuesChanged = (changeListTarget = null) => {
		var getDirectRows = (listTarget, level) => {
			var rows = [];

			if (params.table) {
				listTarget.findAll("tr").forEach((row_node) => {
					var row = {};
					row_node.findAll("[name]").forEach((e) => {
						var parent_named_node = e.findParentByAttribute("name", {
							skip: 1,
						});
						// there is no other component allowed when we read the data, we use its value instead
						if (parent_named_node != list.wrapper) {
							return;
						}
						var param = e.getAttribute("name");
						row[param] = e.getValue();
					});
					rows.push(row);
				});
			} else {
				listTarget.directChildren().forEach((simpleListRowWrapper) => {
					var row_data = {};
					$(simpleListRowWrapper)
						.find(".simple-list-row")
						.findAll("[name]")
						.forEach((e) => {
							var parent_row_node = e.findParentByClassName("simple-list-row");

							// only direct named children communicate with subform
							if (simpleListRowWrapper != parent_row_node.parent()) {
								return;
							}
							var param = e.getAttribute("name");
							row_data[param] = e.getValue();
						});
					if (level < list.recursive) {
						row_data._children = getDirectRows(
							$(simpleListRowWrapper).find(".sub-list > .list"),
							level + 1
						);
					}

					rows.push(row_data);
				});
			}

			list.emptyNode.style.display = rows.length === 0 ? "block" : "none";

			return rows;
		};

		list.values = getDirectRows(list.target, 1);

		if (list.recursive) {
			list.target.findAll(".simple-list-row-wrapper").forEach((listRow) => {
				var parent_sl_node = listRow.findParentByClassName("simple-list");

				// only direct named children communicate with subform
				if (list.wrapper != parent_sl_node) {
					return;
				}

				var empty = !listRow.find(".sub-list").find(".simple-list-row-wrapper");

				var add_btn_top = listRow.find(".add_btn_top");
				if (add_btn_top) {
					add_btn_top.style.display = empty ? "" : "none";
				}
				var sublist = listRow.find(".sub-list");
				if (sublist) {
					sublist.style.display = empty ? "none" : "";
				}
			});
		}

		list.wrapper.setAttribute("data-count", list.values.length);

		if (!list.setting_values) {
			list.wrapper.dispatchChange();
		}
		if (params.onChange && !list.during_change && !list.setting_data) {
			params.onChange(list.values, list, changeListTarget);
		}
	};

	// set initial state / data-count etc.
	list.valuesChanged();

	// form compatibility
	list.wrapper.setValue = (value, options = {}) => {
		list.setListValues(value);

		if (!options.quiet) {
			list.wrapper.dispatchChange();
		}
	};
	list.wrapper.getValue = () => {
		if (list.params.data_type == "json") {
			return JSON.stringify(list.values);
		}
		return list.values;
	};

	return simple_list_id;
}

function validateSimpleList(field) {
	var errors = [];
	var valid = true;

	var list = field.list;

	list.wrapper.findAll(".simple-list-field-error").forEach((e) => {
		e.classList.remove("simple-list-field-error");
	});

	Object.entries(list.fields).forEach(([fieldName, fieldParams]) => {
		if (fieldParams.unique) {
			field.findAll(".list").forEach((listNode) => {
				var rowValueInputs = {};
				var rowsParent = list.params.table ? listNode.find("tbody") : listNode;
				rowsParent
					.directChildren()
					.filter((listRow) => {
						return listRow.classList.contains(
							list.params.table ? "simple-list-row" : "simple-list-row-wrapper"
						);
					})
					.forEach((listRowWrapper) => {
						var rowField = listRowWrapper.find(`[name="${fieldName}"]`);

						var fieldValue = rowField.getValue();

						if (!(fieldValue === "" && fieldParams.allow_empty)) {
							if (!rowValueInputs[fieldValue]) {
								rowValueInputs[fieldValue] = [];
							}
							rowValueInputs[fieldValue].push(rowField);
						}
					});

				Object.entries(rowValueInputs).forEach(([fieldValue, inputs]) => {
					if (inputs.length < 2) return;

					valid = false;
					inputs.forEach((list_field) => {
						list_field.classList.add("simple-list-field-error");
					});
				});
			});
		}
	});
	if (!valid) {
		errors.push("Wartości nie mogą się powtarzać");
	}

	return errors;
}
