/* js[global] */
function createDatatable(datatable) {
  // REQUIRED name, definition | renderRow, url, primary, db_table
  // OPTIONAL controls OR controlsRight, width, nosearch, rowCount (10,20,50), onSearch, onCreate, bulk_edit
  // sortable (requires primary, db_table) IMPORTANT - not the same as column sortable
  // selectable: {data,output},
  // has_metadata: (boolean, enables outputting metadata from additional row inputs)
  // tree_view
  // lang: {subject, main_category}
  //
  // COLUMNS:
  // sortable
  // searchable
  // ?renderSearch
  window[datatable.name] = datatable;
  datatable.awaitId = null;
  datatable.currPage = 1;
  datatable.pageCount = 0;
  datatable.request = null;
  datatable.results = [];
  datatable.filters = [];
  datatable.sort = null;

  if (!datatable.lang) datatable.lang = {};
  datatable.lang.subject = nonull(datatable.lang.subject, "wyników");

  datatable.target = $("." + datatable.name);

  datatable.target.classList.add("datatable-wrapper");
  datatable.target.setAttribute("data-datatable-name", datatable.name);

  if (datatable.selectable) {
    datatable.selection = [];
    datatable.singleselect = datatable.selectable.singleselect;
    if (datatable.selectable.has_metadata) {
      datatable.metadata = {};
    }

    datatable.setSelectedValuesString = (v) => {
      // Works also with json to make it easier to use
      var values = typeof v == "string" ? JSON.parse(v) : v;
      var selection = [];

      // If someone didn't provide array
      if (datatable.singleselect) {
        if (!Array.isArray(values)) {
          values = [values];
        }
      }

      if (datatable.selectable.has_metadata) {
        var metadata = [];
        try {
          Object.entries(values).forEach(([row_id, row_metadata]) => {
            selection.push(parseInt(row_id));
            metadata[parseInt(row_id)] = row_metadata;
          });
        } catch (e) {
          console.log(e);
        }

        datatable.metadata = metadata;
      } else {
        // no metadata, raw table
        try {
          for (val of values) {
            if (val) {
              selection.push(parseInt(val));
            }
          }
        } catch (e) {}
      }
      datatable.selection = selection;

      datatable.selectionValueElement.value = values;

      datatable.createList();
    };
    datatable.getSelectedValuesString = () => {
      return JSON.stringify(datatable.selection);
    };
    datatable.getSelectedValuesAllString = () => {
      // for metadata
      return JSON.stringify(datatable.metadata);
    };
  }
  if (!datatable.selection) {
    datatable.selection = [];
  }

  if (datatable.bulk_edit) {
    datatable.definition = [
      {
        title: `<label class="checkbox-wrapper">
          <input type="checkbox" class="bulk_edit_checkbox" onchange="${datatable.name}.bulkEditSelectAll()">
          <div class="checkbox standalone"></div>
        </label>`,
        width: "36px",
        render: (r) => {
          return `<label class="checkbox-wrapper">
            <input type="checkbox" class="bulk_edit_checkbox" onchange="${datatable.name}.bulkEditChange()">
            <div class="checkbox standalone"></div>
          </label>`;
        },
        escape: false,
      },
      ...datatable.definition,
    ];

    datatable.bulkEditChange = () => {
      console.log(123);
    };
  }

  if (datatable.sortable) {
    if (!datatable.primary)
      console.error(`missing primary key in ${datatable.name}`);
    if (!datatable.db_table)
      console.error(`missing db_table name in ${datatable.name}`);
    datatable.definition = [
      {
        title: "Kolejność",
        width: "85px",
        render: (r, i) => {
          return `<i class="fas fa-arrows-alt-v" style="cursor:grab"></i> <input type="number" class="kolejnosc" value="${r.kolejnosc}" data-table='${datatable.name}' data-index='${i}' onchange="rearrange(this)">`;
        },
        escape: false,
      },
      ...datatable.definition,
    ];
  }

  if (datatable.tree_view) {
    datatable.lang.main_category = nonull(
      datatable.lang.main_category,
      "Kategoria główna"
    );

    datatable.breadcrumb = [
      {
        title:
          `<i class="fas fa-home" style="margin-right: 4px;"></i>` +
          datatable.lang.main_category,
        category_id: -1,
      },
    ];

    datatable.controls += `
        <div style="width:100%">
          <div class="breadcrumb"></div>
          <div class="btn primary" onclick="${datatable.name}.showEditCategory(this,null,true)">Dodaj <i class="fa fa-plus"></i></div>
        </div>
      `;
  }

  var justTable = "";

  if (datatable.controls) {
    justTable += `<div class="flexbar">${datatable.controls}</div>`;
  }

  justTable += `<div class="flexbar" style="align-items: baseline;">
        <span class="total-rows"></span>
        <span class="space-right">&nbsp;${datatable.lang.subject}</span>
        <select data-param="rowCount" class="field inline">
            <option value='10' ${
              datatable.rowCount == 10 ? "selected" : ""
            }>10</option>
            <option value='20' ${
              !datatable.rowCount || datatable.rowCount == 20 ? "selected" : ""
            }>20</option>
            <option value='50' ${
              datatable.rowCount == 50 ? "selected" : ""
            }>50</option>
        </select>
        <span class="space-right big no-space-mobile">&nbsp;&nbsp;na stronę</span>
        <div class="pagination"></div>
        ${nonull(datatable.controlsRight)}
      </div>`;

  var headersHTML = "<tr>";
  var columnStyles = [];

  if (datatable.selectable) {
    headersHTML += `<th style="width:35px"></th>`;
  }

  var sumWidthPercentages = 0;
  for (def of datatable.definition) {
    if (def.width.indexOf("%") != -1) {
      sumWidthPercentages += parseFloat(def.width);
    }
  }
  var scalePercentages = 100 / sumWidthPercentages;
  for (def of datatable.definition) {
    if (def.width.indexOf("%") != -1) {
      def.width = Math.round(parseFloat(def.width) * scalePercentages) + "%";
    }
  }

  var def_id = -1;
  for (header of datatable.definition) {
    def_id++;
    var additional_html = "";
    if (header.sortable) {
      var sortBy = header.sortable === true ? header.field : header.sortable;
      additional_html += ` <i class="btn primary fas fa-sort datatable-sort-btn" onclick="datatableSort(this,'${sortBy}')" data-tooltip="Sortuj malejąco / rosnąco"></i>&nbsp;`;
    }
    if (header.searchable) {
      additional_html += `<i class="btn primary fas fa-search datatable-search-btn" data-field="${header.field}" onclick="datatableFilter(this,'${def_id}')" data-tooltip="Filtruj wyniki"></i>`;
    }

    var style = "";
    if (header.width) style += `style='width:${header.width}'`;
    if (header.className) style += `class='${header.className}'`;

    if (additional_html) {
      additional_html = `<span style='display:inline-block;margin-bottom: -3px;'>${additional_html}</span>`;
    }

    headersHTML += `<th ${style}><span>${header.title} </span>${additional_html}</th>`;
    columnStyles.push(style);
  }
  headersHTML += "</tr>";

  datatable.headersHTML = headersHTML;
  datatable.columnStyles = columnStyles;

  justTable += `
    <div class="table-wrapper">
      <table class='datatable'>
        <thead>${datatable.headersHTML}</thead>
        <tbody></tbody>
      </table>
    </div>
    `;

  if (datatable.selectable) {
    datatable.target.insertAdjacentHTML(
      "afterbegin",
      `
          <div class="selected_rows">${justTable}</div>
          <div class="showBtn expand_y">
            <div class="btn secondary fill" onclick="${
              datatable.name
            }.toggleSearchVisibility(true)">Wyszukaj <i class="fas fa-plus"></i> </div>
          </div>
          <input type="hidden" class="table-selection-value" name="${
            datatable.selectable.output
              ? datatable.selectable.output
              : datatable.primary
          }" ${datatable.selectable.validate ? `data-validate` : ""}>
          <div class="table-search-wrapper ${
            datatable.selectable ? `expand_y hidden animate_hidden` : ""
          }">
            <div class="table-search-container">
              <div class="btn secondary fill hideBtn" onclick="${
                datatable.name
              }.toggleSearchVisibility(false)">Ukryj wyszukiwarkę <i class="fas fa-minus"></i> </div>
              ${justTable}
            </div>
          </div>
        `
    );
  } else {
    datatable.target.insertAdjacentHTML(
      "afterbegin",
      `<div class="table-search-wrapper">${justTable}</div>`
    );
  }

  if (datatable.onCreate) datatable.onCreate();

  datatable.searchElement = datatable.target.find(".search-wrapper");
  datatable.tableSearchElement = datatable.target.find(".table-search-wrapper");
  datatable.tableBodyElement = datatable.tableSearchElement.find("tbody");
  datatable.totalRowsElement = datatable.target.find(".total-rows");
  datatable.paginationElement = datatable.target.find(".pagination");
  datatable.selectionBodyElement = datatable.target.find(
    ".selected_rows tbody"
  );
  datatable.selectionValueElement = datatable.target.find(
    ".table-selection-value"
  );

  if (datatable.tree_view) {
    datatable.breadcrumbElement = datatable.target.find(".breadcrumb");

    datatable.getParentId = () => {
      if (datatable.breadcrumb.length == 0) return -1;
      return datatable.breadcrumb[datatable.breadcrumb.length - 1].category_id;
    };
    datatable.backToCategory = (category_id = 0) => {
      var steps = null;
      for (i = 0; i < datatable.breadcrumb.length; i++) {
        if (datatable.breadcrumb[i].category_id == category_id) {
          steps = datatable.breadcrumb.length - 1 - i;
          break;
        }
      }
      datatable.categoryStepBack(steps);
    };
    datatable.categoryStepBack = (steps) => {
      if (steps > 0) {
        for (i = 0; i < steps; i++) {
          if (datatable.breadcrumb.length > 0) {
            datatable.breadcrumb.pop();
          }
        }
        datatable.search();
      }
    };
    datatable.openCategory = (row_id) => {
      var row = datatable.results[row_id];
      datatable.breadcrumb.push({
        title: row.title,
        category_id: row.category_id,
      });
      datatable.search();
    };
    datatable.showEditCategory = (btn = null, row_id = null, isNew = false) => {
      var form = datatable.tree_view.form;

      var loadCategoryFormCallback = (data) => {
        datatable.tree_view.form_data = data;
        datatable.tree_view.loadCategoryForm(form, data, isNew);

        var params = {};
        if (!isNew) {
          params.disable_with_children = [datatable.category_id];
        }

        setCategoryPickerValues(
          $(`#${form} [data-category-picker-name="parent_id"]`),
          data.parent_id,
          params
        );

        // setModalInitialState(form);
      };

      showModal(form, { source: btn });

      if (isNew) {
        loadCategoryFormCallback({
          parent_id: datatable.getParentId(),
          category_id: -1,
        });
      } else {
        var category_id = 0;
        if (row_id === null) {
          category_id = datatable.getParentId();
        } else {
          var row = datatable.results[row_id];
          category_id = row.category_id;
        }

        var formParams = nonull(datatable.tree_view.formParams, {});
        formParams.category_id = category_id;

        xhr({
          url: datatable.url,
          params: formParams,
          success: (res) => {
            loadCategoryFormCallback(res.results[0]);
          },
        });
      }
    };
    datatable.postSaveCategory = (params, remove) => {
      var parentChanged =
        datatable.tree_view.form_data.parent_id != params.parent_id;
      var isCurrent = datatable.getParentId() == params.category_id;
      if ((remove || parentChanged) && isCurrent) {
        datatable.categoryStepBack(1);
      } else {
        if (isCurrent) {
          datatable.breadcrumb[datatable.breadcrumb.length - 1].title =
            params.title;
        }
        datatable.search();
      }
    };
  }

  if (datatable.width) {
    datatable.target.style.maxWidth = datatable.width + "px";
    datatable.target.style.marginLeft = "auto";
    datatable.target.style.marginRight = "auto";
  }

  datatable.awaitSearch = function () {
    clearTimeout(datatable.awaitId);
    datatable.awaitId = setTimeout(function () {
      datatable.search();
    }, 400);
  };

  $$(`.${datatable.name} [data-param]`).forEach((e) => {
    const onParamsChange = () => {
      if (e.tagName == "INPUT") datatable.awaitSearch();
      else datatable.search();
    };
    e.addEventListener("input", function () {
      onParamsChange();
    });
    e.addEventListener("change", function () {
      onParamsChange();
    });
  });

  datatable.search = (callback = null, createList = false) => {
    clearTimeout(datatable.awaitId);

    if (datatable.request) datatable.request.abort();

    if (datatable.tree_view) {
      // breadcrumb update
      var out = "";
      var index = -1;
      for (let category of datatable.breadcrumb) {
        index++;
        if (index > 0) out += ` <i class="fas fa-chevron-right"></i> `;
        out += `<div class="${
          index < datatable.breadcrumb.length - 1 ? "btn secondary" : "current"
        }" onclick="${datatable.name}.backToCategory(${
          category.category_id
        })">${category.title}</div>`;
      }
      if (datatable.breadcrumb.length > 1)
        out += ` <div class="btn primary" onclick="${datatable.name}.showEditCategory(this,null)" style="margin-left:10px">Edytuj <i class="fa fa-cog"></i></div>`;
      datatable.breadcrumbElement.innerHTML = out;
    }

    var params = {
      filters: [],
    };
    Object.assign(params.filters, datatable.filters);

    if (createList) {
      if (datatable.selection) {
        params.filters.push({
          type: "=",
          value: datatable.selection,
          field: datatable.primary,
        });
      }
    } else {
      if (datatable.params) {
        Object.assign(params, datatable.params);
      }
      if (datatable.requiredParam) {
        var x = datatable.requiredParam();
        if (x || x === 0) {
          params[requiredFilterTables[datatable.db_table]] = x;
        }
      }
      $$(`.${datatable.name} [data-param]`).forEach((e) => {
        if (e.findParentByClassName("hidden", "datatable-wrapper")) {
          return;
        }
        params[e.getAttribute("data-param")] = e.getValue();
      });
      if (datatable.selectable) {
        // TODO get values from metadata or regular array
        params.filters.push({
          type: "!=",
          value: datatable.selection,
          field: datatable.primary,
        });
      }
      if (datatable.tree_view) {
        params.parent_id = datatable.getParentId();
      }
    }

    if (datatable.sort) {
      params.sort = datatable.sort;
    } else {
      delete params.sort;
    }

    var paramsJson = JSON.stringify(params);
    if (datatable.lastParamsJson && datatable.lastParamsJson != paramsJson) {
      datatable.currPage = 1;
    }
    datatable.lastParamsJson = paramsJson;

    var canOrder = datatable.sortable;
    if (canOrder) {
      var needsRequired = requiredFilterTables[datatable.db_table];
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

      datatable.target.classList.toggle("noOrder", !canOrder);
    }

    datatable.request = xhr({
      url: datatable.url,
      params: {
        ...params,
        pageNumber: datatable.currPage,
      },
      success: (res) => {
        if (createList) {
          datatable.selectionPageCount = res.pageCount;
          datatable.selectionResults = res.results;
        } else {
          datatable.pageCount = res.pageCount;
          datatable.results = res.results;
        }
        var output = "";

        output = "";
        for (i = 0; i < res.results.length; i++) {
          var row = res.results[i];
          var attr = "";
          if (canOrder) attr = "draggable='true'";
          output += `<tr data-index='${i}' ${attr} ${
            datatable.primary ? `data-primary=${row[datatable.primary]}` : ""
          }>`;

          if (datatable.renderRow) {
            var cell = datatable.renderRow(row, i);
            output += `<td>${cell}</td>`;
          } else {
            if (datatable.selectable) {
              if (createList) {
                output += `<td style="width:33px"> <i class="fas fa-minus-circle" onclick="${
                  datatable.name
                }.removeRow(${row[datatable.primary]})"></i> </td>`;
              } else {
                output += `<td style="width:33px"> <i class="fas fa-plus-circle" onclick="${
                  datatable.name
                }.addRow(${row[datatable.primary]})"></i> </td>`;
              }
            }
            for (x = 0; x < datatable.definition.length; x++) {
              var definition = datatable.definition[x];
              var cell_html = "";
              if (definition.render) {
                cell_html = definition.render(row, i, datatable);
              } else if (definition.field) {
                cell_html = row[definition.field];
              }
              if (
                !definition.hasOwnProperty("escape") ||
                definition.escape === true
              ) {
                cell_html = escapeHTML(cell_html);
              }
              output += `<td ${datatable.columnStyles[x]}>${cell_html}</td>`;
            }
          }
          output += "</tr>";
        }

        output += `<tr><td class="no-results" colspan="${
          datatable.definition.length + (datatable.selectable ? 1 : 0)
        }" style="${res.results.length !== 0 ? "display:none" : ""}">
            Brak ${createList ? "powiązanych " : ""}${
          datatable.lang.subject
        } <i class="btn secondary fas fa-sync-alt" onclick='${
          datatable.name
        }.search()' style="width: 24px;height: 24px;display: inline-flex;justify-content: center;align-items: center;"></i>
          </td></tr>`;

        if (createList) {
          datatable.selectionBodyElement.setContent(output);
        } else {
          renderPagination(
            datatable.paginationElement,
            datatable.currPage,
            datatable.pageCount,
            (i) => {
              datatable.currPage = i;
              datatable.search();
            },
            { allow_my_page: true }
          );
          datatable.totalRowsElement.setContent(res.totalRows);
          datatable.tableBodyElement.setContent(output);
        }

        datatable.target.findAll("td").forEach((e) => {
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

        if (datatable.selectable && datatable.selectable.has_metadata) {
          datatable.registerMetadataFields();
        }

        if (callback) callback(res); // custom
        if (datatable.onSearch) datatable.onSearch(res); // default
      },
    });
  };

  datatable.initialSearch = () => {
    if (
      !datatable.hasOwnProperty("nosearch") ||
      datatable.nosearch === false ||
      datatable.selectable
    ) {
      datatable.search();
    }
  };
  datatable.createList = (firstLoad) => {
    if (firstLoad && datatable.nosearch === true) {
      return;
    }

    datatable.search(() => {
      datatable.initialSearch();

      if (datatable.selectable && datatable.selectable.has_metadata) {
        try {
          Object.entries(datatable.metadata).forEach(([key, value]) => {
            var row = datatable.selectionBodyElement.find(
              `[data-primary="${key}"]`
            );
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

      datatable.selectionChange(false);
    }, true);
  };
  if (datatable.selectable) {
    datatable.createList(true);
  } else {
    datatable.initialSearch();
  }

  datatable.toggleSearchVisibility = (visible) => {
    expand($(`.${datatable.name} .showBtn`), !visible);
    expand($(`.${datatable.name} .table-search-wrapper`), visible);
  };

  datatable.removeRow = (data_id) => {
    const index = datatable.selection.indexOf(data_id);
    if (index !== -1) {
      datatable.selection.splice(index, 1);
    } else {
      return;
    }

    const index2 = datatable.selectionResults
      .map((e) => {
        return e[datatable.primary];
      })
      .indexOf(data_id);
    if (index2 !== -1) {
      datatable.selectionResults.splice(index2, 1);
    }

    removeNode(datatable.target.find(`[data-primary='${data_id}']`));
    datatable.selectionChange(false);
  };
  datatable.addRow = (data_id) => {
    if (datatable.singleselect && datatable.selection.length > 0) {
      datatable.removeRow(datatable.selection[0]);
    }
    if (datatable.singleselect || datatable.selection.indexOf(data_id) === -1) {
      datatable.selectionResults.push(
        datatable.results.find((e) => {
          return e[datatable.primary] == data_id;
        })
      );
      datatable.selection.push(data_id);
      var x = datatable.target.find(`[data-primary='${data_id}']`);
      datatable.selectionBodyElement.appendChild(x);
      var d = x.find(".fa-plus-circle");
      d.outerHTML = d.outerHTML
        .replace("plus", "minus")
        .replace("addRow", "removeRow");
      datatable.selectionChange();
    }
  };
  datatable.selectionChange = (doSearch = true) => {
    if (datatable.selectable.has_metadata) {
      datatable.registerMetadataFields();
    }

    var e = datatable.selectionBodyElement.find(".no-results");
    if (e) {
      e.style.display = datatable.selectionResults.length !== 0 ? "none" : "";
    }
    var e = datatable.target.find(".table-search-container .no-results");
    if (e) {
      //e.style.display = datatable.results.length !== 0 ? "none" : "";
    }

    if (datatable.selectable.has_metadata) {
      var metadata = {};
      datatable.selectionBodyElement
        .findAll("tr[data-primary]")
        .forEach((e) => {
          var row = {};
          e.findAll("[data-metadata]").forEach((m) => {
            row[m.getAttribute("data-metadata")] = m.getValue();
          });
          metadata[parseInt(e.getAttribute("data-primary"))] = row;
        });
      datatable.metadata = metadata;
    }

    var selection = [];
    datatable.selectionBodyElement.findAll("[data-primary]").forEach((e) => {
      selection.push(parseInt(e.getAttribute("data-primary")));
    });

    datatable.selection = selection;

    datatable.selectionValueElement.value = datatable.selectable.has_metadata
      ? datatable.getSelectedValuesAllString()
      : datatable.getSelectedValuesString();

    if (doSearch) {
      datatable.search();
    }
  };
  if (datatable.selectable && datatable.selectable.has_metadata) {
    datatable.registerMetadataFields = () => {
      datatable.selectionBodyElement.findAll("[data-metadata]").forEach((m) => {
        m.oninput = () => {
          datatable.selectionChange(false);
        };
        m.onchange = () => {
          datatable.selectionChange(false);
        };
      });
    };
  }

  /*datatable.tableBodyElement.addEventListener("dblclick", function (e) {
    var td = $(e.target).findParentByTagName("td");
    if (!td) {
      return;
    }

    //console.log(123, td);
    var val = td.innerHTML;
    td.setContent(`<input type="text" class="field">`);
    td.find(`.field`).setValue(val);
  });*/
}

function getSafePageIndex(i, pageCount) {
  if (i < 1) return 1;
  if (i > pageCount) return pageCount;
  return i;
}

// rearrange start
var datatableRearrange = {};

window.addEventListener("dragstart", (event) => {
  if (event.target.tagName == "TR") {
    datatableRearrange.source = event.target;
    datatableRearrange.placeFrom = datatableRearrange.source.find(
      ".kolejnosc"
    ).value;
  }
  if (datatableRearrange.source && datatableRearrange.source.classList) {
    datatableRearrange.source.classList.add("grabbed");
  }
});

window.addEventListener("dragend", () => {
  if (datatableRearrange.source) {
    var input = datatableRearrange.source.find(".kolejnosc");
    var wasIndex = input.value;
    input.value = datatableRearrange.placeTo;
    rearrange(input, wasIndex);
  }
  removeClasses("grabbed");
  $$(".tableRearrange").forEach((e) => {
    removeNode(e);
  });
  datatableRearrange.element = null;
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

  if (!datatableRearrange.element) {
    datatableRearrange.element = document.createElement("DIV");
    datatableRearrange.element.classList.add("rearrange-splitter");
    datatableRearrange.element.style.background = "#5557";
    datatableRearrange.element.style.position = "absolute";
    document.body.appendChild(datatableRearrange.element);
  }

  if (tr != datatableRearrange.target) {
    datatableRearrange.target = tr;
  }

  if (datatableRearrange.target) {
    var pos = position(datatableRearrange.target);
    var rect = datatableRearrange.target.getBoundingClientRect();
    var h = 10;

    var isAfter = event.offsetY > rect.height / 2;

    datatableRearrange.element.style.left = pos.left + "px";
    datatableRearrange.element.style.top =
      pos.top - h / 2 + isAfter * rect.height + "px";
    datatableRearrange.element.style.width = rect.width + "px";
    datatableRearrange.element.style.height = h + "px";
    datatableRearrange.element.classList.add("tableRearrange");
    datatableRearrange.placeTo =
      +datatableRearrange.target.find(".kolejnosc").value + isAfter * 1;
    if (datatableRearrange.placeTo > datatableRearrange.placeFrom)
      datatableRearrange.placeTo--;
  }
});

// rearrange end

// published start

function getPublishedDefinition() {
  return {
    title: "Widoczność",
    width: "135px",
    render: (r) => {
      return renderIsPublished(r);
    },
    escape: false,
    field: "p.published",
    searchable: "select",
    select_single: true,
    select_values: [1, 0],
    select_labels: ["Tak", "Nie"],
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
  var tableElement = obj.findParentByClassName("datatable-wrapper");
  if (!tableElement) return;
  var tablename = tableElement.getAttribute("data-datatable-name");
  if (!tablename) return;
  var datatable = window[tablename];
  if (!datatable || !datatable.primary || !datatable.db_table) return;
  var rowElement = findParentByTagName(obj, "TR");
  if (!rowElement) return;
  var primary_id = rowElement.getAttribute("data-primary");
  if (!primary_id) return;
  //console.log(table.primary,table.db_table,primary_id);
  xhr({
    url: "/admin/set_publish",
    params: {
      table: datatable.db_table,
      primary: datatable.primary,
      primary_id: primary_id,
      published: published,
    },
    success: () => {
      showNotification(
        `<i class="fas fa-check"></i> Pomyślnie ustawiono element jako <b>${
          published ? "publiczny" : "ukryty"
        }</b>`
      );
      if (obj.findParentByClassName("selected_rows")) {
        datatable.createList();
      } else {
        datatable.search();
      }
    },
  });
}

// published end

function datatableSort(btn, column) {
  var datatable = getParentDatatable(btn);

  if (!datatable) {
    return;
  }

  var was_sort = 0;
  if (btn.classList.contains("fa-arrow-up")) {
    was_sort = 1;
  } else if (btn.classList.contains("fa-arrow-down")) {
    was_sort = -1;
  }

  datatable.target.findAll(".datatable-sort-btn").forEach((e) => {
    e.classList.remove("fa-sort");
    e.classList.remove("fa-arrow-up");
    e.classList.remove("fa-arrow-down");

    e.classList.remove("primary");
    e.classList.remove("secondary");

    if (e !== btn) {
      e.classList.add("fa-sort");
      e.classList.add("primary");
    }
  });

  var sort = 0;
  if (was_sort === 0) {
    sort = -1;
  } else if (was_sort === -1) {
    sort = 1;
  } else if (was_sort === 1) {
    sort = 0;
  }

  if (sort === 0) {
    btn.classList.add("fa-sort");
    btn.classList.add("primary");
  } else if (sort === 1) {
    btn.classList.add("fa-arrow-up");
    btn.classList.add("secondary");
  } else if (sort === -1) {
    btn.classList.add("fa-arrow-down");
    btn.classList.add("secondary");
  }

  if (sort !== 0) {
    datatable.sort = (sort === 1 ? "+" : "-") + column;
  } else {
    datatable.sort = null;
  }
  datatable.search();
}

function datatableFilter(btn, column_id) {
  filtersVisibility();

  var datatable = getParentDatatable(btn);

  if (!datatable) {
    return;
  }

  var col_def = datatable.definition[column_id];
  var filters = col_def.searchable;

  var menu_header = "";
  var menu_body = "";

  if (filters == "text") {
    menu_header += `Wpisz frazę`;
    menu_body += `<input type="text" class="field margin_bottom">
      <label class='checkbox-wrapper block margin_bottom' text-align:center;color:#555'>
        <input type='checkbox' name='exact'><div class='checkbox'></div> Dopasuj całą frazę
      </label>
    `;
  } else if (filters == "date") {
    menu_header += `Wybierz datę`;
    menu_body += `
      <span class="field-title first">Typ wyszukiwania</span>
      <select class="field margin_bottom date_type" onchange="dateTypeChanged(this)">
        <option value='='>Dokładna data</option>
        <option value='>'>Data od</option>
        <option value='<'>Data do</option>
        <option value='<>'>Przedział</option>
      </select>
      <div class="singledate_wrapper">
        <span class="field-title">Data</span>
        <input type="text" class="field default_datepicker margin_bottom" data-orientation="auto bottom" style='width: 254px;'>
      </div>

      <div class="margin_bottom date_range_picker hidden" style='width: 254px;display:flex;align-items:center;'>
        <div>
          <span class="field-title">Od</span>
          <input type="text" class="field start" data-orientation="left bottom">
        </div>
        <span style="font-weight:600;margin:3px">-</span>
        <div>
          <span class="field-title">Do</span>
          <input type="text" class="field end" data-orientation="right bottom">
        </div>
      </div>
    `;
  } else if (filters == "select") {
    menu_header += `Zaznacz pola`;
    for (i = 0; i < col_def.select_values.length; i++) {
      var val = col_def.select_values[i];
      var label = col_def.select_labels ? col_def.select_labels[i] : val;
      var select_single = col_def.select_single ? "true" : "false";

      menu_body += `<label class='checkbox-wrapper block'>
        <input type='checkbox' value='${val}' onchange='filterCheckboxChanged(this,${select_single})'><div class='checkbox'></div> ${label}
      </label>`;
    }
  }

  var menu_footer = `<div class='filter_menu_footer'>
    <button class="btn primary fill" style='margin-right:5px' onclick='setFilters(${datatable.name},${column_id})'>Szukaj <i class="fas fa-check"></i></button>
    <button class="btn secondary fill" onclick='removeFilters(${datatable.name},${column_id})'>Wyczyść <i class="fas fa-times"></i></button>
  </div>`;

  if (col_def.renderSearch) {
    menu_body = col_def.renderSearch(menu_body);
  }

  if (IS_MOBILE) {
    setModalTitle("#filter_menu", "Filtruj " + col_def.title.toLowerCase());
    filter_menu.setContent(
      `<span class="field-title">${menu_header}</span>${menu_body}${menu_footer}`
    );
    showModal("filter_menu", {
      source: btn,
    });
  } else {
    if (menu_header) {
      menu_html = `<span class='field-title header first'>${menu_header}</span>${menu_body}${menu_footer}`;
    }
    filter_menu.setContent(menu_html);
    filter_menu.style.display = "block";

    var nonstatic_parent = datatable.target.findNonStaticParent();
    var offset_y =
      nonstatic_parent === document.body ? 0 : nonstatic_parent.scrollTop;

    nonstatic_parent.appendChild(filter_menu);

    var btn_rect = btn.getBoundingClientRect();
    var filter_rect = filter_menu.getBoundingClientRect();
    var nonstatic_rect = nonstatic_parent.getBoundingClientRect();

    filter_menu.style.left =
      clamp(
        30,
        btn_rect.left +
          (btn_rect.width - filter_rect.width) / 2 -
          nonstatic_rect.left,
        nonstatic_rect.width - filter_rect.width - 30
      ) + "px";

    filter_menu.style.top =
      clamp(
        30,
        btn_rect.top + btn_rect.height - nonstatic_rect.top + offset_y,
        nonull(nonstatic_parent.scrollHeight, nonstatic_rect.height) -
          filter_rect.height -
          30
      ) + "px";

    btn.findParentByTagName("th").classList.add("datatable-column-highlighted");
  }

  registerDatepickers();

  var date_range_picker = $(".date_range_picker");
  if (date_range_picker) {
    createDateRangePicker(date_range_picker);
  }

  // set values in the filter form

  var filter_value = null;

  var current_filter = datatable.filters.find((e) => {
    return e.field == col_def.field;
  });

  if (current_filter) {
    filter_value = current_filter.value;
  }

  if (filter_value !== null) {
    if (col_def.searchable == "select") {
      filter_menu.findAll(`input[type='checkbox']`).forEach((e) => {
        if (filter_value.indexOf(e.value) != -1) {
          e.setValue(1);
        }
      });
    } else if (col_def.searchable == "date") {
      filter_menu.find(".date_type").setValue(current_filter.type);
      if (current_filter.type == "<>") {
        $(".date_range_picker .start").setValue(filter_value[0]);
        $(".date_range_picker .end").setValue(filter_value[1]);
      } else {
        $(".default_datepicker").setValue(filter_value);
      }
    } else {
      var exact = current_filter.type != "%";
      if (!exact && filter_value.length >= 2) {
        filter_value = filter_value.substring(1, filter_value.length - 1);
      }
      filter_menu.find(`[name='exact']`).setValue(exact);
      filter_menu.find(`.field`).setValue(filter_value);
    }
  }
}

function filterCheckboxChanged(checkbox, select_single) {
  if (select_single) {
    filter_menu.findAll(`input[type="checkbox"]`).forEach((e) => {
      if (e != checkbox) {
        e.setValue(0, true);
      }
    });
  }
}

function dateTypeChanged(select) {
  var isRange = false;
  if (select.getValue() == "<>") {
    isRange = true;
  }

  filter_menu.find(".singledate_wrapper").classList.toggle("hidden", isRange);
  filter_menu.find(".date_range_picker").classList.toggle("hidden", !isRange);
}

window.addEventListener("DOMContentLoaded", () => {
  if (IS_MOBILE) {
    registerModalContent(`
        <div id="filter_menu">
            <div class="modal-body">
                <div class="custom-toolbar">
                    <span class="title"></span>
                    <div class="btn secondary" onclick="hideParentModal(this)">Zamknij <i class="fa fa-times"></i></div>
                </div>
                <div class="menu_body"></div>
            </div>
        </div>
    `);

    window.filter_menu = $("#filter_menu .menu_body");
  } else {
    document.body.insertAdjacentHTML(
      "beforeend",
      "<div class='filter_menu'></div>"
    );

    window.filter_menu = $(".filter_menu");

    window.addEventListener("click", (e) => {
      var hide = true;
      var btn = $(e.target).findParentByClassName("datatable-search-btn");
      if (btn) {
        hide = false;
      } else {
        if ($(e.target).findParentByClassName("filter_menu")) {
          hide = false;
        }
      }

      if (hide) {
        filtersVisibility(true);
      }
    });
  }
});

function setFilters(datatable, column_id) {
  var col_def = datatable.definition[column_id];

  removeFilterByField(datatable, col_def.field);

  if (col_def.searchable == "select") {
    var values = [];
    filter_menu.findAll(`input[type='checkbox']`).forEach((e) => {
      if (e.checked) {
        values.push(e.value);
      }
    });
    if (values.length > 0) {
      datatable.filters.push({
        field: col_def.field,
        type: "=",
        value: values,
      });
    }
  } else if (col_def.searchable == "date") {
    var date_type = filter_menu.find(".date_type").getValue();

    if (date_type == "<>") {
      datatable.filters.push({
        field: col_def.field,
        type: date_type,
        value: [
          reverseDateString($(".date_range_picker .start").getValue(), "-"),
          reverseDateString($(".date_range_picker .end").getValue(), "-"),
        ],
      });
    } else {
      datatable.filters.push({
        field: col_def.field,
        type: date_type,
        value: reverseDateString($(".default_datepicker").getValue(), "-"),
      });
    }
  } else {
    var value = filter_menu.find(`.field`).getValue();
    var exact = filter_menu.find(`[name='exact']`).getValue();

    if (value || exact) {
      if (!exact) {
        value = `%${value}%`;
      }
      datatable.filters.push({
        field: col_def.field,
        type: exact ? "=" : "%",
        value: value,
      });
    }
  }

  filtersVisibility(true);

  datatable.search();
}

function removeFilterByField(datatable, field) {
  var current_filter_index = datatable.filters
    .map((e) => {
      return e.field;
    })
    .indexOf(field);

  if (current_filter_index != -1) {
    datatable.filters.splice(current_filter_index, 1);
  }
}

function removeFilters(datatable, column_id) {
  var col_def = datatable.definition[column_id];

  removeFilterByField(datatable, col_def.field);

  filtersVisibility(true);

  datatable.search();
}

function filtersVisibility(hide = false) {
  if (hide) {
    if (IS_MOBILE) {
      hideModal("filter_menu");
    } else {
      filter_menu.style.display = "none";
    }
  }

  removeClasses("datatable-column-highlighted");

  $$(".datatable-wrapper").forEach((datatableElem) => {
    var datatable = window[datatableElem.getAttribute("data-datatable-name")];
    datatable.tableSearchElement
      .findAll(".datatable-search-btn")
      .forEach((elem) => {
        var field = elem.getAttribute("data-field");
        var active = !!datatable.filters.find((e) => {
          return e.field == field;
        });

        elem.classList.toggle("secondary", active);
        elem.classList.toggle("primary", !active);
      });
  });
}

function getParentDatatable(node) {
  node = $(node);
  var tableNode = node.findParentByClassName("datatable-wrapper");
  if (!tableNode) return null;
  var tablename = tableNode.getAttribute("data-datatable-name");
  if (!tablename) return null;
  var datatable = window[tablename];

  return datatable;
}

function selectFilterCheckboxes(values) {
  filter_menu.findAll(`input[type='checkbox']`).forEach((e) => {
    e.setValue(values.indexOf(+e.value) != -1 ? 1 : 0);
  });
}
