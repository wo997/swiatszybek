/* js[admin] */
function createSimpleList(params = {}) {
  var list = {};

  window[params.name] = list;

  list.name = params.name;
  list.fields = params.fields;
  list.params = params;
  list.recursive = nonull(params.recursive, 0);

  list.wrapper = $(`[name="${params.name}"]`);
  list.wrapper.classList.add("simple-list");
  list.wrapper.classList.add("warn-triangle");

  list.wrapper.setAttribute("data-list-name", list.name);

  if (!params.title) {
    params.title = "";
  }

  if (list.recursive) {
    list.wrapper.classList.add("recursive");
  }

  var btnTop = "";
  var btnTopTitle = "";
  if (params.header) {
    btnTopTitle = `
      <div class="btn primary add_btn add_begin" onclick="${list.name}.insertRowFromBtn(this,false)">
        Dodaj <i class="fas fa-plus"></i>
      </div>
    `;
    list.wrapper.classList.add("has_header");
  } else {
    btnTop = `
      <div class="btn primary add_btn add_begin" onclick="${list.name}.insertRowFromBtn(this,false)">Dodaj <i class="fas fa-plus"></i></div>
      `;
  }

  list.wrapper.insertAdjacentHTML(
    "afterbegin",
    `
      <div class="${params.title ? "field-title" : ""}">
        <span>${params.title} ${btnTopTitle}</span>
      </div>
      <div style='display:flex'>
        <div class='scroll-panel scroll-shadow horizontal'>
          <div style="flex-grow: 1;">
            ${btnTop}
            ${
              params.table
                ? `<table class="list"><thead><tr>${nonull(
                    params.header
                  )}</tr></thead><tbody></tbody></table>`
                : `<div class="list"></div>`
            }
            <div class="btn primary add_btn add_end main_add_btn" onclick="${
              list.name
            }.insertRowFromBtn(this,false)">Dodaj <i class="fas fa-plus"></i>
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

  list.insertRowFromBtn = (btn, begin = true, user = true) => {
    var row = list.insertRow(
      params.default_row,
      params.table
        ? btn.parent().find(".list tbody")
        : btn.parent().find(".list"),
      begin,
      user
    );
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
      btnAddTop = `<div class="btn secondary add_btn_top" style="margin-right:5px;white-space:nowrap" onclick="${list.name}.insertRowFromBtn($(this).parent().next(),true)" data-tooltip="Powiąż wartości (poziom niżej)">
            <i class="fas fa-plus"></i>
            <i class="fas fa-list-ul add_btn_top"></i>
          </div>`;

      btnTop = `
        <div class="btn primary add_btn add_begin" onclick="${list.name}.insertRowFromBtn(this,true)">Dodaj <i class="fas fa-plus"></i></div>
        `;

      btnBottom = `
          <div class="btn primary add_btn add_end" onclick="${list.name}.insertRowFromBtn(this,false)">Dodaj <i class="fas fa-plus"></i></div>
        `;
    }

    if (params.table) {
      listTarget.insertAdjacentHTML(
        begin ? "afterbegin" : "beforeend",
        `<tr class='simple-list-row'>
            ${params.render()}
            <td class='action_buttons'>
              <i class="btn secondary fas fa-arrow-up swap-row-btn btn-up" onclick="swapNodes($(this).parent().parent(),this.parent().parent().prev());${
                list.name
              }.valuesChanged();"></i>
              <i class="btn secondary fas fa-arrow-down swap-row-btn btn-down" onclick="swapNodes($(this).parent().parent(),this.parent().parent().next());${
                list.name
              }.valuesChanged();"></i>
              <i class="btn secondary fas fa-times remove-row-btn" 
                onclick="${list.name}.removeRowFromBtn(this);
                ${list.name}.valuesChanged();">
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
                  <i class="btn secondary fas fa-arrow-up swap-row-btn btn-up" onclick="swapNodes($(this).parent().parent().parent(),this.parent().parent().parent().prev());${
                    list.name
                  }.valuesChanged();"></i>
                  <i class="btn secondary fas fa-arrow-down swap-row-btn btn-down" onclick="swapNodes($(this).parent().parent().parent(),this.parent().parent().parent().next());${
                    list.name
                  }.valuesChanged();"></i>
                  <i class="btn secondary fas fa-times remove-row-btn" 
                    onclick="${list.name}.removeRowFromBtn(this);
                    ${list.name}.valuesChanged();">
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

    list.target.findAll(".simple-list-row-wrapper").forEach((listRow) => {
      var empty = !listRow.find(".sub-list").find(".simple-list-row-wrapper");

      var add_btn_top = listRow.find(".add_btn_top");
      if (add_btn_top) {
        add_btn_top.style.display = empty ? "" : "none";
      }
      var add_begin = listRow.find(".add_begin");
      if (add_begin) {
        add_begin.style.display = empty ? "none" : "";
      }
    });

    list.wrapper.dispatchEvent(new Event("change"));
    if (params.onChange) {
      params.onChange(list.values, list);
    }

    list.wrapper.setAttribute("data-count", list.values.length);
  };

  if (params.output) {
    $(params.output).setAttribute("data-type", "simple-list");
  }

  //set data-count etc.
  list.valuesChanged();
}

function validateSimpleList(field) {
  var errors = [];
  var valid = true;

  var list = window[field.getAttribute("data-list-name")];
  Object.entries(list.fields).forEach(([fieldName, fieldParams]) => {
    if (fieldParams.unique) {
      console.log(fieldName, fieldParams);
      field.findAll(".list").forEach((listNode) => {
        var rowValueInputs = {};
        var rowsParent = variants.params.table
          ? listNode.find("tbody")
          : listNode;
        rowsParent
          .directChildren()
          .filter((listRow) => {
            return listRow.classList.contains(
              variants.params.table
                ? "simple-list-row"
                : "simple-list-row-wrapper"
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
            var listFieldcheckRemoveRequired = () => {
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
            };

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
