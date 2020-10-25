/* js[admin] */

var simple_lists = [];
function createSimpleList(params = {}) {
  var list = {};

  //window[params.name] = list;
  const simple_list_id = simple_lists.length;
  simple_lists.push(list);

  //list.name = params.name;
  //list.form_name = nonull(params.form_name, params.name);
  list.fields = params.fields;
  list.params = params;
  list.recursive = nonull(params.recursive, 0);

  list.wrapper = nonull(params.wrapper, $(`[name="${params.name}"]`));
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
  var btnTopTitle = "";

  btnTopTitle = `
    <div class="btn primary add_btn add_begin" onclick="simple_lists[${simple_list_id}].insertRowFromBtn(this,true)">
      Dodaj <i class="fas fa-chevron-up"></i>
    </div>
    <div class="btn primary add_btn add_end" onclick="simple_lists[${simple_list_id}].insertRowFromBtn(this,false)">
      Dodaj <i class="fas fa-chevron-down"></i>
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

  list.wrapper.insertAdjacentHTML(
    "afterbegin",
    `
      <div class="${params.title ? "field-title" : ""}">
        <span>${params.title}</span> ${btnTopTitle}
      </div>
      <div style='display:flex'>
        <div class='scroll-panel scroll-shadow horizontal'>
          <div style="flex-grow: 1;">
            ${
              params.table
                ? `<table class="list"><thead><tr>${nonull(
                    params.header
                  )}</tr></thead><tbody></tbody></table>`
                : `<div class="list"></div>`
            }
            </div>
          </div>
        </div>
      </div>
      <div class="list-empty" style="display:none">${nonull(
        params.empty,
        ""
      )}</div>
    `
  );

  //<div class="btn primary add_btn add_end main_add_btn" onclick="simple_lists[${simple_list_id}].insertRowFromBtn(this,false)">Dodaj <i class="fas fa-plus"></i>

  list.insertRowFromBtn = (btn, begin = true, user = true) => {
    var row = list.insertRow(
      params.default_row,
      btn.parent().next().find(".list"),
      begin,
      user
    );
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

  list.setValuesFromString = (valuesString) => {
    var values;
    try {
      values = JSON.parse(valuesString);
    } catch (e) {
      values = [];
    }
    list.setValues(values);
  };

  list.setValues = (values) => {
    list.clear();

    var addValues = (values, listTarget = null) => {
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
          var parent_value_list = list
            .insertRow(value_data.values, listTarget)
            .find(".list");
          if (value_data.children) {
            addValues(value_data.children, parent_value_list);
          }
        }
      }
    };
    addValues(values);
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
    row.findAll("[name]").forEach((e) => {
      e.setValue("IGNOREVALIDATIONISSUES"); // remove validation issues - red border
    });
    row.remove();
    list.valuesChanged();
  };

  list.insertRow = (values, listTarget = null, begin = false, user = false) => {
    if (listTarget === null) {
      listTarget = list.target;
    }

    var depth = parseInt(listTarget.getAttribute("data-depth"));

    var btnTop = "";
    var btnBottom = "";
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
            Dodaj <i class="fas fa-chevron-up"></i>
          </div>
          <div class="btn primary add_btn add_end" onclick="simple_lists[${simple_list_id}].insertRowFromBtn(this,false)">
            Dodaj <i class="fas fa-chevron-down"></i>
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
                onclick="simple_lists[${simple_list_id}].removeRowFromBtn(this);
                simple_lists[${simple_list_id}].valuesChanged();">
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
                    onclick="simple_lists[${simple_list_id}].removeRowFromBtn(this);
                    simple_lists[${simple_list_id}].valuesChanged();">
                  </i>
                </div>
            </div>
            <div class="sub-list">
                ${btnTop}
                <div class="list" data-depth="${1 + depth}"></div>
                ${btnBottom}
            </div>
        </div>`
      );
    }

    list.valuesChanged();

    list.target.findAll("[name]:not(.param-registered)").forEach((e) => {
      e.classList.add("param-registered");

      e.addEventListener("change", () => {
        list.valuesChanged();
      });
    });

    var n = begin ? 0 : listTarget.children.length - 1;
    var addedNode = $(listTarget.children[n]);

    if (list.params.beforeRowInserted) {
      list.params.beforeRowInserted(addedNode, values, list, {
        user: user,
      });
    }

    // do it after any sub components were created
    setFormData(values, addedNode);

    if (list.params.afterRowInserted) {
      list.params.afterRowInserted(addedNode, values, list, {
        user: user,
      });
    }

    return addedNode;
  };

  list.valuesChanged = () => {
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
            row[param] = getValue(e);
          });
          rows.push(row);
        });
      } else {
        listTarget.directChildren().forEach((simpleListRowWrapper) => {
          var row_data = {
            values: {},
          };
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
              row_data.values[param] = getValue(e);
            });
          if (level < list.recursive) {
            row_data.children = getDirectRows(
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

    //list.outputNode.value = JSON.stringify(list.values);

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

    list.wrapper.dispatchEvent(new Event("change"));
    if (params.onChange && !list.during_change) {
      list.during_change = true;
      params.onChange(list.values, list);
      delete list.during_change;
    }

    list.wrapper.setAttribute("data-count", list.values.length);
  };

  if (params.output) {
    $(params.output).setAttribute("data-type", "simple-list");
  }

  //set data-count etc.
  list.valuesChanged();

  return simple_list_id;
}

function validateSimpleList(field) {
  var errors = [];
  var valid = true;

  var list = field.list;
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
            /*var listFieldcheckRemoveinsertRowFromBtn  = () => {
              inputs.forEach((list_field) => {
                if (list_field.classList.contains("required")) {
                  list_field.classList.remove("required");
                  list_field.removeEventListener(
                    "input",
                    listFieldcheckRemoveRequired
                  );
                  list_field.removeEventListener(
                    "change",
                    listFieldcheckRemoveRequired
                  );
                }
              });
            };*/

            if (!list_field.classList.contains("required")) {
              list_field.classList.add("required");
              list_field.addEventListener(
                "input",
                listFieldcheckRemoveRequired
              );
              list_field.addEventListener(
                "change",
                listFieldcheckRemoveRequired
              );
            }
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
