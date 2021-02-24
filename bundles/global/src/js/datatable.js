// /* js[global] */

// // TODO no kurwa, to jest zjebane, za dużo waży i kod jest jebnięty, popraw to

// // TODO: add the rest of params to doc
// /**
//  *
//  * @typedef {{
//  * field?: string
//  * title: string
//  * width?: string
//  * className?: string
//  * render?: (row: any, index: number) => {}
//  * escape?: boolean
//  * searchable?: string
//  * sortable?: boolean
//  * }} datatableColumnDefinition
//  */

// // TODO: add the rest of params to doc
// /**
//  *
//  * @param {{
//  * name: string,
//  * lang?: Object
//  * url: string
//  * definition: datatableColumnDefinition[]
//  * params?: () => {}
//  * renderRow?: () => {}
//  * controls?: string
//  * controlsRight?: string
//  * headersHTML: string
//  * columnStyles: any
//  * }} datatable
//  */
// function createDatatable(datatable) {
// 	// REQUIRED name, definition | renderRow, url, primary, db_table
// 	// OPTIONAL controls OR controlsRight, width, nosearch, rowCount (10,20,50), onSearch, onCreate, bulk_menu
// 	// filters / fixed_filters
// 	// sortable (requires primary, db_table) IMPORTANT - not the same as column sortable
// 	// selectable: {data,output},
// 	// has_metadata: (boolean, enables outputting metadata from additional row inputs)
// 	// tree_view
// 	// lang: {subject, main_category}
// 	//
// 	// COLUMNS:
// 	// sortable
// 	// searchable
// 	// ?renderSearch
// 	window[datatable.name] = datatable;
// 	datatable.awaitId = null;
// 	datatable.currPage = 1;
// 	datatable.page_count = 0;
// 	datatable.request = null;
// 	datatable.results = [];
// 	datatable.filters = [];
// 	datatable.fixed_filters = [];
// 	datatable.sort = null;

// 	if (!datatable.lang) datatable.lang = {};
// 	datatable.lang.subject = def(datatable.lang.subject, "wyników");

// 	datatable.target = $("." + datatable.name);

// 	datatable.target.classList.add("datatable-wrapper");
// 	datatable.target.setAttribute("data-datatable-name", datatable.name);

// 	if (datatable.sortable) {
// 		if (!datatable.primary) {
// 			console.error(`missing primary key in ${datatable.name}`);
// 		}
// 		if (!datatable.db_table) {
// 			console.error(`missing db_table name in ${datatable.name}`);
// 		}
// 		datatable.definition = [
// 			{
// 				title: "Kolejność",
// 				width: "85px",
// 				className: "kolejnosc-column",
// 				render: (r, i) => {
// 					return html`<i class="fas fa-arrows-alt-v" style="cursor:grab"></i> <input type="number" class="kolejnosc" value="${r.kolejnosc}" data-value="${r.kolejnosc}" onchange="rearrange(this)">`;
// 				},
// 				escape: false,
// 			},
// 			...datatable.definition,
// 		];
// 	}

// 	if (datatable.selectable) {
// 		datatable.definition = [
// 			{
// 				title: html`<span class='selected-results-count'>0</span>`,
// 				width: "36px",
// 				render: (r) => {
// 					return ``;
// 				},
// 			},
// 			...datatable.definition,
// 		];

// 		datatable.selection = [];
// 		datatable.singleselect = datatable.selectable.singleselect;
// 		if (datatable.selectable.has_metadata) {
// 			datatable.metadata = [];
// 		}

// 		datatable.setSelectedValuesFromString = (v) => {
// 			// Works also with json to make it easier to use
// 			var values = typeof v == "string" ? JSON.parse(v) : v;
// 			var selection = [];

// 			// If someone didn't provide array
// 			if (datatable.singleselect) {
// 				if (!Array.isArray(values)) {
// 					values = [values];
// 				}
// 			}

// 			if (datatable.selectable.has_metadata) {
// 				datatable.metadata = values;

// 				try {
// 					values.forEach((row) => {
// 						selection.push(parseInt(row[datatable.primary]));
// 					});
// 				} catch (e) {
// 					console.log(e);
// 				}
// 			} else {
// 				// no metadata, raw table
// 				try {
// 					for (val of values) {
// 						if (val) {
// 							selection.push(parseInt(val));
// 						}
// 					}
// 				} catch (e) {}
// 			}
// 			datatable.selection = selection;

// 			datatable.selectionValueElement.value = JSON.stringify(values);

// 			datatable.createList();
// 		};
// 		datatable.getSelectedValuesString = () => {
// 			return JSON.stringify(datatable.selection);
// 		};
// 		datatable.getSelectedValuesAllString = () => {
// 			// for metadata
// 			return JSON.stringify(datatable.metadata);
// 		};
// 	}
// 	if (!datatable.selection) {
// 		datatable.selection = [];
// 	}

// 	if (datatable.bulk_menu) {
// 		if (!datatable.primary) {
// 			console.error(`missing primary key in ${datatable.name}`);
// 		}
// 		datatable.definition = [
// 			{
// 				title: html`<label class="checkbox-wrapper">
//                     <input type="checkbox" class="bulk_edit_checkbox bulk_edit_checkbox_all" onchange="${datatable.name}.bulkEditSelectAll()">
//                     <div class="checkbox standalone"></div>
//                 </label>`,
// 				width: "36px",
// 				render: () => {
// 					return html`<label class="checkbox-wrapper">
//                         <input type="checkbox" class="bulk_edit_checkbox" onchange="${datatable.name}.bulkEditSelectionChange()">
//                         <div class="checkbox standalone"></div>
//                     </label>`;
// 				},
// 				escape: false,
// 			},
// 			...datatable.definition,
// 		];

// 		datatable.bulkEditSelectAll = () => {
// 			var checked = datatable.target._child(".bulk_edit_checkbox_all").checked;
// 			datatable.tableSearchElement._children("tbody .bulk_edit_checkbox").forEach((e) => {
// 				e.checked = checked;
// 			});

// 			datatable.bulkEditSelectionChange();
// 		};

// 		datatable.bulkEditSelectionChange = () => {
// 			var bulk_selection = [];
// 			var all_checked = true;
// 			var any_checked = false;
// 			datatable.tableSearchElement._children("tbody .bulk_edit_checkbox").forEach((e) => {
// 				if (e.checked) {
// 					bulk_selection.push(+e._parent()._parent()._parent().getAttribute("data-index"));
// 					any_checked = true;
// 				} else {
// 					all_checked = false;
// 				}
// 			});
// 			datatable.bulk_selection = bulk_selection;

// 			if (any_checked) {
// 				var bulk_selection_count = datatable.target._child(".bulk_selection_count");
// 				if (bulk_selection_count) {
// 					bulk_selection_count.innerHTML = bulk_selection.length;
// 				}
// 			}

// 			datatable.target._child(".bulk_edit_checkbox_all").checked = all_checked;

// 			expand(datatable.bulkMenuElement, any_checked);
// 		};
// 	}

// 	var breadcrumb_html = "";

// 	if (datatable.tree_view) {
// 		datatable.lang.main_category = def(datatable.lang.main_category, "Kategoria główna");

// 		datatable.breadcrumb = [
// 			{
// 				title: html`<i class="fas fa-home" style="margin-right: 4px;"></i>` + datatable.lang.main_category,
// 				category_id: -1,
// 			},
// 		];

// 		breadcrumb_html = html`
//         <div class="breadcrumb"></div>
//         <div class="btn important" onclick="${datatable.name}.showEditCategory(this,null,true)">Dodaj <i class="fa fa-plus"></i></div>
//       `;
// 	}

// 	var above_table_html = "";

// 	if (datatable.controls) {
// 		above_table_html += html`<div class="flexbar">${datatable.controls}</div><div class="flexbar"></div>`;
// 	}
// 	if (breadcrumb_html) {
// 		above_table_html += html`<div>${breadcrumb_html}</div>`;
// 	}

// 	above_table_html += html`<div class="flexbar" style="align-items: baseline;">
//         <div class="flexbar auto-width-desktop" style="margin:0;align-items: baseline;">
//           <span class="total-rows"></span>
//           <span class="space-right">&nbsp;${datatable.lang.subject}</span>
//           <select data-param="rowCount" class="field inline">
//               <option value='10' ${datatable.rowCount == 10 ? "selected" : ""}>10</option>
//               <option value='20' ${!datatable.rowCount || datatable.rowCount == 20 ? "selected" : ""}>20</option>
//               <option value='50' ${datatable.rowCount == 50 ? "selected" : ""}>50</option>
//           </select>
//           <span class="big space-right no-space-mobile na-strone">&nbsp;&nbsp;na stronę</span>
//           <div class="pagination"></div>
//         </div>
//         <div style='flex-grow:1'></div>
//         <div class="btn subtle space-right clear-filters-btn hidden" data-tooltip="Wyczyść wszystkie filtry" onclick="${
// 					datatable.name
// 				}.clearFilters()">
//           <img src="/src/img/clear-filters.png" style="width: 25px;margin: -7px;">
//         </div>
//         ${def(datatable.controlsRight)}
//       </div>`;

// 	var headersHTML = "<tr>";
// 	var columnStyles = [];

// 	if (datatable.definition) {
// 		var sumWidthPercentages = 0;
// 		for (const column of datatable.definition) {
// 			if (column.width && column.width.indexOf("%") != -1) {
// 				sumWidthPercentages += parseFloat(column.width);
// 			}
// 		}
// 		var scalePercentages = 100 / sumWidthPercentages;
// 		for (const column of datatable.definition) {
// 			if (column.width && column.width.indexOf("%") != -1) {
// 				column.width = Math.round(parseFloat(column.width) * scalePercentages) + "%";
// 			}
// 		}

// 		var column_id = -1;
// 		for (const header of datatable.definition) {
// 			column_id++;
// 			var additional_html = "";
// 			if (header.sortable) {
// 				var sortBy = header.sortable === true ? header.field : header.sortable;
// 				additional_html += html`<i class="btn primary fas fa-sort datatable-sort-btn" onclick="datatableSort(this,'${sortBy}')" data-tooltip="Sortuj malejąco / rosnąco"></i>&nbsp;`;
// 			}
// 			if (header.searchable) {
// 				additional_html += html`<i class="btn primary fas fa-search datatable-search-btn" data-field="${header.field}" onclick="datatableFilter(this,'${column_id}')" data-tooltip="Filtruj wyniki"></i>`;
// 			}

// 			var style = "";
// 			if (header.width) style += html`style='width:${header.width}'`;
// 			if (header.className) style += html`class='${header.className}'`;

// 			if (additional_html) {
// 				additional_html = html`<span class='table-header-buttons'>${additional_html}</span>`;
// 			}

// 			headersHTML += html`<th ${style}><span>${header.title} </span>${additional_html}</th>`;
// 			columnStyles.push(style);
// 		}
// 		headersHTML += "</tr>";
// 	}

// 	datatable.headersHTML = headersHTML;
// 	datatable.columnStyles = columnStyles;

// 	var table_html = html`
//     <div class="table-wrapper">
//       <div class="table-scroll-width">
//         <table class='datatable'>
//           <thead>${datatable.headersHTML}</thead>
//           <tbody></tbody>
//         </table>
//       </div>
//     </div>
//     `;

// 	var below_table_html = html`<div class="pagination pagination-bottom"></div>`;

// 	if (datatable.bulk_menu) {
// 		below_table_html += html`<div class="bulk_menu expand_y animate_hidden hidden"><div style='margin-bottom:10px'>${datatable.bulk_menu}</div></div>`;
// 	}

// 	if (datatable.selectable) {
// 		datatable.target.insertAdjacentHTML(
// 			"afterbegin",
// 			html`
//           <div class="selected_rows">${table_html}</div>
//           <div class="showBtn expand_y">
//             <div class="btn secondary fill" onclick="${
// 							datatable.name
// 						}.toggleSearchVisibility(true)">Wyszukaj <i class="fas fa-plus"></i> </div>
//           </div>
//           <input type="hidden" class="table-selection-value" name="${
// 						datatable.selectable.output ? datatable.selectable.output : datatable.primary
// 					}" ${datatable.selectable.validate ? `data-validate` : ""}>
//           <div class="has_selected_rows table-search-wrapper ${datatable.selectable ? `expand_y hidden animate_hidden` : ""}">
//             <div class="table-search-container">
//               <div class="btn secondary fill hideBtn" onclick="${
// 								datatable.name
// 							}.toggleSearchVisibility(false)">Ukryj wyszukiwarkę <i class="fas fa-minus"></i> </div>
//               ${above_table_html}${table_html}${below_table_html}
//             </div>
//           </div>
//         `
// 		);

// 		datatable.target
// 			._child(".selected_rows .datatable")
// 			.insertAdjacentHTML("afterend", html`<div class="no-results">Brak powiązanych ${datatable.lang.subject}</div>`);
// 	} else {
// 		datatable.target.insertAdjacentHTML(
// 			"afterbegin",
// 			html`<div class="table-search-wrapper">${above_table_html}${table_html}${below_table_html}</div>`
// 		);
// 	}
// 	datatable.target
// 		._child(".table-search-wrapper .datatable")
// 		.insertAdjacentHTML("afterend", html`<div class="no-results">Brak ${datatable.lang.subject}</div>`);

// 	datatable.searchElement = datatable.target._child(".search-wrapper");
// 	datatable.tableSearchElement = datatable.target._child(".table-search-wrapper");
// 	datatable.tableSelectionElement = datatable.target._child(".selected_rows");
// 	datatable.tableBodyElement = datatable.tableSearchElement._child("tbody");
// 	datatable.total_rowsElement = datatable.target._child(".total-rows");
// 	datatable.paginationElement = datatable.target._child(".pagination");
// 	datatable.bulkMenuElement = datatable.target._child(".bulk_menu");
// 	datatable.paginationBottomElement = datatable.target._child(".pagination-bottom");
// 	datatable.selectionBodyElement = datatable.tableSelectionElement ? datatable.tableSelectionElement._child("tbody") : null;
// 	datatable.selectionValueElement = datatable.target._child(".table-selection-value");

// 	if (datatable.onCreate) datatable.onCreate();

// 	if (datatable.tree_view) {
// 		datatable.breadcrumbElement = datatable.target._child(".breadcrumb");

// 		datatable.getParentId = () => {
// 			if (datatable.breadcrumb.length == 0) return -1;
// 			return datatable.breadcrumb[datatable.breadcrumb.length - 1].category_id;
// 		};
// 		datatable.backToCategory = (category_id = 0) => {
// 			var steps = null;
// 			for (i = 0; i < datatable.breadcrumb.length; i++) {
// 				if (datatable.breadcrumb[i].category_id == category_id) {
// 					steps = datatable.breadcrumb.length - 1 - i;
// 					break;
// 				}
// 			}
// 			datatable.categoryStepBack(steps);
// 		};
// 		datatable.categoryStepBack = (steps) => {
// 			if (steps > 0) {
// 				for (i = 0; i < steps; i++) {
// 					if (datatable.breadcrumb.length > 0) {
// 						datatable.breadcrumb.pop();
// 					}
// 				}
// 				datatable.search();
// 			}
// 		};
// 		datatable.openCategory = (row_id) => {
// 			var row = datatable.results[row_id];
// 			datatable.breadcrumb.push({
// 				title: row.title,
// 				category_id: row.category_id,
// 			});
// 			datatable.search();
// 		};
// 		datatable.showEditCategory = (btn = null, row_id = null, isNew = false) => {
// 			var form_name = datatable.tree_view.form;

// 			var loadCategoryFormCallback = (data) => {
// 				datatable.tree_view.form_data = data;
// 				datatable.tree_view.loadCategoryForm(form_name, data, isNew);

// 				var params = {};
// 				if (!isNew) {
// 					params.data = {
// 						parent_id: {
// 							disable_with_children: [data.category_id],
// 						},
// 					};
// 				}

// 				setFormData({ parent_id: data.parent_id }, `#${form_name}`, params);
// 			};

// 			if (isNew) {
// 				loadCategoryFormCallback({
// 					parent_id: datatable.getParentId(),
// 					category_id: -1,
// 				});
// 			} else {
// 				var category_id = 0;
// 				if (row_id === null) {
// 					category_id = datatable.getParentId();
// 				} else {
// 					var row = datatable.results[row_id];
// 					category_id = row.category_id;
// 				}

// 				var formParams = def(datatable.tree_view.formParams, {});
// 				formParams.category_id = category_id;

// 				xhr({
// 					url: datatable.url,
// 					params: formParams,
// 					success: (res) => {
// 						loadCategoryFormCallback(res.results[0]);
// 						clearAllErrors(`#${form_name}`);
// 						setFormInitialState(`#${form_name}`);
// 					},
// 				});
// 			}

// 			showModal(form_name, { source: btn });
// 		};
// 		datatable.postSaveCategory = (params, remove) => {
// 			var parentChanged = datatable.tree_view.form_data.parent_id != params.parent_id;
// 			var isCurrent = datatable.getParentId() == params.category_id;
// 			if ((remove || parentChanged) && isCurrent) {
// 				datatable.categoryStepBack(1);
// 			} else {
// 				if (isCurrent) {
// 					datatable.breadcrumb[datatable.breadcrumb.length - 1].title = params.title;
// 				}
// 				datatable.search();
// 			}
// 		};
// 	}

// 	if (datatable.width) {
// 		datatable.target.style.maxWidth = datatable.width + "px";
// 		datatable.target.style.marginLeft = "auto";
// 		datatable.target.style.marginRight = "auto";
// 	}

// 	datatable.awaitSearch = function () {
// 		clearTimeout(datatable.awaitId);
// 		datatable.awaitId = setTimeout(function () {
// 			datatable.search();
// 		}, 400);
// 	};

// 	$$(`.${datatable.name} [data-param]`).forEach((e) => {
// 		const onParamsChange = () => {
// 			if (e.tagName == "INPUT") datatable.awaitSearch();
// 			else datatable.search();
// 			filterOrSortChanged();
// 		};
// 		e.addEventListener("input", function () {
// 			onParamsChange();
// 		});
// 		e.addEventListener("change", function () {
// 			onParamsChange();
// 		});
// 	});

// 	datatable.clearFilters = () => {
// 		datatable.filters = [];
// 		clearTableSorting(datatable);
// 		var se = datatable.target._child(`[data-param="search"]`);
// 		if (se) {
// 			se._set_value("");
// 		}
// 		datatable.search();
// 	};

// 	datatable.search = (callback = null, createList = false) => {
// 		clearTimeout(datatable.awaitId);

// 		if (datatable.request) datatable.request.abort();

// 		if (datatable.tree_view) {
// 			// breadcrumb update
// 			var out = "";
// 			var index = -1;
// 			for (let category of datatable.breadcrumb) {
// 				index++;
// 				if (index > 0) out += html`<i class="fas fa-chevron-right"></i> `;
// 				out += html`<div class="${index < datatable.breadcrumb.length - 1 ? "btn subtle" : "current"}" onclick="${
// 					datatable.name
// 				}.backToCategory(${category.category_id})">${category.title}</div>`;
// 			}
// 			if (datatable.breadcrumb.length > 1)
// 				out += html`<div class="btn subtle" onclick="${datatable.name}.showEditCategory(this,null)" style="margin-left:6px"><i class="fa fa-cog"></i></div>`;
// 			datatable.breadcrumbElement.innerHTML = out;
// 		}

// 		var params = {
// 			filters: [],
// 		};
// 		Object.assign(params.filters, [...datatable.filters, ...datatable.fixed_filters]);

// 		if (createList) {
// 			if (datatable.selection) {
// 				params.filters.push({
// 					type: "=",
// 					value: datatable.selection,
// 					field: datatable.primary,
// 				});
// 			}
// 		} else {
// 			if (datatable.params) {
// 				Object.assign(params, datatable.params());
// 			}
// 			if (datatable.requiredParam) {
// 				var x = datatable.requiredParam();
// 				if (x || x === 0) {
// 					params[requiredFilterTables[datatable.db_table]] = x;
// 				}
// 			}
// 			$$(`.${datatable.name} [data-param]`).forEach((e) => {
// 				if (e._parent(".hidden", { inside: datatable.target })) {
// 					return;
// 				}
// 				params[e.getAttribute("data-param")] = e._get_value();
// 			});

// 			if (datatable.selectable) {
// 				params.filters.push({
// 					type: "!=",
// 					value: datatable.selection,
// 					field: datatable.primary,
// 				});
// 			}
// 			if (datatable.tree_view) {
// 				params.parent_id = datatable.getParentId();
// 			}
// 		}

// 		if (datatable.sort) {
// 			params.sort = datatable.sort;
// 		} else {
// 			delete params.sort;
// 		}

// 		var paramsJson = JSON.stringify(params);
// 		if (datatable.lastParamsJson && datatable.lastParamsJson != paramsJson) {
// 			datatable.currPage = 1;
// 		}
// 		datatable.lastParamsJson = paramsJson;

// 		var canOrder = datatable.sortable;
// 		if (canOrder) {
// 			var needsRequired = requiredFilterTables[datatable.db_table];
// 			var hasRequired = false;
// 			Object.entries(params).forEach(([key, value]) => {
// 				if (value && key != "rowCount") {
// 					canOrder = false;
// 				}
// 				if (needsRequired && key == needsRequired) {
// 					hasRequired = true;
// 				}
// 			});
// 			if (needsRequired && !hasRequired) {
// 				canOrder = false;
// 			} else {
// 				canOrder = true;
// 			}

// 			if (datatable.filters.length > 0 || datatable.sort) {
// 				canOrder = false;
// 			}

// 			datatable.target.classList.toggle("noOrder", !canOrder);
// 		}

// 		datatable.request = xhr({
// 			url: datatable.url,
// 			params: {
// 				...params,
// 				pageNumber: datatable.currPage,
// 			},
// 			success: (res) => {
// 				if (createList) {
// 					if (datatable.sortable) {
// 						var r = [];
// 						for (let sel of datatable.selection) {
// 							var row = res.results.find((e) => {
// 								return e[datatable.primary] == sel;
// 							});
// 							if (row) {
// 								r.push(row);
// 							}
// 						}
// 						res.results = r;
// 						//console.log(datatable.selection, res.results);
// 						/*res.results.sort(function(a, b) {
//               return parseFloat(a.price) - parseFloat(b.price);
//             });*/
// 					}

// 					datatable.selectionResults = res.results;
// 				} else {
// 					datatable.page_count = res.page_count;
// 					datatable.results = res.results;
// 				}

// 				var e = datatable.tableSearchElement._child(".no-results");
// 				if (e) {
// 					e.style.display = res.results.length !== 0 ? "none" : "";
// 				}

// 				var output = "";

// 				output = "";
// 				for (i = 0; i < res.results.length; i++) {
// 					var row = res.results[i];
// 					var attr = "";
// 					if (canOrder) attr = "draggable='true'";
// 					output += html`<tr data-index='${i}' ${attr} ${datatable.primary ? `data-primary=${row[datatable.primary]}` : ""}>`;

// 					if (datatable.renderRow) {
// 						var cell = datatable.renderRow(row, i);
// 						output += html`<td>${cell}</td>`;
// 					} else {
// 						for (x = 0; x < datatable.definition.length; x++) {
// 							if (datatable.selectable && x === 0) {
// 								if (createList) {
// 									output += html`<td style="width:33px;text-align:center"> <i class="fas fa-minus-circle" onclick="${
// 										datatable.name
// 									}.removeRow(${row[datatable.primary]})"></i> </td>`;
// 								} else {
// 									output += html`<td style="width:33px;text-align:center"> <i class="fas fa-plus-circle" onclick="${
// 										datatable.name
// 									}.addRow(${row[datatable.primary]})"></i> </td>`;
// 								}
// 								continue;
// 							}

// 							var definition = datatable.definition[x];
// 							var cell_html = "";
// 							if (definition.render) {
// 								cell_html = def(definition.render(row, i, datatable));
// 							} else if (definition.field) {
// 								cell_html = row[definition.field];
// 							}
// 							if (!definition.hasOwnProperty("escape") || definition.escape === true) {
// 								cell_html = escapeHTML(cell_html);
// 							}
// 							output += `<td ${datatable.columnStyles[x]}>${cell_html}</td>`;
// 						}
// 					}
// 					output += "</tr>";
// 				}

// 				if (createList) {
// 					datatable.selectionBodyElement._set_content(output);
// 				} else {
// 					datatable.total_rowsElement._set_content(res.total_rows);
// 					datatable.tableBodyElement._set_content(output);

// 					datatable.paginationElement.style.display = window.innerWidth > 1000 ? "" : "none";

// 					renderPagination(
// 						datatable.paginationElement,
// 						datatable.currPage,
// 						datatable.page_count,
// 						(i) => {
// 							datatable.currPage = i;
// 							datatable.search();
// 						},
// 						{ allow_my_page: true }
// 					);

// 					if (datatable.paginationBottomElement) {
// 						datatable.paginationBottomElement.style.display =
// 							window.innerWidth <= 1000 || datatable.tableBodyElement.getBoundingClientRect().height > window.innerHeight - 100
// 								? ""
// 								: "none";

// 						renderPagination(
// 							datatable.paginationBottomElement,
// 							datatable.currPage,
// 							datatable.page_count,
// 							(i) => {
// 								datatable.currPage = i;
// 								datatable.search();
// 							},
// 							{ allow_my_page: true }
// 						);
// 					}
// 				}

// 				datatable.target._children("td, td *").forEach((e) => {
// 					if (e.offsetWidth < e.scrollWidth) {
// 						var info = e.textContent.replace(/, /g, "<br>").trim();
// 						e.setAttribute("data-tooltip", info);
// 					}
// 				});

// 				if (datatable.selectable && datatable.selectable.has_metadata) {
// 					datatable.registerMetadataFields();
// 				}

// 				if (callback) {
// 					callback(res); // custom
// 				}
// 				if (datatable.onSearch) {
// 					datatable.onSearch(res); // default
// 				}

// 				if (datatable.bulk_menu) {
// 					datatable.bulkEditSelectionChange();
// 				}
// 			},
// 		});
// 	};

// 	datatable.initialSearch = () => {
// 		if (!datatable.hasOwnProperty("nosearch") || datatable.nosearch === false || datatable.selectable) {
// 			datatable.search(() => {
// 				datatable.ready = true;
// 			});
// 		}
// 	};

// 	datatable.createList = (firstLoad) => {
// 		if (firstLoad && datatable.nosearch === true) {
// 			return;
// 		}

// 		datatable.search(() => {
// 			datatable.initialSearch();

// 			if (datatable.selectable && datatable.selectable.has_metadata) {
// 				try {
// 					datatable.metadata.forEach((row_data) => {
// 						var row = datatable.selectionBodyElement._child(`[data-primary="${row_data[datatable.primary]}"]`);
// 						if (row) {
// 							Object.entries(row_data).forEach(([key, value]) => {
// 								var m = row._child(`[data-metadata="${key}"]`);
// 								if (m) {
// 									// let f.e simple-list component be created
// 									setTimeout(() => {
// 										m._set_value(value);
// 									}, 0);
// 								}
// 							});
// 						}
// 					});
// 				} catch (e) {
// 					console.error(e);
// 				}
// 			}

// 			datatable.selectionChange(false);
// 		}, true);
// 	};
// 	if (datatable.selectable) {
// 		datatable.createList(true);
// 	} else {
// 		datatable.initialSearch();
// 	}

// 	datatable.toggleSearchVisibility = (visible) => {
// 		expand($(`.${datatable.name} .showBtn`), !visible);
// 		expand($(`.${datatable.name} .table-search-wrapper`), visible);
// 	};

// 	datatable.removeRow = (data_id) => {
// 		data_id = +data_id;
// 		const index = datatable.selection.indexOf(data_id);
// 		if (index === -1) {
// 			return;
// 		}

// 		datatable.selection.splice(index, 1);

// 		const index2 = datatable.selectionResults
// 			.map((e) => {
// 				return e[datatable.primary];
// 			})
// 			.indexOf(data_id);

// 		datatable.results.push(datatable.selectionResults[index2]);

// 		if (index2 !== -1) {
// 			datatable.selectionResults.splice(index2, 1);
// 		}

// 		datatable.selection.push(data_id);
// 		var x = datatable.target._child(`[data-primary='${data_id}']`);
// 		datatable.tableBodyElement.appendChild(x);
// 		var d = x._child(".fa-minus-circle");
// 		d.outerHTML = d.outerHTML.replace("minus", "plus").replace("removeRow", "addRow");
// 		datatable.selectionChange();
// 	};
// 	datatable.addRow = (data_id) => {
// 		data_id = +data_id;
// 		if (datatable.singleselect && datatable.selection.length > 0) {
// 			datatable.removeRow(datatable.selection[0]);
// 		}
// 		if (datatable.singleselect || datatable.selection.indexOf(data_id) === -1) {
// 			datatable.selectionResults.push(
// 				datatable.results.find((e) => {
// 					return e[datatable.primary] == data_id;
// 				})
// 			);
// 			datatable.selection.push(data_id);
// 			var x = datatable.target._child(`[data-primary='${data_id}']`);
// 			datatable.selectionBodyElement.appendChild(x);
// 			var d = x._child(".fa-plus-circle");
// 			d.outerHTML = d.outerHTML.replace("plus", "minus").replace("addRow", "removeRow");
// 			datatable.selectionChange();
// 		}
// 	};
// 	datatable.selectionChange = (doSearch = true) => {
// 		if (datatable.selectable.has_metadata) {
// 			datatable.registerMetadataFields();
// 		}

// 		var e = datatable.tableSelectionElement._child(".no-results");
// 		if (e) {
// 			e.style.display = datatable.selectionResults.length !== 0 ? "none" : "";
// 		}

// 		if (datatable.selectable.has_metadata) {
// 			var metadata = [];
// 			datatable.selectionBodyElement._children("tr[data-primary]").forEach((e) => {
// 				var row = {};
// 				row[datatable.primary] = parseInt(e.getAttribute("data-primary"));
// 				e._children("[data-metadata]").forEach((m) => {
// 					row[m.getAttribute("data-metadata")] = m._get_value();
// 				});
// 				metadata.push(row);
// 			});
// 			datatable.metadata = metadata;
// 		}

// 		var selection = [];
// 		datatable.selectionBodyElement._children("[data-primary]").forEach((e) => {
// 			selection.push(parseInt(e.getAttribute("data-primary")));
// 		});

// 		datatable.selection = selection;

// 		datatable.selectionValueElement.value = datatable.selectable.has_metadata
// 			? datatable.getSelectedValuesAllString()
// 			: datatable.getSelectedValuesString();

// 		if (doSearch) {
// 			datatable.search();
// 		}

// 		datatable.tableSelectionElement._child(".selected-results-count").innerHTML = datatable.selection.length;

// 		if (datatable.sortable) {
// 			var index = 0;
// 			datatable.selectionBodyElement._children(".kolejnosc").forEach((e) => {
// 				index++;
// 				e.value = index;
// 				e.setAttribute("data-value", index);
// 			});
// 		}

// 		if (datatable.bulk_menu) {
// 			datatable.bulkEditSelectionChange();
// 		}

// 		if (datatable.onSelectionChange) {
// 			datatable.onSelectionChange(datatable.selection, datatable);
// 		}
// 	};
// 	if (datatable.selectable && datatable.selectable.has_metadata) {
// 		datatable.registerMetadataFields = () => {
// 			datatable.selectionBodyElement._children("[data-metadata]").forEach((m) => {
// 				m.oninput = () => {
// 					datatable.selectionChange(false);
// 				};
// 				m.onchange = () => {
// 					datatable.selectionChange(false);
// 				};
// 			});
// 		};
// 	}
// }

// // rearrange start
// var datatableRearrange = {};

// window.addEventListener("dragstart", (event) => {
// 	var target = $(event.target);
// 	if (!target.hasAttribute("draggable")) {
// 		event.preventDefault();
// 		return;
// 	}
// 	if (target.tagName != "TR" || target._parent(".has_selected_rows")) {
// 		return;
// 	}

// 	datatableRearrange.source = target;
// 	datatableRearrange.placeFrom = datatableRearrange.source._child(".kolejnosc").value;

// 	if (datatableRearrange.source && datatableRearrange.source.classList) {
// 		datatableRearrange.source.classList.add("grabbed");
// 	}
// });

// window.addEventListener("dragend", () => {
// 	if (datatableRearrange.source) {
// 		var input = datatableRearrange.source._child(".kolejnosc");
// 		input._set_value(datatableRearrange.placeTo);
// 	}
// 	removeClasses("grabbed");
// 	$$(".tableRearrange").forEach((e) => {
// 		e.remove();
// 	});
// 	datatableRearrange.element = null;
// });

// function rearrange(input) {
// 	var wasIndex = input.getAttribute("data-value");

// 	var datatable = getParentDatatable(input);

// 	var toIndex = input.value;
// 	if (toIndex < 0) toIndex = 0;

// 	if (toIndex === wasIndex) return;

// 	if (datatable.selectable) {
// 		if (toIndex < wasIndex) {
// 			toIndex--;
// 		}
// 		var row2 = datatable.selectionBodyElement._children("tr")[toIndex];
// 		var row1 = input._parent()._parent();
// 		row1._parent().insertBefore(row1, row2);

// 		datatable.selectionChange();
// 		return;
// 	}

// 	if (toIndex < 1) toIndex = 1;

// 	var table = datatable.db_table;
// 	var primary = datatable.primary;
// 	var itemId = input._parent("TR").getAttribute("data-primary");

// 	var params = {
// 		table: table,
// 		primary: primary,
// 		itemId: itemId,
// 		toIndex: toIndex,
// 	};

// 	var required = {};
// 	if (datatable.tree_view) {
// 		required.parent_id = datatable.getParentId();
// 	} else if (datatable.requiredParam) {
// 		var x = datatable.requiredParam();
// 		if (x || x === 0) {
// 			required[requiredFilterTables[datatable.db_table]] = x;
// 		}
// 	}
// 	params["params"] = JSON.stringify(required);

// 	xhr({
// 		url: STATIC_URLS["ADMIN"] + "rearrange_table",
// 		params: params,
// 		success: () => {
// 			showNotification("Zapisano zmianę kolejności", {
// 				one_line: true,
// 				type: "success",
// 			});
// 			datatable.search();
// 		},
// 	});
// }

// window.addEventListener("dragover", (event) => {
// 	if (!event.target) return;
// 	var tr = $(event.target)._parent("tr");
// 	if (!tr) return;

// 	// todo abandon somehow, you don't need it yet, list component will do the job
// 	var nonstatic_parent = tr._scroll_parent();

// 	/*var scroll_parent = tr.findScrollParent();
//   if (scroll_parent === window) {
//     scroll_parent = document.body;
//   }*/

// 	if (!datatableRearrange.element) {
// 		datatableRearrange.element = document.createElement("DIV");
// 		datatableRearrange.element.classList.add("rearrange-splitter");
// 		datatableRearrange.element.style.background = "#5557";
// 		datatableRearrange.element.style.position = "absolute";
// 		nonstatic_parent.appendChild(datatableRearrange.element);
// 	}

// 	if (tr != datatableRearrange.target) {
// 		datatableRearrange.target = tr;
// 	}

// 	if (datatableRearrange.target) {
// 		//var pos = position(datatableRearrange.target);
// 		//var pos = position(datatableRearrange.target);
// 		var rect = datatableRearrange.target.getBoundingClientRect();
// 		var parent_rect = nonstatic_parent.getBoundingClientRect();
// 		var h = 10;

// 		var isAfter = event.offsetY > rect.height / 2;

// 		datatableRearrange.element.style.left = rect.left - parent_rect.left + "px";
// 		datatableRearrange.element.style.top = rect.top - parent_rect.top - h / 2 + isAfter * rect.height + "px";
// 		datatableRearrange.element.style.width = rect.width + "px";
// 		datatableRearrange.element.style.height = h + "px";
// 		datatableRearrange.element.classList.add("tableRearrange");
// 		datatableRearrange.placeTo = +datatableRearrange.target._child(".kolejnosc").value + isAfter * 1;
// 		if (datatableRearrange.placeTo > datatableRearrange.placeFrom) datatableRearrange.placeTo--;
// 	}
// });

// // rearrange end

// // published start

// // TODO: add the rest of params to doc
// /**
//  * @returns {datatableColumnDefinition}
//  */
// function getPublishedDefinition(options = {}) {
// 	return {
// 		title: "",
// 		width: "71px",
// 		className: "center",
// 		render: (r) => {
// 			return renderIsPublished(r);
// 		},
// 		escape: false,
// 		field: def(options.field, "published"),
// 		searchable: "select",
// 		select_single: true,
// 		select_values: [1, 0],
// 		select_labels: ["Publiczny", "Ukryty"],
// 	};
// }

// function renderIsPublished(data) {
// 	var label = "";
// 	var color = "";
// 	if (data.published == 1) {
// 		label = html`<i class="fas fa-eye"></i>`;
// 		color = "#2a2";
// 	} else {
// 		label = html`<i class="fas fa-eye-slash"></i>`;
// 		color = "#a22";
// 	}
// 	return html`<div class='rect btn' style='color:${color}; border: 1px solid ${color}; text-align: center; width: 45px'
//     onclick='setPublish(this,${1 - data.published})'>${label}</div>`;
// }

// function setPublish(obj, published) {
// 	obj = $(obj);
// 	var tableElement = obj._parent(".datatable-wrapper");
// 	var listElement = obj._parent(".simple-list");
// 	if (!tableElement && !listElement) return;

// 	if (listElement) {
// 		var input = obj._parent()._prev();
// 		input._set_value(1 - input._get_value());
// 		return;
// 	}

// 	var tablename = tableElement.getAttribute("data-datatable-name");
// 	if (!tablename) return;
// 	var datatable = window[tablename];
// 	if (!datatable || !datatable.primary || !datatable.db_table) return;
// 	var rowElement = $(obj)._parent("tr");
// 	if (!rowElement) return;
// 	var primary_id = rowElement.getAttribute("data-primary");
// 	if (!primary_id) return;

// 	xhr({
// 		url: STATIC_URLS["ADMIN"] + "set_publish",
// 		params: {
// 			table: datatable.db_table,
// 			primary: datatable.primary,
// 			primary_id: primary_id,
// 			published: published,
// 		},
// 		success: () => {
// 			showNotification(
// 				html`<i class="fas fa-check"></i> Pomyślnie ustawiono element jako <b>${published ? "publiczny" : "ukryty"}</b>`,
// 				{
// 					one_line: true,
// 					type: "success",
// 				}
// 			);
// 			if (obj._parent(".selected_rows")) {
// 				datatable.createList();
// 			} else {
// 				datatable.search();
// 			}
// 		},
// 	});
// }

// // published end

// function datatableSort(btn, column) {
// 	var datatable = getParentDatatable(btn);

// 	if (!datatable) {
// 		return;
// 	}

// 	var was_sort = 0;
// 	if (btn.classList.contains("fa-arrow-up")) {
// 		was_sort = 1;
// 	} else if (btn.classList.contains("fa-arrow-down")) {
// 		was_sort = -1;
// 	}

// 	clearTableSorting(datatable, btn);

// 	var sort = 0;
// 	if (was_sort === 0) {
// 		sort = -1;
// 	} else if (was_sort === -1) {
// 		sort = 1;
// 	} else if (was_sort === 1) {
// 		sort = 0;
// 	}

// 	if (sort === 0) {
// 		btn.classList.add("fa-sort");
// 		btn.classList.add("primary");
// 	} else if (sort === 1) {
// 		btn.classList.add("fa-arrow-up");
// 		btn.classList.add("secondary");
// 	} else if (sort === -1) {
// 		btn.classList.add("fa-arrow-down");
// 		btn.classList.add("secondary");
// 	}

// 	if (sort !== 0) {
// 		datatable.sort = (sort === 1 ? "+" : "-") + column;
// 	} else {
// 		datatable.sort = null;
// 	}
// 	datatable.search();

// 	filterOrSortChanged();
// }

// function clearTableSorting(datatable, exceptBtn = null) {
// 	datatable.sort = null;
// 	datatable.target._children(".datatable-sort-btn").forEach((e) => {
// 		e.classList.remove("fa-sort");
// 		e.classList.remove("fa-arrow-up");
// 		e.classList.remove("fa-arrow-down");

// 		e.classList.remove("primary");
// 		e.classList.remove("secondary");

// 		if (e !== exceptBtn) {
// 			e.classList.add("fa-sort");
// 			e.classList.add("primary");
// 		}
// 	});
// }

// function datatableFilter(btn, column_id) {
// 	filtersChanged();

// 	var datatable = getParentDatatable(btn);

// 	if (!datatable) {
// 		return;
// 	}

// 	var col_def = datatable.definition[column_id];
// 	var filters = col_def.searchable;

// 	var menu_header = "";
// 	var menu_body = "";

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

// 	var menu_footer = html`<div class='filter_menu_footer'>
//         <button class="btn primary fill" style='margin-right:5px' onclick='setFilters(${datatable.name},${column_id})'>Szukaj <i class="fas fa-check"></i></button>
//         <button class="btn secondary fill" onclick='removeFilters(${datatable.name},${column_id})'>Wyczyść <i class="fas fa-times"></i></button>
//     </div>`;

// 	if (col_def.renderSearch) {
// 		menu_body = col_def.renderSearch(menu_body);
// 	}

// 	if (IS_TOUCH_DEVICE) {
// 		setModalTitle("#filter_menu", "Filtruj " + col_def.title.toLowerCase());
// 		filter_menu._set_content(html`<span class="label">${menu_header}</span>${menu_body}${menu_footer}`);
// 		showModal("filter_menu", {
// 			source: btn,
// 		});
// 	} else {
// 		if (menu_header) {
// 			menu_html = html`<span class='label header first'>${menu_header}</span>${menu_body}${menu_footer}`;
// 		}
// 		filter_menu._set_content(menu_html);
// 		filter_menu.style.display = "block";

// 		var nonstatic_parent = datatable.target._scroll_parent();

// 		nonstatic_parent.appendChild(filter_menu);

// 		const pos = nodePositionAgainstScrollableParent(btn);

// 		const edge = 20;

// 		filter_menu.style.left =
// 			clamp(
// 				edge,
// 				pos.relative_pos.left + (btn.clientWidth - filter_menu.clientWidth) / 2,
// 				nonstatic_parent.clientWidth - edge - filter_menu.clientWidth
// 			) + "px";

// 		filter_menu.style.top =
// 			clamp(edge, pos.relative_pos.top + btn.clientHeight, nonstatic_parent.scrollHeight - edge - filter_menu.clientHeight) + "px";

// 		btn._parent("th").classList.add("datatable-column-highlighted");
// 	}

// 	registerDatepickers();

// 	var date_range_picker = $(".date_range_picker");
// 	if (date_range_picker) {
// 		createDateRangePicker(date_range_picker);
// 	}

// 	// set values in the filter form

// 	var filter_value = null;

// 	var current_filter = datatable.filters.find((e) => {
// 		return e.field == col_def.field;
// 	});

// 	if (current_filter) {
// 		filter_value = current_filter.value;
// 	}

// 	if (filter_value !== null) {
// 		if (col_def.searchable == "select") {
// 			filter_menu._children(`input[type='checkbox']`).forEach((e) => {
// 				if (filter_value.indexOf(e.value) != -1) {
// 					e._set_value(1);
// 				}
// 			});
// 		} else if (col_def.searchable == "date") {
// 			filter_menu._child(".date_type")._set_value(current_filter.type);
// 			if (current_filter.type == "<>") {
// 				$(".date_range_picker .start")._set_value(filter_value[0]);
// 				$(".date_range_picker .end")._set_value(filter_value[1]);
// 			} else {
// 				$(".default_datepicker")._set_value(filter_value);
// 			}
// 		} else {
// 			var exact = current_filter.type != "%";
// 			if (!exact && filter_value.length >= 2) {
// 				filter_value = filter_value.substring(1, filter_value.length - 1);
// 			}
// 			filter_menu._child(`[name='exact']`)._set_value(exact);
// 			filter_menu._child(`.field`)._set_value(filter_value);
// 		}
// 	}
// }

// function filterCheckboxChanged(checkbox, select_single) {
// 	if (select_single) {
// 		filter_menu._children(`input[type="checkbox"]`).forEach((e) => {
// 			if (e != checkbox) {
// 				e._set_value(0, { quiet: true });
// 			}
// 		});
// 	}
// }

// function dateTypeChanged(select) {
// 	var isRange = false;
// 	if (select._get_value() == "<>") {
// 		isRange = true;
// 	}

// 	filter_menu._child(".singledate_wrapper").classList.toggle("hidden", isRange);
// 	filter_menu._child(".date_range_picker").classList.toggle("hidden", !isRange);
// }

// domload(() => {
// 	if (IS_TOUCH_DEVICE) {
// 		registerModalContent(html`
//             <div id="filter_menu">
//                 <div class="modal-body">
//                     <div class="custom-toolbar">
//                         <span class="title"></span>
//                         <div class="btn secondary" onclick="hideParentModal(this)">Zamknij <i class="fas fa-times"></i></div>
//                     </div>
//                     <div class="menu_body"></div>
//                 </div>
//             </div>
//         `);

// 		window.filter_menu = $("#filter_menu .menu_body");
// 	} else {
// 		document.body.insertAdjacentHTML("beforeend", html`<div class='filter_menu'></div>`);

// 		window.filter_menu = $(".filter_menu");

// 		window.addEventListener("click", (e) => {
// 			var hide = true;
// 			var btn = $(e.target)._parent(".datatable-search-btn", { skip: 0 });
// 			if (btn) {
// 				hide = false;
// 			} else {
// 				if ($(e.target)._parent(".filter_menu")) {
// 					hide = false;
// 				}
// 			}

// 			if (hide) {
// 				filtersChanged(true);
// 			}
// 		});
// 	}

// 	filter_menu.addEventListener("keydown", (e) => {
// 		if (e.key === "Enter") {
// 			var action = filter_menu._child(".filter_menu_footer .primary");
// 			if (action) {
// 				action.click();
// 			}
// 		}
// 	});
// });

// function setFilters(datatable, column_id) {
// 	var col_def = datatable.definition[column_id];

// 	removeFilterByField(datatable, col_def.field);

// 	if (col_def.searchable == "select") {
// 		var values = [];
// 		filter_menu._children(`input[type='checkbox']`).forEach((e) => {
// 			if (e.checked) {
// 				values.push(e.value);
// 			}
// 		});
// 		if (values.length > 0) {
// 			datatable.filters.push({
// 				field: col_def.field,
// 				type: "=",
// 				value: values,
// 			});
// 		}
// 	} else if (col_def.searchable == "date") {
// 		var date_type = filter_menu._child(".date_type")._get_value();

// 		if (date_type == "<>") {
// 			datatable.filters.push({
// 				field: col_def.field,
// 				type: date_type,
// 				value: [
// 					reverseDateString($(".date_range_picker .start")._get_value(), "-"),
// 					reverseDateString($(".date_range_picker .end")._get_value(), "-"),
// 				],
// 			});
// 		} else {
// 			datatable.filters.push({
// 				field: col_def.field,
// 				type: date_type,
// 				value: reverseDateString($(".default_datepicker")._get_value(), "-"),
// 			});
// 		}
// 	} else {
// 		var value = filter_menu._child(`.field`)._get_value();
// 		var exact = filter_menu._child(`[name='exact']`)._get_value();

// 		if (value || exact) {
// 			if (!exact) {
// 				value = `%${value}%`;
// 			}
// 			datatable.filters.push({
// 				field: col_def.field,
// 				type: exact ? "=" : "%",
// 				value: value,
// 			});
// 		}
// 	}

// 	filtersChanged(true);

// 	datatable.search();
// }

// function removeFilterByField(datatable, field) {
// 	var current_filter_index = datatable.filters
// 		.map((e) => {
// 			return e.field;
// 		})
// 		.indexOf(field);

// 	if (current_filter_index != -1) {
// 		datatable.filters.splice(current_filter_index, 1);
// 	}
// }

// function removeFilters(datatable, column_id) {
// 	var col_def = datatable.definition[column_id];

// 	removeFilterByField(datatable, col_def.field);

// 	filtersChanged(true);

// 	datatable.search();
// }

// function filtersChanged(hide = false) {
// 	if (hide) {
// 		if (IS_TOUCH_DEVICE) {
// 			hideModal("filter_menu");
// 		} else {
// 			filter_menu.style.display = "none";
// 		}
// 	}

// 	removeClasses("datatable-column-highlighted");

// 	$$(".datatable-wrapper").forEach((datatableElem) => {
// 		var datatable = window[datatableElem.getAttribute("data-datatable-name")];
// 		datatable.tableSearchElement._children(".datatable-search-btn").forEach((elem) => {
// 			var field = elem.getAttribute("data-field");
// 			var active = !!datatable.filters.find((e) => {
// 				return e.field == field;
// 			});

// 			elem.classList.toggle("secondary", active);
// 			elem.classList.toggle("primary", !active);
// 		});
// 	});

// 	filterOrSortChanged();
// }

// function filterOrSortChanged() {
// 	$$(".datatable-wrapper").forEach((datatableElem) => {
// 		var datatable = window[datatableElem.getAttribute("data-datatable-name")];

// 		var search_value = "";
// 		var se = datatableElem._child(`[data-param="search"]`);
// 		if (se) {
// 			search_value = se._get_value();
// 		}

// 		datatableElem
// 			._child(".clear-filters-btn")
// 			.classList.toggle("hidden", datatable.filters.length === 0 && !datatable.sort && !search_value);
// 	});
// }

// function getParentDatatable(node) {
// 	node = $(node);
// 	var tableNode = node._parent(".datatable-wrapper");
// 	if (!tableNode) return null;
// 	var tablename = tableNode.getAttribute("data-datatable-name");
// 	if (!tablename) return null;
// 	var datatable = window[tablename];

// 	return datatable;
// }

// function selectFilterCheckboxes(values) {
// 	filter_menu._children(`input[type='checkbox']`).forEach((e) => {
// 		e._set_value(values.indexOf(+e.value) != -1 ? 1 : 0);
// 	});
// }