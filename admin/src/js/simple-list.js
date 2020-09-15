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

  list.wrapper.setAttribute("data-list-name", list.name);

  var className = "";

  if (!params.title) {
    params.title = "";
  }

  if (params.title) {
    className = "field-title";
  }

  var btnTop = "";
  var btnTopTitle = "";
  if (params.header) {
    btnTopTitle = `
      <div class="btn primary add_btn add_begin" onclick="${list.name}.insertRowFromBtn(this,true)">
        Dodaj <i class="fas fa-plus"></i>
      </div>
    `;
    list.wrapper.classList.add("has_header");
  } else {
    btnTop = `
      <div class="btn primary add_btn add_begin" onclick="${list.name}.insertRowFromBtn(this,true)">Dodaj <i class="fas fa-plus"></i></div>
      `;
  }

  list.wrapper.insertAdjacentHTML(
    "afterbegin",
    `
        <div class="${className}">
            <span>${params.title} ${btnTopTitle}</span>
        </div>
        ${btnTop}
        ${
          params.table
            ? `<table class="list"><thead><tr>${nonull(
                params.header
              )}</tr></thead><tbody></tbody></table>`
            : `<div class="list"></div>`
        }
        <div class="btn primary add_btn add_end" onclick="${
          list.name
        }.insertRowFromBtn(this,false)">Dodaj <i class="fas fa-plus"></i></div>
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

    if (user && params.onRowInserted) {
      params.onRowInserted(row);
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

  list.removeRow = (btn) => {
    var row = $(btn).parent().parent();

    row.findAll("[data-list-param]").forEach((e) => {
      e.setValue("ZGFSDFG et5y745b7 6dfghfgh"); // remove validation issues - red border
    });
    row.remove();
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
            <td style='width:92px'>
              <i class="btn secondary fas fa-arrow-up" onclick="swapNodes($(this).parent().parent(),this.parent().parent().prev());${
                list.name
              }.valuesChanged();"></i>
              <i class="btn secondary fas fa-arrow-down" onclick="swapNodes($(this).parent().parent(),this.parent().parent().next());${
                list.name
              }.valuesChanged();"></i>
              <i class="btn secondary fas fa-times" 
                onclick="${list.name}.removeRow(this);
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
                <i class="btn secondary fas fa-arrow-up" onclick="swapNodes($(this).parent().parent(),this.parent().parent().prev());${
                  list.name
                }.valuesChanged();"></i>
                <i class="btn secondary fas fa-arrow-down" onclick="swapNodes($(this).parent().parent(),this.parent().parent().next());${
                  list.name
                }.valuesChanged();"></i>
                <i class="btn secondary fas fa-times" 
                  onclick="${list.name}.removeRow(this);
                  ${list.name}.valuesChanged();">
                </i>
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

    list.target
      .findAll("[data-list-param]:not(.param-registered)")
      .forEach((e) => {
        e.classList.add("param-registered");

        e.addEventListener("change", () => {
          list.valuesChanged();
        });
      });

    var n = begin ? 0 : listTarget.children.length - 1;
    var addedNode = $(listTarget.children[n]);

    setFormData(values, addedNode, { find_by: "data-list-param" });
    return addedNode;
  };

  list.valuesChanged = () => {
    var getDirectRows = (listTarget, level) => {
      var rows = [];

      if (params.table) {
        listTarget.findAll("tr").forEach((row_node) => {
          var row = {};
          row_node.findAll("[data-list-param]").forEach((e) => {
            var param = e.getAttribute("data-list-param");
            row[param] = getValue(e);
          });
          rows.push(row);
        });
      } else {
        listTarget.directChildren().forEach((simpleListRowWrapper) => {
          var row = {
            values: {},
          };
          $(simpleListRowWrapper)
            .find(".simple-list-row")
            .findAll("[data-list-param]")
            .forEach((e) => {
              var param = e.getAttribute("data-list-param");
              row.values[param] = getValue(e);
            });
          if (level < list.recursive) {
            row.children = getDirectRows(
              $(simpleListRowWrapper).find(".sub-list > .list"),
              level + 1
            );
          }

          rows.push(row);
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
