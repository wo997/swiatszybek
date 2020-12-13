/* js[global] */
function createDatatable(datatable__a) {
	// REQUIRED name, definition | renderRow, url, primary, db_table
	// OPTIONAL controls OR controlsRight, width, nosearch, rowCount (10,20,50), onSearch, onCreate, bulk_menu
	// filters / fixed_filters
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
	window[datatable__a.name] = datatable__a;
	datatable__a.awaitId = null;
	datatable__a.currPage = 1;
	datatable__a.pageCount = 0;
	datatable__a.request = null;
	datatable__a.results = [];
	datatable__a.filters = [];
	datatable__a.fixed_filters = [];
	datatable__a.sort = null;

	if (!datatable__a.lang) datatable__a.lang = {};
	datatable__a.lang.subject = nonull(datatable__a.lang.subject, "wyników");

	datatable__a.target = $("." + datatable__a.name);

	datatable__a.target.classList.add("datatable-wrapper");
	datatable__a.target.setAttribute("data-datatable-name", datatable__a.name);

	if (datatable__a.sortable) {
		if (!datatable__a.primary) {
			console.error(`missing primary key in ${datatable__a.name}`);
		}
		if (!datatable__a.db_table) {
			console.error(`missing db_table name in ${datatable__a.name}`);
		}
		datatable__a.definition = [
			{
				title: "Kolejność",
				width: "85px",
				className: "kolejnosc-column",
				render: (r, i) => {
					return /*html*/ `<i class="fas fa-arrows-alt-v" style="cursor:grab"></i> <input type="number" class="kolejnosc" value="${r.kolejnosc}" data-value="${r.kolejnosc}" onchange="rearrange(this)">`;
				},
				escape: false,
			},
			...datatable__a.definition,
		];
	}

	if (datatable__a.selectable) {
		datatable__a.definition = [
			{
				title: /*html*/ `<span class='selected-results-count'>0</span>`,
				width: "36px",
				render: (r) => {
					return ``;
				},
			},
			...datatable__a.definition,
		];

		datatable__a.selection = [];
		datatable__a.singleselect = datatable__a.selectable.singleselect;
		if (datatable__a.selectable.has_metadata) {
			datatable__a.metadata = [];
		}

		datatable__a.setSelectedValuesFromString = (v) => {
			// Works also with json to make it easier to use
			var values = typeof v == "string" ? JSON.parse(v) : v;
			var selection = [];

			// If someone didn't provide array
			if (datatable__a.singleselect) {
				if (!Array.isArray(values)) {
					values = [values];
				}
			}

			if (datatable__a.selectable.has_metadata) {
				datatable__a.metadata = values;

				try {
					values.forEach((row) => {
						selection.push(parseInt(row[datatable__a.primary]));
					});
				} catch (e) {
					console.log(e);
				}
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
			datatable__a.selection = selection;

			datatable__a.selectionValueElement.value = JSON.stringify(values);

			datatable__a.createList();
		};
		datatable__a.getSelectedValuesString = () => {
			return JSON.stringify(datatable__a.selection);
		};
		datatable__a.getSelectedValuesAllString = () => {
			// for metadata
			return JSON.stringify(datatable__a.metadata);
		};
	}
	if (!datatable__a.selection) {
		datatable__a.selection = [];
	}

	if (datatable__a.bulk_menu) {
		if (!datatable__a.primary) {
			console.error(`missing primary key in ${datatable__a.name}`);
		}
		datatable__a.definition = [
			{
				title: /*html*/ `<label class="checkbox-wrapper">
                    <input type="checkbox" class="bulk_edit_checkbox bulk_edit_checkbox_all" onchange="${datatable__a.name}.bulkEditSelectAll()">
                    <div class="checkbox standalone"></div>
                </label>`,
				width: "36px",
				render: () => {
					return /*html*/ `<label class="checkbox-wrapper">
                        <input type="checkbox" class="bulk_edit_checkbox" onchange="${datatable__a.name}.bulkEditSelectionChange()">
                        <div class="checkbox standalone"></div>
                    </label>`;
				},
				escape: false,
			},
			...datatable__a.definition,
		];

		datatable__a.bulkEditSelectAll = () => {
			var checked = datatable__a.target.find(".bulk_edit_checkbox_all").checked;
			datatable__a.tableSearchElement
				.findAll("tbody .bulk_edit_checkbox")
				.forEach((e) => {
					e.checked = checked;
				});

			datatable__a.bulkEditSelectionChange();
		};

		datatable__a.bulkEditSelectionChange = () => {
			var bulk_selection = [];
			var all_checked = true;
			var any_checked = false;
			datatable__a.tableSearchElement
				.findAll("tbody .bulk_edit_checkbox")
				.forEach((e) => {
					if (e.checked) {
						bulk_selection.push(
							+e.parent().parent().parent().getAttribute("data-index")
						);
						any_checked = true;
					} else {
						all_checked = false;
					}
				});
			datatable__a.bulk_selection = bulk_selection;

			if (any_checked) {
				var bulk_selection_count = datatable__a.target.find(
					".bulk_selection_count"
				);
				if (bulk_selection_count) {
					bulk_selection_count.innerHTML = bulk_selection.length;
				}
			}

			datatable__a.target.find(".bulk_edit_checkbox_all").checked = all_checked;

			expand(datatable__a.bulkMenuElement, any_checked);
		};
	}

	var breadcrumb_html = "";

	if (datatable__a.tree_view) {
		datatable__a.lang.main_category = nonull(
			datatable__a.lang.main_category,
			"Kategoria główna"
		);

		datatable__a.breadcrumb = [
			{
				title:
					/*html*/ `<i class="fas fa-home" style="margin-right: 4px;"></i>` +
					datatable__a.lang.main_category,
				category_id: -1,
			},
		];

		breadcrumb_html = /*html*/ `
        <div class="breadcrumb"></div>
        <div class="btn important" onclick="${datatable__a.name}.showEditCategory(this,null,true)">Dodaj <i class="fa fa-plus"></i></div>
      `;
	}

	var above_table_html = "";

	if (datatable__a.controls) {
		above_table_html += /*html*/ `<div class="flexbar">${datatable__a.controls}</div><div class="flexbar"></div>`;
	}
	if (breadcrumb_html) {
		above_table_html += /*html*/ `<div>${breadcrumb_html}</div>`;
	}

	above_table_html += /*html*/ `<div class="flexbar" style="align-items: baseline;">
        <div class="flexbar auto-width-desktop" style="margin:0;align-items: baseline;">
          <span class="total-rows"></span>
          <span class="space-right">&nbsp;${datatable__a.lang.subject}</span>
          <select data-param="rowCount" class="field inline">
              <option value='10' ${
								datatable__a.rowCount == 10 ? "selected" : ""
							}>10</option>
              <option value='20' ${
								!datatable__a.rowCount || datatable__a.rowCount == 20
									? "selected"
									: ""
							}>20</option>
              <option value='50' ${
								datatable__a.rowCount == 50 ? "selected" : ""
							}>50</option>
          </select>
          <span class="big space-right no-space-mobile na-strone">&nbsp;&nbsp;na stronę</span>
          <div class="pagination"></div>
        </div>
        <div style='flex-grow:1'></div>
        <div class="btn subtle space-right clear-filters-btn hidden" data-tooltip="Wyczyść wszystkie filtry" onclick="${
					datatable__a.name
				}.clearFilters()">
          <img src="/src/img/clear-filters.png" style="width: 25px;margin: -7px;">
        </div>
        ${nonull(datatable__a.controlsRight)}
      </div>`;

	var headersHTML = "<tr>";
	var columnStyles = [];

	if (datatable__a.definition) {
		var sumWidthPercentages = 0;
		for (def of datatable__a.definition) {
			if (def.width && def.width.indexOf("%") != -1) {
				sumWidthPercentages += parseFloat(def.width);
			}
		}
		var scalePercentages = 100 / sumWidthPercentages;
		for (def of datatable__a.definition) {
			if (def.width && def.width.indexOf("%") != -1) {
				def.width = Math.round(parseFloat(def.width) * scalePercentages) + "%";
			}
		}

		var def_id = -1;
		for (header of datatable__a.definition) {
			def_id++;
			var additional_html = "";
			if (header.sortable) {
				var sortBy = header.sortable === true ? header.field : header.sortable;
				additional_html += /*html*/ ` <i class="btn primary fas fa-sort datatable-sort-btn" onclick="datatableSort(this,'${sortBy}')" data-tooltip="Sortuj malejąco / rosnąco"></i>&nbsp;`;
			}
			if (header.searchable) {
				additional_html += /*html*/ `<i class="btn primary fas fa-search datatable-search-btn" data-field="${header.field}" onclick="datatableFilter(this,'${def_id}')" data-tooltip="Filtruj wyniki"></i>`;
			}

			var style = "";
			if (header.width) style += /*html*/ `style='width:${header.width}'`;
			if (header.className) style += /*html*/ `class='${header.className}'`;

			if (additional_html) {
				additional_html = /*html*/ `<span class='table-header-buttons'>${additional_html}</span>`;
			}

			headersHTML += /*html*/ `<th ${style}><span>${header.title} </span>${additional_html}</th>`;
			columnStyles.push(style);
		}
		headersHTML += "</tr>";
	}

	datatable__a.headersHTML = headersHTML;
	datatable__a.columnStyles = columnStyles;

	var table_html = /*html*/ `
    <div class="table-wrapper">
      <div class="table-scroll-width">
        <table class='datatable'>
          <thead>${datatable__a.headersHTML}</thead>
          <tbody></tbody>
        </table>
      </div>
    </div>
    `;

	var below_table_html = /*html*/ `<div class="pagination pagination-bottom"></div>`;

	if (datatable__a.bulk_menu) {
		below_table_html += /*html*/ `<div class="bulk_menu expand_y animate_hidden hidden"><div style='margin-bottom:10px'>${datatable__a.bulk_menu}</div></div>`;
	}

	if (datatable__a.selectable) {
		datatable__a.target.insertAdjacentHTML(
			"afterbegin",
			/*html*/ `
          <div class="selected_rows">${table_html}</div>
          <div class="showBtn expand_y">
            <div class="btn secondary fill" onclick="${
							datatable__a.name
						}.toggleSearchVisibility(true)">Wyszukaj <i class="fas fa-plus"></i> </div>
          </div>
          <input type="hidden" class="table-selection-value" name="${
						datatable__a.selectable.output
							? datatable__a.selectable.output
							: datatable__a.primary
					}" ${datatable__a.selectable.validate ? `data-validate` : ""}>
          <div class="has_selected_rows table-search-wrapper ${
						datatable__a.selectable ? `expand_y hidden animate_hidden` : ""
					}">
            <div class="table-search-container">
              <div class="btn secondary fill hideBtn" onclick="${
								datatable__a.name
							}.toggleSearchVisibility(false)">Ukryj wyszukiwarkę <i class="fas fa-minus"></i> </div>
              ${above_table_html}${table_html}${below_table_html}
            </div>
          </div>
        `
		);

		datatable__a.target
			.find(".selected_rows .datatable")
			.insertAdjacentHTML(
				"afterend",
				/*html*/ `<div class="no-results">Brak powiązanych ${datatable__a.lang.subject}</div>`
			);
	} else {
		datatable__a.target.insertAdjacentHTML(
			"afterbegin",
			/*html*/ `<div class="table-search-wrapper">${above_table_html}${table_html}${below_table_html}</div>`
		);
	}
	datatable__a.target
		.find(".table-search-wrapper .datatable")
		.insertAdjacentHTML(
			"afterend",
			/*html*/ `<div class="no-results">Brak ${datatable__a.lang.subject}</div>`
		);

	datatable__a.searchElement = datatable__a.target.find(".search-wrapper");
	datatable__a.tableSearchElement = datatable__a.target.find(
		".table-search-wrapper"
	);
	datatable__a.tableSelectionElement = datatable__a.target.find(
		".selected_rows"
	);
	datatable__a.tableBodyElement = datatable__a.tableSearchElement.find("tbody");
	datatable__a.totalRowsElement = datatable__a.target.find(".total-rows");
	datatable__a.paginationElement = datatable__a.target.find(".pagination");
	datatable__a.bulkMenuElement = datatable__a.target.find(".bulk_menu");
	datatable__a.paginationBottomElement = datatable__a.target.find(
		".pagination-bottom"
	);
	datatable__a.selectionBodyElement = datatable__a.tableSelectionElement
		? datatable__a.tableSelectionElement.find("tbody")
		: null;
	datatable__a.selectionValueElement = datatable__a.target.find(
		".table-selection-value"
	);

	if (datatable__a.onCreate) datatable__a.onCreate();

	if (datatable__a.tree_view) {
		datatable__a.breadcrumbElement = datatable__a.target.find(".breadcrumb");

		datatable__a.getParentId = () => {
			if (datatable__a.breadcrumb.length == 0) return -1;
			return datatable__a.breadcrumb[datatable__a.breadcrumb.length - 1]
				.category_id;
		};
		datatable__a.backToCategory = (category_id = 0) => {
			var steps = null;
			for (i = 0; i < datatable__a.breadcrumb.length; i++) {
				if (datatable__a.breadcrumb[i].category_id == category_id) {
					steps = datatable__a.breadcrumb.length - 1 - i;
					break;
				}
			}
			datatable__a.categoryStepBack(steps);
		};
		datatable__a.categoryStepBack = (steps) => {
			if (steps > 0) {
				for (i = 0; i < steps; i++) {
					if (datatable__a.breadcrumb.length > 0) {
						datatable__a.breadcrumb.pop();
					}
				}
				datatable__a.search();
			}
		};
		datatable__a.openCategory = (row_id) => {
			var row = datatable__a.results[row_id];
			datatable__a.breadcrumb.push({
				title: row.title,
				category_id: row.category_id,
			});
			datatable__a.search();
		};
		datatable__a.showEditCategory = (
			btn = null,
			row_id = null,
			isNew = false
		) => {
			var form_name = datatable__a.tree_view.form;

			var loadCategoryFormCallback = (data) => {
				datatable__a.tree_view.form_data = data;
				datatable__a.tree_view.loadCategoryForm(form_name, data, isNew);

				var params = {};
				if (!isNew) {
					params.data = {
						parent_id: {
							disable_with_children: [data.category_id],
						},
					};
				}

				setFormData({ parent_id: data.parent_id }, `#${form_name}`, params);
			};

			if (isNew) {
				loadCategoryFormCallback({
					parent_id: datatable__a.getParentId(),
					category_id: -1,
				});
			} else {
				var category_id = 0;
				if (row_id === null) {
					category_id = datatable__a.getParentId();
				} else {
					var row = datatable__a.results[row_id];
					category_id = row.category_id;
				}

				var formParams = nonull(datatable__a.tree_view.formParams, {});
				formParams.category_id = category_id;

				xhr({
					url: datatable__a.url,
					params: formParams,
					success: (res) => {
						loadCategoryFormCallback(res.results[0]);
						clearAllErrors(`#${form_name}`);
						setFormInitialState(`#${form_name}`);
					},
				});
			}

			showModal(form_name, { source: btn });
		};
		datatable__a.postSaveCategory = (params, remove) => {
			var parentChanged =
				datatable__a.tree_view.form_data.parent_id != params.parent_id;
			var isCurrent = datatable__a.getParentId() == params.category_id;
			if ((remove || parentChanged) && isCurrent) {
				datatable__a.categoryStepBack(1);
			} else {
				if (isCurrent) {
					datatable__a.breadcrumb[datatable__a.breadcrumb.length - 1].title =
						params.title;
				}
				datatable__a.search();
			}
		};
	}

	if (datatable__a.width) {
		datatable__a.target.style.maxWidth = datatable__a.width + "px";
		datatable__a.target.style.marginLeft = "auto";
		datatable__a.target.style.marginRight = "auto";
	}

	datatable__a.awaitSearch = function () {
		clearTimeout(datatable__a.awaitId);
		datatable__a.awaitId = setTimeout(function () {
			datatable__a.search();
		}, 400);
	};

	$$(`.${datatable__a.name} [data-param]`).forEach((e) => {
		const onParamsChange = () => {
			if (e.tagName == "INPUT") datatable__a.awaitSearch();
			else datatable__a.search();
			filterOrSortChanged();
		};
		e.addEventListener("input", function () {
			onParamsChange();
		});
		e.addEventListener("change", function () {
			onParamsChange();
		});
	});

	datatable__a.clearFilters = () => {
		datatable__a.filters = [];
		clearTableSorting(datatable__a);
		var se = datatable__a.target.find(`[data-param="search"]`);
		if (se) {
			se.setValue("");
		}
		datatable__a.search();
	};

	datatable__a.search = (callback = null, createList = false) => {
		clearTimeout(datatable__a.awaitId);

		if (datatable__a.request) datatable__a.request.abort();

		if (datatable__a.tree_view) {
			// breadcrumb update
			var out = "";
			var index = -1;
			for (let category of datatable__a.breadcrumb) {
				index++;
				if (index > 0) out += /*html*/ ` <i class="fas fa-chevron-right"></i> `;
				out += /*html*/ `<div class="${
					index < datatable__a.breadcrumb.length - 1 ? "btn subtle" : "current"
				}" onclick="${datatable__a.name}.backToCategory(${
					category.category_id
				})">${category.title}</div>`;
			}
			if (datatable__a.breadcrumb.length > 1)
				out += /*html*/ ` <div class="btn subtle" onclick="${datatable__a.name}.showEditCategory(this,null)" style="margin-left:6px"><i class="fa fa-cog"></i></div>`;
			datatable__a.breadcrumbElement.innerHTML = out;
		}

		var params = {
			filters: [],
		};
		Object.assign(params.filters, [
			...datatable__a.filters,
			...datatable__a.fixed_filters,
		]);

		if (createList) {
			if (datatable__a.selection) {
				params.filters.push({
					type: "=",
					value: datatable__a.selection,
					field: datatable__a.primary,
				});
			}
		} else {
			if (datatable__a.params) {
				Object.assign(params, datatable__a.params());
			}
			if (datatable__a.requiredParam) {
				var x = datatable__a.requiredParam();
				if (x || x === 0) {
					params[requiredFilterTables[datatable__a.db_table]] = x;
				}
			}
			$$(`.${datatable__a.name} [data-param]`).forEach((e) => {
				if (
					e.findParentByClassName("hidden", { inside: datatable__a.target })
				) {
					return;
				}
				params[e.getAttribute("data-param")] = e.getValue();
			});

			if (datatable__a.selectable) {
				params.filters.push({
					type: "!=",
					value: datatable__a.selection,
					field: datatable__a.primary,
				});
			}
			if (datatable__a.tree_view) {
				params.parent_id = datatable__a.getParentId();
			}
		}

		if (datatable__a.sort) {
			params.sort = datatable__a.sort;
		} else {
			delete params.sort;
		}

		var paramsJson = JSON.stringify(params);
		if (
			datatable__a.lastParamsJson &&
			datatable__a.lastParamsJson != paramsJson
		) {
			datatable__a.currPage = 1;
		}
		datatable__a.lastParamsJson = paramsJson;

		var canOrder = datatable__a.sortable;
		if (canOrder) {
			var needsRequired = requiredFilterTables[datatable__a.db_table];
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

			if (datatable__a.filters.length > 0 || datatable__a.sort) {
				canOrder = false;
			}

			datatable__a.target.classList.toggle("noOrder", !canOrder);
		}

		datatable__a.request = xhr({
			url: datatable__a.url,
			params: {
				...params,
				pageNumber: datatable__a.currPage,
			},
			success: (res) => {
				if (createList) {
					if (datatable__a.sortable) {
						var r = [];
						for (let sel of datatable__a.selection) {
							var row = res.results.find((e) => {
								return e[datatable__a.primary] == sel;
							});
							if (row) {
								r.push(row);
							}
						}
						res.results = r;
						//console.log(datatable.selection, res.results);
						/*res.results.sort(function(a, b) {
              return parseFloat(a.price) - parseFloat(b.price);
            });*/
					}

					datatable__a.selectionResults = res.results;
				} else {
					datatable__a.pageCount = res.pageCount;
					datatable__a.results = res.results;
				}

				var e = datatable__a.tableSearchElement.find(".no-results");
				if (e) {
					e.style.display = res.results.length !== 0 ? "none" : "";
				}

				var output = "";

				output = "";
				for (i = 0; i < res.results.length; i++) {
					var row = res.results[i];
					var attr = "";
					if (canOrder) attr = "draggable='true'";
					output += /*html*/ `<tr data-index='${i}' ${attr} ${
						datatable__a.primary
							? `data-primary=${row[datatable__a.primary]}`
							: ""
					}>`;

					if (datatable__a.renderRow) {
						var cell = datatable__a.renderRow(row, i);
						output += /*html*/ `<td>${cell}</td>`;
					} else {
						for (x = 0; x < datatable__a.definition.length; x++) {
							if (datatable__a.selectable && x === 0) {
								if (createList) {
									output += /*html*/ `<td style="width:33px;text-align:center"> <i class="fas fa-minus-circle" onclick="${
										datatable__a.name
									}.removeRow(${row[datatable__a.primary]})"></i> </td>`;
								} else {
									output += /*html*/ `<td style="width:33px;text-align:center"> <i class="fas fa-plus-circle" onclick="${
										datatable__a.name
									}.addRow(${row[datatable__a.primary]})"></i> </td>`;
								}
								continue;
							}

							var definition = datatable__a.definition[x];
							var cell_html = "";
							if (definition.render) {
								cell_html = nonull(definition.render(row, i, datatable__a));
							} else if (definition.field) {
								cell_html = row[definition.field];
							}
							if (
								!definition.hasOwnProperty("escape") ||
								definition.escape === true
							) {
								cell_html = escapeHTML(cell_html);
							}
							output += `<td ${datatable__a.columnStyles[x]}>${cell_html}</td>`;
						}
					}
					output += "</tr>";
				}

				if (createList) {
					datatable__a.selectionBodyElement.setContent(output);
				} else {
					datatable__a.totalRowsElement.setContent(res.totalRows);
					datatable__a.tableBodyElement.setContent(output);

					datatable__a.paginationElement.style.display =
						window.innerWidth > 1000 ? "" : "none";

					renderPagination(
						datatable__a.paginationElement,
						datatable__a.currPage,
						datatable__a.pageCount,
						(i) => {
							datatable__a.currPage = i;
							datatable__a.search();
						},
						{ allow_my_page: true }
					);

					if (datatable__a.paginationBottomElement) {
						datatable__a.paginationBottomElement.style.display =
							window.innerWidth <= 1000 ||
							datatable__a.tableBodyElement.getBoundingClientRect().height >
								window.innerHeight - 100
								? ""
								: "none";

						renderPagination(
							datatable__a.paginationBottomElement,
							datatable__a.currPage,
							datatable__a.pageCount,
							(i) => {
								datatable__a.currPage = i;
								datatable__a.search();
							},
							{ allow_my_page: true }
						);
					}
				}

				datatable__a.target.findAll("td, td *").forEach((e) => {
					if (e.offsetWidth < e.scrollWidth) {
						var info = e.textContent.replace(/, /g, "<br>").trim();
						e.setAttribute("data-tooltip", info);
					}
				});

				if (datatable__a.selectable && datatable__a.selectable.has_metadata) {
					datatable__a.registerMetadataFields();
				}

				if (callback) {
					callback(res); // custom
				}
				if (datatable__a.onSearch) {
					datatable__a.onSearch(res); // default
				}

				if (datatable__a.bulk_menu) {
					datatable__a.bulkEditSelectionChange();
				}
			},
		});
	};

	datatable__a.initialSearch = () => {
		if (
			!datatable__a.hasOwnProperty("nosearch") ||
			datatable__a.nosearch === false ||
			datatable__a.selectable
		) {
			datatable__a.search(() => {
				datatable__a.ready = true;
			});
		}
	};

	datatable__a.createList = (firstLoad) => {
		if (firstLoad && datatable__a.nosearch === true) {
			return;
		}

		datatable__a.search(() => {
			datatable__a.initialSearch();

			if (datatable__a.selectable && datatable__a.selectable.has_metadata) {
				try {
					datatable__a.metadata.forEach((row_data) => {
						var row = datatable__a.selectionBodyElement.find(
							`[data-primary="${row_data[datatable__a.primary]}"]`
						);
						if (row) {
							Object.entries(row_data).forEach(([key, value]) => {
								var m = row.find(`[data-metadata="${key}"]`);
								if (m) {
									// let f.e simple-list component be created
									setTimeout(() => {
										m.setValue(value);
									}, 0);
								}
							});
						}
					});
				} catch (e) {
					console.error(e);
				}
			}

			datatable__a.selectionChange(false);
		}, true);
	};
	if (datatable__a.selectable) {
		datatable__a.createList(true);
	} else {
		datatable__a.initialSearch();
	}

	datatable__a.toggleSearchVisibility = (visible) => {
		expand($(`.${datatable__a.name} .showBtn`), !visible);
		expand($(`.${datatable__a.name} .table-search-wrapper`), visible);
	};

	datatable__a.removeRow = (data_id) => {
		data_id = +data_id;
		const index = datatable__a.selection.indexOf(data_id);
		if (index === -1) {
			return;
		}

		datatable__a.selection.splice(index, 1);

		const index2 = datatable__a.selectionResults
			.map((e) => {
				return e[datatable__a.primary];
			})
			.indexOf(data_id);

		datatable__a.results.push(datatable__a.selectionResults[index2]);

		if (index2 !== -1) {
			datatable__a.selectionResults.splice(index2, 1);
		}

		datatable__a.selection.push(data_id);
		var x = datatable__a.target.find(`[data-primary='${data_id}']`);
		datatable__a.tableBodyElement.appendChild(x);
		var d = x.find(".fa-minus-circle");
		d.outerHTML = d.outerHTML
			.replace("minus", "plus")
			.replace("removeRow", "addRow");
		datatable__a.selectionChange();
	};
	datatable__a.addRow = (data_id) => {
		data_id = +data_id;
		if (datatable__a.singleselect && datatable__a.selection.length > 0) {
			datatable__a.removeRow(datatable__a.selection[0]);
		}
		if (
			datatable__a.singleselect ||
			datatable__a.selection.indexOf(data_id) === -1
		) {
			datatable__a.selectionResults.push(
				datatable__a.results.find((e) => {
					return e[datatable__a.primary] == data_id;
				})
			);
			datatable__a.selection.push(data_id);
			var x = datatable__a.target.find(`[data-primary='${data_id}']`);
			datatable__a.selectionBodyElement.appendChild(x);
			var d = x.find(".fa-plus-circle");
			d.outerHTML = d.outerHTML
				.replace("plus", "minus")
				.replace("addRow", "removeRow");
			datatable__a.selectionChange();
		}
	};
	datatable__a.selectionChange = (doSearch = true) => {
		if (datatable__a.selectable.has_metadata) {
			datatable__a.registerMetadataFields();
		}

		var e = datatable__a.tableSelectionElement.find(".no-results");
		if (e) {
			e.style.display =
				datatable__a.selectionResults.length !== 0 ? "none" : "";
		}

		if (datatable__a.selectable.has_metadata) {
			var metadata = [];
			datatable__a.selectionBodyElement
				.findAll("tr[data-primary]")
				.forEach((e) => {
					var row = {};
					row[datatable__a.primary] = parseInt(e.getAttribute("data-primary"));
					e.findAll("[data-metadata]").forEach((m) => {
						row[m.getAttribute("data-metadata")] = m.getValue();
					});
					metadata.push(row);
				});
			datatable__a.metadata = metadata;
		}

		var selection = [];
		datatable__a.selectionBodyElement.findAll("[data-primary]").forEach((e) => {
			selection.push(parseInt(e.getAttribute("data-primary")));
		});

		datatable__a.selection = selection;

		datatable__a.selectionValueElement.value = datatable__a.selectable
			.has_metadata
			? datatable__a.getSelectedValuesAllString()
			: datatable__a.getSelectedValuesString();

		if (doSearch) {
			datatable__a.search();
		}

		datatable__a.tableSelectionElement.find(
			".selected-results-count"
		).innerHTML = datatable__a.selection.length;

		if (datatable__a.sortable) {
			var index = 0;
			datatable__a.selectionBodyElement.findAll(".kolejnosc").forEach((e) => {
				index++;
				e.value = index;
				e.setAttribute("data-value", index);
			});
		}

		if (datatable__a.bulk_menu) {
			datatable__a.bulkEditSelectionChange();
		}

		if (datatable__a.onSelectionChange) {
			datatable__a.onSelectionChange(datatable__a.selection, datatable__a);
		}
	};
	if (datatable__a.selectable && datatable__a.selectable.has_metadata) {
		datatable__a.registerMetadataFields = () => {
			datatable__a.selectionBodyElement
				.findAll("[data-metadata]")
				.forEach((m) => {
					m.oninput = () => {
						datatable__a.selectionChange(false);
					};
					m.onchange = () => {
						datatable__a.selectionChange(false);
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
	var target = $(event.target);
	if (!target.hasAttribute("draggable")) {
		event.preventDefault();
		return;
	}
	if (
		target.tagName != "TR" ||
		target.findParentByClassName("has_selected_rows")
	) {
		return;
	}

	datatableRearrange.source = target;
	datatableRearrange.placeFrom = datatableRearrange.source.find(
		".kolejnosc"
	).value;

	if (datatableRearrange.source && datatableRearrange.source.classList) {
		datatableRearrange.source.classList.add("grabbed");
	}
});

window.addEventListener("dragend", () => {
	if (datatableRearrange.source) {
		var input = datatableRearrange.source.find(".kolejnosc");
		input.setValue(datatableRearrange.placeTo);
	}
	removeClasses("grabbed");
	$$(".tableRearrange").forEach((e) => {
		removeNode(e);
	});
	datatableRearrange.element = null;
});

function rearrange(input) {
	var wasIndex = input.getAttribute("data-value");

	var datatable = getParentDatatable(input);

	var toIndex = input.value;
	if (toIndex < 0) toIndex = 0;

	if (toIndex === wasIndex) return;

	if (datatable.selectable) {
		if (toIndex < wasIndex) {
			toIndex--;
		}
		var row2 = datatable.selectionBodyElement.findAll("tr")[toIndex];
		var row1 = input.parent().parent();
		row1.parent().insertBefore(row1, row2);

		datatable.selectionChange();
		return;
	}

	if (toIndex < 1) toIndex = 1;

	var table = datatable.db_table;
	var primary = datatable.primary;
	var itemId = input.findParentByTagName("TR").getAttribute("data-primary");

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
		url: STATIC_URLS["ADMIN"] + "rearrange_table",
		params: params,
		success: () => {
			showNotification("Zapisano zmianę kolejności", {
				one_line: true,
				type: "success",
			});
			datatable.search();
		},
	});
}

window.addEventListener("dragover", (event) => {
	if (!event.target) return;
	var tr = findParentByTagName(event.target, "TR");
	if (!tr) return;

	var nonstatic_parent = tr.findNonStaticParent();

	/*var scroll_parent = tr.findScrollParent();
  if (scroll_parent === window) {
    scroll_parent = document.body;
  }*/

	if (!datatableRearrange.element) {
		datatableRearrange.element = document.createElement("DIV");
		datatableRearrange.element.classList.add("rearrange-splitter");
		datatableRearrange.element.style.background = "#5557";
		datatableRearrange.element.style.position = "absolute";
		nonstatic_parent.appendChild(datatableRearrange.element);
	}

	if (tr != datatableRearrange.target) {
		datatableRearrange.target = tr;
	}

	if (datatableRearrange.target) {
		//var pos = position(datatableRearrange.target);
		//var pos = position(datatableRearrange.target);
		var rect = datatableRearrange.target.getBoundingClientRect();
		var parent_rect = nonstatic_parent.getBoundingClientRect();
		var h = 10;

		var isAfter = event.offsetY > rect.height / 2;

		datatableRearrange.element.style.left = rect.left - parent_rect.left + "px";
		datatableRearrange.element.style.top =
			rect.top - parent_rect.top - h / 2 + isAfter * rect.height + "px";
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

function getPublishedDefinition(options = {}) {
	return {
		title: "",
		width: "71px",
		className: "center",
		render: (r) => {
			return renderIsPublished(r);
		},
		escape: false,
		field: nonull(options.field, "published"),
		searchable: "select",
		select_single: true,
		select_values: [1, 0],
		select_labels: ["Publiczny", "Ukryty"],
	};
}

function renderIsPublished(data) {
	var label = "";
	var color = "";
	if (data.published == 1) {
		label = /*html*/ `<i class="fas fa-eye"></i>`;
		color = "#2a2";
	} else {
		label = /*html*/ `<i class="fas fa-eye-slash"></i>`;
		color = "#a22";
	}
	return /*html*/ `<div class='rect btn' style='color:${color}; border: 1px solid ${color}; text-align: center; width: 45px'
    onclick='setPublish(this,${1 - data.published})'>${label}</div>`;
}

function setPublish(obj, published) {
	obj = $(obj);
	var tableElement = obj.findParentByClassName("datatable-wrapper");
	var listElement = obj.findParentByClassName("simple-list");
	if (!tableElement && !listElement) return;

	if (listElement) {
		var input = obj.parent().prev();
		input.setValue(1 - input.getValue());
		return;
	}

	var tablename = tableElement.getAttribute("data-datatable-name");
	if (!tablename) return;
	var datatable = window[tablename];
	if (!datatable || !datatable.primary || !datatable.db_table) return;
	var rowElement = findParentByTagName(obj, "TR");
	if (!rowElement) return;
	var primary_id = rowElement.getAttribute("data-primary");
	if (!primary_id) return;

	xhr({
		url: STATIC_URLS["ADMIN"] + "set_publish",
		params: {
			table: datatable.db_table,
			primary: datatable.primary,
			primary_id: primary_id,
			published: published,
		},
		success: () => {
			showNotification(
				/*html*/ `<i class="fas fa-check"></i> Pomyślnie ustawiono element jako <b>${
					published ? "publiczny" : "ukryty"
				}</b>`,
				{
					one_line: true,
					type: "success",
				}
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

	clearTableSorting(datatable, btn);

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

	filterOrSortChanged();
}

function clearTableSorting(datatable, exceptBtn = null) {
	datatable.sort = null;
	datatable.target.findAll(".datatable-sort-btn").forEach((e) => {
		e.classList.remove("fa-sort");
		e.classList.remove("fa-arrow-up");
		e.classList.remove("fa-arrow-down");

		e.classList.remove("primary");
		e.classList.remove("secondary");

		if (e !== exceptBtn) {
			e.classList.add("fa-sort");
			e.classList.add("primary");
		}
	});
}

function datatableFilter(btn, column_id) {
	filtersChanged();

	var datatable = getParentDatatable(btn);

	if (!datatable) {
		return;
	}

	var col_def = datatable.definition[column_id];
	var filters = col_def.searchable;

	var menu_header = "";
	var menu_body = "";

	if (filters == "text") {
		menu_header = `Wpisz frazę`;
		menu_body += /*html*/ `<input type="text" class="field margin_bottom">
      <label class='checkbox-wrapper block margin_bottom' text-align:center;color:#555'>
        <input type='checkbox' name='exact'><div class='checkbox'></div> Dopasuj całą frazę
      </label>
    `;
	} else if (filters == "date") {
		if (!IS_MOBILE) {
			menu_header = `Wybierz datę`;
		}
		menu_body += /*html*/ `
      <span class="field-title first">Typ wyszukiwania</span>
      <select class="field date_type" onchange="dateTypeChanged(this)">
        <option value='='>Dokładna data</option>
        <option value='>'>Data od</option>
        <option value='<'>Data do</option>
        <option value='<>'>Przedział</option>
      </select>
      <div class="singledate_wrapper">
        <span class="field-title">Data</span>
        <input type="text" class="field default_datepicker margin_bottom" data-orientation="auto bottom" style='width: 254px;'>
      </div>

      <div class="margin_bottom date_range_picker hidden" style='width: 254px;display:flex;'>
        <div style="margin-right:5px">
          <span class="field-title">Od</span>
          <input type="text" class="field start" data-orientation="left bottom">
        </div>
        <div>
          <span class="field-title">Do</span>
          <input type="text" class="field end" data-orientation="right bottom">
        </div>
      </div>
    `;
	} else if (filters == "select") {
		menu_header = `Zaznacz pola`;
		for (i = 0; i < col_def.select_values.length; i++) {
			var val = col_def.select_values[i];
			var label = col_def.select_labels ? col_def.select_labels[i] : val;
			var select_single = col_def.select_single ? "true" : "false";

			menu_body += /*html*/ `<label class='checkbox-wrapper block'>
                <input type='checkbox' value='${val}' onchange='filterCheckboxChanged(this,${select_single})'><div class='checkbox'></div> ${label}
            </label>`;
		}
	}

	var menu_footer = /*html*/ `<div class='filter_menu_footer'>
        <button class="btn primary fill" style='margin-right:5px' onclick='setFilters(${datatable.name},${column_id})'>Szukaj <i class="fas fa-check"></i></button>
        <button class="btn secondary fill" onclick='removeFilters(${datatable.name},${column_id})'>Wyczyść <i class="fas fa-times"></i></button>
    </div>`;

	if (col_def.renderSearch) {
		menu_body = col_def.renderSearch(menu_body);
	}

	if (IS_MOBILE) {
		setModalTitle("#filter_menu", "Filtruj " + col_def.title.toLowerCase());
		filter_menu.setContent(
			/*html*/ `<span class="field-title">${menu_header}</span>${menu_body}${menu_footer}`
		);
		showModal("filter_menu", {
			source: btn,
		});
	} else {
		if (menu_header) {
			menu_html = /*html*/ `<span class='field-title header first'>${menu_header}</span>${menu_body}${menu_footer}`;
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
				e.setValue(0, { quiet: true });
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
		registerModalContent(/*html*/ `
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
			/*html*/ `<div class='filter_menu'></div>`
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
				filtersChanged(true);
			}
		});
	}

	filter_menu.addEventListener("keydown", (e) => {
		if (e.key === "Enter") {
			var action = filter_menu.find(".filter_menu_footer .primary");
			if (action) {
				action.click();
			}
		}
	});
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

	filtersChanged(true);

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

	filtersChanged(true);

	datatable.search();
}

function filtersChanged(hide = false) {
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

	filterOrSortChanged();
}

function filterOrSortChanged() {
	$$(".datatable-wrapper").forEach((datatableElem) => {
		var datatable = window[datatableElem.getAttribute("data-datatable-name")];

		var search_value = "";
		var se = datatableElem.find(`[data-param="search"]`);
		if (se) {
			search_value = se.getValue();
		}

		datatableElem
			.find(".clear-filters-btn")
			.classList.toggle(
				"hidden",
				datatable.filters.length === 0 && !datatable.sort && !search_value
			);
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
