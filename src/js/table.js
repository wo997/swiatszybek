/* js[global] */
function createTable(table) {
  // REQUIRED name, definition | renderRow, url, primary, db_table
  // OPTIONAL controls OR controlsRight, width, nosearch, rowCount (10,20,50), onSearch, onCreate
  // sortable (requires primary, db_table),
  // selectable: {data,output},
  // has_metadata: (boolean, enables outputting metadata from additional row inputs)
  // tree_view
  // lang: {subject, main_category}
  window[table.name] = table;
  table.awaitId = null;
  table.currPage = 1;
  table.pageCount = 0;
  table.request = null;
  table.results = [];

  if (!table.lang) table.lang = {};
  table.lang.subject = nonull(table.lang.subject, "wyników");

  table.target = $("." + table.name);

  table.target.classList.add("datatable-wrapper");
  table.target.setAttribute("data-table-name", table.name);

  if (table.selectable) {
    table.selection = [];
    table.singleselect = table.selectable.singleselect;
    if (table.selectable.has_metadata) {
      table.metadata = {};
    }

    table.setSelectedValuesString = (v) => {
      // Works also with json to make it easier to use
      var values = typeof v == "string" ? JSON.parse(v) : v;
      var selection = [];

      // If someone didn't provide array
      if (table.singleselect) {
        if (!Array.isArray(values)) {
          values = [values];
        }
      }

      if (table.selectable.has_metadata) {
        var metadata = [];
        try {
          Object.entries(values).forEach(([row_id, row_metadata]) => {
            selection.push(parseInt(row_id));
            metadata[parseInt(row_id)] = row_metadata;
          });
        } catch (e) {
          console.log(e);
        }

        table.metadata = metadata;
      } else {
        // no metadata, raw table
        try {
          for (val of values) {
            selection.push(parseInt(val));
          }
        } catch (e) {}
      }
      table.selection = selection;

      table.selectionValueElement.value = values;

      table.createList();
    };
    table.getSelectedValuesString = () => {
      return JSON.stringify(table.selection);
    };
    table.getSelectedValuesAllString = () => {
      // for metadata
      return JSON.stringify(table.metadata);
    };
  }
  if (!table.selection) {
    table.selection = [];
  }

  if (table.tree_view) {
    table.lang.main_category = nonull(
      table.lang.main_category,
      "Kategoria główna"
    );

    table.breadcrumb = [
      {
        title:
          `<i class="fas fa-home" style="margin-right: 4px;"></i>` +
          table.lang.main_category,
        category_id: -1,
      },
    ];

    table.controls += `
        <div style="width:100%">
          <div class="breadcrumb"></div>
          <div class="btn primary" onclick="${table.name}.showEditCategory(this,null,true)">Dodaj <i class="fa fa-plus"></i></div>
        </div>
      `;
  }

  var justTable = "";

  if (table.controls) {
    justTable += `<div class="flexbar">${table.controls}</div>`;
  }

  justTable += `<div class="flexbar" style="align-items: baseline;">
        <span class="total-rows"></span>
        <span class="space-right">&nbsp;${table.lang.subject}</span>
        <select data-param="rowCount">
            <option value='10' ${
              table.rowCount == 10 ? "selected" : ""
            }>10</option>
            <option value='20' ${
              !table.rowCount || table.rowCount == 20 ? "selected" : ""
            }>20</option>
            <option value='50' ${
              table.rowCount == 50 ? "selected" : ""
            }>50</option>
        </select>
        <span class="space-right big no-space-mobile">&nbsp;&nbsp;na stronę</span>
        <div class="pagination"></div>`;

  if (table.controlsRight) {
    justTable += `${table.controlsRight}`;
  }

  justTable += `</div>
      <div class="table-wrapper">
    </div>`;

  if (table.selectable) {
    table.target.insertAdjacentHTML(
      "afterbegin",
      `
          <div class="selectedRows"></div>
          <div class="showBtn expandY">
            <div class="btn secondary fill" onclick="${
              table.name
            }.toggleSearchVisibility(true)">Wyszukaj <i class="fas fa-plus"></i> </div>
          </div>
          <input type="hidden" class="table-selection-value" name="${
            table.selectable.output ? table.selectable.output : table.primary
          }" ${table.selectable.validate ? `data-validate` : ""}>
          <div class="table-search-wrapper ${
            table.selectable ? `expandY hidden` : ""
          }">
            <div class="table-search-container">
              <div class="btn secondary fill hideBtn" onclick="${
                table.name
              }.toggleSearchVisibility(false)">Ukryj wyszukiwarkę <i class="fas fa-minus"></i> </div>
              ${justTable}
            </div>
          </div>
        `
    );
  } else {
    table.target.insertAdjacentHTML("afterbegin", justTable);
  }

  if (table.onCreate) table.onCreate();

  table.searchElement = table.target.find(".search-wrapper");
  table.tableElement = table.target.find(".table-wrapper");
  table.totalRowsElement = table.target.find(".total-rows");
  table.paginationElement = table.target.find(".pagination");
  table.selectionElement = table.target.find(".selectedRows");
  table.selectionValueElement = table.target.find(".table-selection-value");

  if (table.tree_view) {
    table.breadcrumbElement = table.target.find(".breadcrumb");

    table.getParentId = () => {
      if (table.breadcrumb.length == 0) return -1;
      return table.breadcrumb[table.breadcrumb.length - 1].category_id;
    };
    table.backToCategory = (category_id = 0) => {
      var steps = null;
      for (i = 0; i < table.breadcrumb.length; i++) {
        if (table.breadcrumb[i].category_id == category_id) {
          steps = table.breadcrumb.length - 1 - i;
          break;
        }
      }
      table.categoryStepBack(steps);
    };
    table.categoryStepBack = (steps) => {
      if (steps > 0) {
        for (i = 0; i < steps; i++) {
          if (table.breadcrumb.length > 0) {
            table.breadcrumb.pop();
          }
        }
        table.search();
      }
    };
    table.openCategory = (row_id) => {
      var row = table.results[row_id];
      table.breadcrumb.push({
        title: row.title,
        category_id: row.category_id,
      });
      table.search();
    };
    table.showEditCategory = (btn = null, row_id = null, isNew = false) => {
      var form = table.tree_view.form;

      var loadCategoryFormCallback = (data) => {
        table.tree_view.form_data = data;
        table.tree_view.loadCategoryForm(form, data, isNew);

        var params = {};
        if (!isNew) {
          params.disable_with_children = [table.category_id];
        }

        setCategoryPickerValues(
          $(`#${form} [data-category-picker-name="parent_id"]`),
          data.parent_id,
          params
        );

        setModalInitialState(form);
      };

      showModal(form, { source: btn });

      if (isNew) {
        loadCategoryFormCallback({
          parent_id: table.getParentId(),
          category_id: -1,
        });
      } else {
        var category_id = 0;
        if (row_id === null) {
          category_id = table.getParentId();
        } else {
          var row = table.results[row_id];
          category_id = row.category_id;
        }

        var formParams = nonull(table.tree_view.formParams, {});
        formParams.category_id = category_id;

        xhr({
          url: table.url,
          params: formParams,
          success: (res) => {
            loadCategoryFormCallback(res.results[0]);
          },
        });
      }
    };
    table.postSaveCategory = (params, remove) => {
      var parentChanged =
        table.tree_view.form_data.parent_id != params.parent_id;
      var isCurrent = table.getParentId() == params.category_id;
      if ((remove || parentChanged) && isCurrent) {
        table.categoryStepBack(1);
      } else {
        if (isCurrent) {
          table.breadcrumb[table.breadcrumb.length - 1].title = params.title;
        }
        table.search();
      }
    };
  }

  if (table.width) {
    table.target.style.maxWidth = table.width + "px";
    table.target.style.marginLeft = "auto";
    table.target.style.marginRight = "auto";
  }

  if (table.sortable) {
    if (!table.primary) console.error(`missing primary key in ${table.name}`);
    if (!table.db_table)
      console.error(`missing db_table name in ${table.name}`);
    table.definition = [
      {
        title: "Kolejność",
        width: "85px",
        render: (r, i) => {
          return `<i class="fas fa-arrows-alt-v" style="cursor:grab"></i> <input type="number" class="kolejnosc" value="${r.kolejnosc}" data-table='${table.name}' data-index='${i}' onchange="rearrange(this)">`;
        },
        escape: false,
      },
      ...table.definition,
    ];
  }

  var headersHTML = "<tr>";
  var columnStyles = [];

  if (table.selectable) {
    headersHTML += `<th style="width:35px"></th>`;
  }

  for (header of table.definition) {
    var style = "";
    if (header.width) style += `style='width:${header.width}'`;
    if (header.className) style += `class='${header.className}'`;
    headersHTML += `<th ${style}>` + header.title + `</th>`;
    columnStyles.push(style);
  }
  headersHTML += "</tr>";

  table.headersHTML = headersHTML;
  table.columnStyles = columnStyles;

  table.awaitSearch = function () {
    clearTimeout(table.awaitId);
    table.awaitId = setTimeout(function () {
      table.search();
    }, 400);
  };

  $$(`.${table.name} [data-param]`).forEach((e) => {
    const onParamsChange = () => {
      if (e.tagName == "INPUT") table.awaitSearch();
      else table.search();
    };
    e.addEventListener("input", function () {
      onParamsChange();
    });
    e.addEventListener("change", function () {
      onParamsChange();
    });
  });

  table.search = (callback = null, createList = false) => {
    clearTimeout(table.awaitId);

    if (table.request) table.request.abort();

    if (table.tree_view) {
      // breadcrumb update
      var out = "";
      var index = -1;
      for (let category of table.breadcrumb) {
        index++;
        if (index > 0) out += ` <i class="fas fa-chevron-right"></i> `;
        out += `<div class="${
          index < table.breadcrumb.length - 1 ? "btn secondary" : "current"
        }" onclick="${table.name}.backToCategory(${category.category_id})">${
          category.title
        }</div>`;
      }
      if (table.breadcrumb.length > 1)
        out += ` <div class="btn primary" onclick="${table.name}.showEditCategory(this,null)" style="margin-left:10px">Edytuj <i class="fa fa-cog"></i></div>`;
      table.breadcrumbElement.innerHTML = out;
    }

    var params = {};
    params.filters = [];

    if (createList) {
      params.filters.push({
        type: "=",
        values: table.selection,
        field: table.primary,
      });
    } else {
      if (table.params) {
        Object.assign(params, table.params());
      }
      if (table.requiredParam) {
        var x = table.requiredParam();
        if (x || x === 0) {
          params[requiredFilterTables[table.db_table]] = x;
        }
      }
      $$(`.${table.name} [data-param]`).forEach((e) => {
        if (e.findParentByClassName("hidden", "datatable-wrapper")) {
          return;
        }
        params[e.getAttribute("data-param")] = e.getValue();
      });
      if (table.selectable) {
        // TODO get values from metadata or regular array
        params.filters.push({
          type: "!=",
          values: table.selection,
          field: table.primary,
        });
      }
      if (table.tree_view) {
        params.parent_id = table.getParentId();
      }
    }

    var paramsJson = JSON.stringify(params);
    if (table.lastParamsJson && table.lastParamsJson != paramsJson) {
      table.currPage = 1;
    }
    table.lastParamsJson = paramsJson;

    var canOrder = table.sortable;
    if (canOrder) {
      var needsRequired = requiredFilterTables[table.db_table];
      var hasRequired = false;
      Object.entries(params).forEach(([key, value]) => {
        if (value && key != "rowCount") {
          canOrder = false;
        }
        if (needsRequired && key == needsRequired) {
          hasRequired = true;
        }
      });
      if (needsRequired && !hasRequired) {
        canOrder = false;
      } else {
        canOrder = true;
      }

      table.target.classList.toggle("noOrder", !canOrder);
    }

    table.request = xhr({
      url: table.url,
      params: {
        ...params,
        pageNumber: table.currPage,
      },
      success: (res) => {
        table.pageCount = res.pageCount;
        table.results = res.results;
        var output = "";

        output = `<table class='datatable'>${table.headersHTML}`;
        for (i = 0; i < table.results.length; i++) {
          var row = table.results[i];
          var attr = "";
          if (canOrder) attr = "draggable='true'";
          output += `<tr data-index='${i}' ${attr} ${
            table.primary ? `data-primary=${row[table.primary]}` : ""
          }>`;

          if (table.renderRow) {
            var cell = table.renderRow(row, i);
            output += `<td>${cell}</td>`;
          } else {
            if (table.selectable) {
              if (createList) {
                output += `<td style="width:33px"> <i class="fas fa-minus-circle" onclick="${
                  table.name
                }.removeRow(${row[table.primary]})"></i> </td>`;
              } else {
                output += `<td style="width:33px"> <i class="fas fa-plus-circle" onclick="${
                  table.name
                }.addRow(${row[table.primary]})"></i> </td>`;
              }
            }
            for (x = 0; x < table.definition.length; x++) {
              var definition = table.definition[x];
              var cell = definition.render(row, i, table);
              if (
                !definition.hasOwnProperty("escape") ||
                definition.escape === true
              ) {
                cell = escapeHTML(cell);
              }
              output += `<td ${table.columnStyles[x]}>${cell}</td>`;
            }
          }
          output += "</tr>";
        }
        output += `</table>`;

        output += `<div class="no-results" style="${
          table.results.length > 0 ? "display:none;" : ""
        }width:100%;text-align:center;background: #f8f8f8;margin-top: -10px;padding: 10px;font-weight: 600;">
            Brak ${createList ? "powiązanych " : ""}${
          table.lang.subject
        } <i class="btn secondary fas fa-sync-alt" onclick='${
          table.name
        }.search()' style="width: 24px;height: 24px;display: inline-flex;justify-content: center;align-items: center;"></i>
          </div>`;

        if (createList) {
          table.selectionElement.setContent(output);
        } else {
          renderPagination(
            table.paginationElement,
            table.currPage,
            table.pageCount,
            (i) => {
              table.currPage = i;
              table.search();
            },
            { allow_my_page: true }
          );
          table.totalRowsElement.setContent(res.totalRows);
          table.tableElement.setContent(output);
        }

        table.target.findAll("td").forEach((e) => {
          if (
            //e.classList.contains("tooltipable") &&
            getNodeTextWidth(e) >
            e.getBoundingClientRect().width - 5
          ) {
            var info = e.textContent.replace(/, /g, "<br>").trim();
            if (info.length > 10) {
              e.setAttribute("data-tooltip", info);
            }
          }
        });

        if (table.selectable && table.selectable.has_metadata) {
          table.registerMetadataFields();
        }

        if (callback) callback(res); // custom
        if (table.onSearch) table.onSearch(res); // default
      },
    });
  };

  table.initialSearch = () => {
    if (
      !table.hasOwnProperty("nosearch") ||
      table.nosearch === false ||
      table.selectable
    ) {
      table.search();
    }
  };
  table.createList = (firstLoad) => {
    if (firstLoad && table.nosearch === true) {
      return;
    }

    table.search(() => {
      table.initialSearch();

      if (table.selectable && table.selectable.has_metadata) {
        try {
          Object.entries(table.metadata).forEach(([key, value]) => {
            var row = table.selectionElement.find(`[data-primary="${key}"]`);
            if (row) {
              Object.entries(value).forEach(([key, value]) => {
                var m = row.find(`[data-metadata="${key}"]`);
                if (m) m.setValue(value);
              });
            }
          });
        } catch (e) {
          console.error(e);
        }
      }

      table.selectionChange(false);
    }, true);
  };
  if (table.selectable) {
    table.createList(true);
  } else {
    table.initialSearch();
  }

  table.toggleSearchVisibility = (visible) => {
    expand($(`.${table.name} .showBtn`), !visible);
    expand($(`.${table.name} .table-search-wrapper`), visible);
  };

  table.removeRow = (data_id) => {
    const index = table.selection.indexOf(data_id);
    if (index !== -1) {
      table.selection.splice(index, 1);
    } else {
      return;
    }

    removeNode(table.target.find(`[data-primary='${data_id}']`));
    table.selectionChange();
  };
  table.addRow = (data_id) => {
    if (table.singleselect && table.selection.length > 0) {
      table.removeRow(table.selection[0]);
    }
    if (table.singleselect || table.selection.indexOf(data_id) === -1) {
      table.selection.push(data_id);
      var x = table.target.find(`[data-primary='${data_id}']`);
      table.selectionElement.find("tbody").appendChild(x);
      var d = x.find(".fa-plus-circle");
      d.outerHTML = d.outerHTML
        .replace("plus", "minus")
        .replace("addRow", "removeRow");
      table.selectionChange();
    }
  };
  table.selectionChange = (doSearch = true) => {
    if (table.selectable.has_metadata) {
      table.registerMetadataFields();
    }

    var e = table.selectionElement.find(".no-results");
    if (e) e.style.display = table.selectionElement.find("td") ? "none" : "";
    var e = table.target.find(".table-search-container .no-results");
    if (e)
      e.style.display = table.target.find(".table-search-container td")
        ? "none"
        : "";

    if (table.selectable.has_metadata) {
      var metadata = {};
      table.selectionElement.findAll("tr[data-primary]").forEach((e) => {
        var row = {};
        e.findAll("[data-metadata]").forEach((m) => {
          row[m.getAttribute("data-metadata")] = m.getValue();
        });
        metadata[parseInt(e.getAttribute("data-primary"))] = row;
      });
      table.metadata = metadata;
    }

    var selection = [];
    table.selectionElement.findAll("[data-primary]").forEach((e) => {
      selection.push(parseInt(e.getAttribute("data-primary")));
    });

    table.selection = selection;

    table.selectionValueElement.value = table.selectable.has_metadata
      ? table.getSelectedValuesAllString()
      : table.getSelectedValuesString();

    if (doSearch) {
      table.search();
    }
  };
  if (table.selectable && table.selectable.has_metadata) {
    table.registerMetadataFields = () => {
      table.selectionElement.findAll("[data-metadata]").forEach((m) => {
        m.oninput = () => {
          table.selectionChange(false);
        };
        m.onchange = () => {
          table.selectionChange(false);
        };
      });
    };
  }
}

function getSafePageIndex(i, pageCount) {
  if (i < 1) return 1;
  if (i > pageCount) return pageCount;
  return i;
}

function renderPagination(
  paginationElement,
  currPage,
  pageCount,
  callback,
  options = {}
) {
  currPage = getSafePageIndex(currPage, pageCount);

  var output = "";
  var range = 4;
  var mobile = window.innerWidth < 760;
  if (mobile) range = 1;
  var center = currPage;
  if (currPage < range + 1) center = range + 1;
  if (currPage > pageCount - range) center = pageCount - range;
  for (i = 1; i <= pageCount; i++) {
    if (
      i == 1 ||
      i == pageCount ||
      (i >= center - range && i <= center + range)
    ) {
      if (i == center - range && i > 2) {
        output += " ... ";
      }
      output += `<div data-index='${i}' class='pagination_item ${
        i == currPage ? " current" : ``
      }'>${i}</div>`;
      if (i == center + range && i < pageCount - 1) output += " ... ";
    }
  }
  if (pageCount > 20 && !mobile && options.allow_my_page) {
    output += `<span class='setMyPage'><input class='myPage' type='number' placeholder='Nr strony (1-${pageCount})'></span>`;
  }

  paginationElement.setContent(output);
  paginationElement
    .findAll(".pagination_item:not(.current)")
    .forEach((elem) => {
      var i = parseInt(elem.getAttribute("data-index"));
      i = getSafePageIndex(i, pageCount);
      elem.addEventListener("click", () => {
        callback(i);
      });
    });
  paginationElement.findAll(".myPage").forEach((elem) => {
    elem.addEventListener("keypress", (event) => {
      if (event.code == "Enter") {
        var i = parseInt(elem.value);
        i = getSafePageIndex(i, pageCount);
        callback(i);
      }
    });
  });
}

var tableRearrange = {};

window.addEventListener("dragstart", (event) => {
  if (event.target.tagName == "TR") {
    tableRearrange.source = event.target;
    tableRearrange.placeFrom = tableRearrange.source.find(".kolejnosc").value;
  }
  if (tableRearrange.source && tableRearrange.source.classList) {
    tableRearrange.source.classList.add("grabbed");
  }
});

window.addEventListener("dragend", () => {
  if (tableRearrange.source) {
    var input = tableRearrange.source.find(".kolejnosc");
    var wasIndex = input.value;
    input.value = tableRearrange.placeTo;
    rearrange(input, wasIndex);
  }
  removeClasses("grabbed");
  $$(".tableRearrange").forEach((e) => {
    removeNode(e);
  });
  tableRearrange.element = null;
});

function rearrange(input, wasIndex = 0) {
  var datatable = window[input.getAttribute("data-table")];
  var rowId = input.getAttribute("data-index");
  var toIndex = input.value;
  if (toIndex < 1) toIndex = 1;

  if (toIndex === wasIndex) return;

  var table = datatable.db_table;
  var primary = datatable.primary;
  var itemId = datatable.results[rowId][primary];

  var params = {
    table: table,
    primary: primary,
    itemId: itemId,
    toIndex: toIndex,
  };

  var required = {};
  if (datatable.tree_view) {
    required.parent_id = datatable.getParentId();
  } else if (datatable.requiredParam) {
    var x = datatable.requiredParam();
    if (x || x === 0) {
      required[requiredFilterTables[datatable.db_table]] = x;
    }
  }
  params["params"] = JSON.stringify(required);

  xhr({
    url: "/admin/rearrange_table",
    params: params,
    success: () => {
      showNotification("Zapisano zmianę kolejności");
      datatable.search();
    },
  });
}

window.addEventListener("dragover", (event) => {
  if (!event.target) return;
  var tr = findParentByTagName(event.target, "TR");
  if (!tr) return;

  if (!tableRearrange.element) {
    tableRearrange.element = document.createElement("DIV");
    tableRearrange.element.classList.add("rearrange-splitter");
    tableRearrange.element.style.background = "#5557";
    tableRearrange.element.style.position = "absolute";
    document.body.appendChild(tableRearrange.element);
  }

  if (tr != tableRearrange.target) {
    tableRearrange.target = tr;
  }

  if (tableRearrange.target) {
    var pos = position(tableRearrange.target);
    var rect = tableRearrange.target.getBoundingClientRect();
    var h = 10;

    var isAfter = event.offsetY > rect.height / 2;

    tableRearrange.element.style.left = pos.left + "px";
    tableRearrange.element.style.top =
      pos.top - h / 2 + isAfter * rect.height + "px";
    tableRearrange.element.style.width = rect.width + "px";
    tableRearrange.element.style.height = h + "px";
    tableRearrange.element.classList.add("tableRearrange");
    tableRearrange.placeTo =
      +tableRearrange.target.find(".kolejnosc").value + isAfter * 1;
    if (tableRearrange.placeTo > tableRearrange.placeFrom)
      tableRearrange.placeTo--;
  }
});

function getPublishedDefinition() {
  return {
    title: "Widoczność",
    width: "105px",
    render: (r) => {
      return renderIsPublished(r);
    },
    escape: false,
  };
}

function renderIsPublished(row) {
  var label = "";
  var color = "";
  if (row.published == 1) {
    label = `<i class="fas fa-eye"></i>`;
    color = "#2a2";
  } else {
    label = `<i class="fas fa-eye-slash"></i>`;
    color = "#a22";
  }
  return `<div class='rect btn' style='color:${color}; border: 1px solid ${color}; text-align: center; width: 45px' onclick='setPublish(this,${
    1 - row.published
  })'>${label}</div>`;
}

function setPublish(obj, published) {
  obj = $(obj);
  var tableElement = findParentByClassName(obj, ["datatable-wrapper"]);
  if (!tableElement) return;
  var tablename = tableElement.getAttribute("data-table-name");
  if (!tablename) return;
  var table = window[tablename];
  if (!table || !table.primary || !table.db_table) return;
  var rowElement = findParentByTagName(obj, "TR");
  if (!rowElement) return;
  var primary_id = rowElement.getAttribute("data-primary");
  if (!primary_id) return;
  //console.log(table.primary,table.db_table,primary_id);
  xhr({
    url: "/admin/set_publish",
    params: {
      table: table.db_table,
      primary: table.primary,
      primary_id: primary_id,
      published: published,
    },
    success: () => {
      showNotification(
        `<i class="fas fa-check"></i> Pomyślnie ustawiono element jako <b>${
          published ? "publiczny" : "ukryty"
        }</b>`
      );
      if (obj.findParentByClassName("selectedRows")) {
        table.createList();
      } else {
        table.search();
      }
    },
  });
}
