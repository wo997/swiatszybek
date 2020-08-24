/* js[global] */
window.addEventListener("load", function () {
  if ("ontouchstart" in window) {
    var expandable = document.getElementsByClassName("expandable");
    for (i = 0; i < expandable.length; i++) {
      expandable[i].insertAdjacentHTML(
        "beforeend",
        `<button type='button' class='drop-arrow' onclick='return mobileDrop(this);'></button>`
      );
    }
  }
});

function mobileDrop(obj) {
  obj = obj.parent().parent();
  if (obj.className == "") {
    obj.className = "mobile-drop";
  } else {
    obj.className = "";
  }
  return false;
}

function expandWithArrow(elem, source, options = {}) {
  source.classList.toggle("open", expand(elem, null, options));
}

function expand(elem, show = null, options = {}) {
  if (show === null) show = elem.classList.contains("hidden");
  if (show ^ elem.classList.contains("hidden")) return;
  var duration =
    options.duration || options.duration === 0 ? options.duration : 250;
  var h = elem.scrollHeight;

  elem.style.transition = "";
  elem.style.height = (!show ? h : 0) + "px";

  var firstChild = elem.children ? elem.children[0] : null;
  if (firstChild) {
    firstChild.style.transition = "0s all";
    //firstChild.style.marginTop = -(show ? h * 0.15 : 0) + "px";
  }
  setTimeout(() => {
    elem.style.transition = `opacity ${
      duration / (show ? 500 : 1000)
    }s, height ${duration / 1000}s, padding ${duration / 1000}s`;
    elem.style.height = (show ? h : 0) + "px";
    elem.classList.toggle("hidden", !show);
    elem.scrollTop = 0;

    if (firstChild) {
      firstChild.style.transition = `margin-top ${
        duration / (show ? 500 : 1000)
      }s`;
      //firstChild.style.marginTop = -(!show ? h * 0.15 : 0) + "px";
    }
  }, 0);
  setTimeout(() => {
    elem.style.transition = ``;
    elem.style.height = "";

    if (firstChild) {
      firstChild.style.transition = ``;
      //firstChild.style.marginTop = "";
    }
  }, duration);
  return show;
}

function performSearch(form) {
  var s = form.search.value.replace(/[ /]/g, "_");
  if (s.length > 35) s = s.substring(0, 35);
  window.location = "/szukaj/" + s;
}

window.addEventListener("DOMContentLoaded", () => {
  $$("nav a").forEach((a) => {
    href = a.getAttribute("href");
    if (href == "/") {
      if (location.pathname == "/") {
        a.classList.add("current-route");
      }
    } else if (location.pathname.indexOf(href) === 0) {
      a.classList.add("current-route");
    } else if (location.href.indexOf(href) === 0) {
      a.classList.add("current-route");
    }
  });

  $$(".expandClick").forEach((e) => {
    e.find(".expandHeader").addEventListener("click", () => {
      e.classList.toggle("expanded");
    });
  });
});

window.mobilecheck = function () {
  var check = false;
  (function (a) {
    if (
      /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(
        a
      ) ||
      /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(
        a.substr(0, 4)
      )
    )
      check = true;
  })(navigator.userAgent || navigator.vendor || window.opera);
  return check;
};

function dateToString(d, type = "") {
  var mon = d.getMonth() + 1;
  var day = d.getDate();

  if (mon < 10) mon = "0" + mon;
  if (day < 10) day = "0" + day;

  return type == "dmy"
    ? day + "-" + mon + "-" + d.getFullYear()
    : d.getFullYear() + "-" + mon + "-" + day;
}

function reverseDateString(dateString, splitter) {
  return dateString.split(splitter).reverse().join(splitter);
}

function xhr(data) {
  var xhr = new XMLHttpRequest();
  xhr.open("POST", data.url, true);
  xhr.setRequestHeader("enctype", "multipart/form-data");
  xhr.onload = function () {
    if (data.success) {
      var res = xhr.responseText;
      data.type = nonull(data.type, "json");
      if (data.type == "json") {
        try {
          res = JSON.parse(res);
        } catch {}
      }
      data.success(res);
    }
  };

  var formData = data.formData ? data.formData : new FormData();
  if (data.params) {
    for (var [key, value] of Object.entries(data.params)) {
      if (typeof value === "object" && value !== null) {
        value = JSON.stringify(value);
      }
      formData.append(key, value);
    }
  }
  xhr.send(formData);
  return xhr;
}

function ajax(url, data, good, wrong) {
  // deprecated
  var xhr = new XMLHttpRequest();
  xhr.open("POST", url, true);
  xhr.setRequestHeader("enctype", "multipart/form-data");
  xhr.onload = function () {
    good(xhr.responseText);
  };
  var formData = new FormData();
  for (const [key, value] of Object.entries(data)) {
    formData.append(key, value);
  }
  xhr.send(formData);
}

window.addEventListener("DOMContentLoaded", scaleVideos);
window.addEventListener("resize", scaleVideos);
function scaleVideos() {
  $$("iframe.ql-video").forEach((e) => {
    var h = Math.round(0.56 * e.getBoundingClientRect().width);
    if (h > 500) h = 500;
    e.style.height = h + "px";
  });
}

function nonull(value, defaultValue = "") {
  if (value === null || value === undefined) return defaultValue;
  return value;
}

function delay(action, time, context = window) {
  if (context["await" + action]) clearTimeout(context["await" + action]);
  context["await" + action] = setTimeout(function () {
    context[action](true);
  }, time);
}

function removeNode(n) {
  n = $(n);
  if (!n) {
    return;
  }
  if (n.parent()) n.parent().removeChild(n);
}

function removeContent(node) {
  while (true) {
    var first = node.firstChild;
    if (!first) return;
    node.removeChild(first);
  }
}

function setContent(node, html = "") {
  removeContent(node);
  node.insertAdjacentHTML("afterbegin", html);
}

function addMissingDirectChildren(
  parent,
  isMissingCallback,
  html,
  position = "beforeend"
) {
  if (!$(parent).directChildren().find(isMissingCallback)) {
    parent.insertAdjacentHTML(position, html);
  }
}

function swapNodes(a, b) {
  if (!a || !b) return;

  var aParent = a.parentNode;
  var bParent = b.parentNode;

  var aHolder = document.createElement("div");
  var bHolder = document.createElement("div");

  aParent.replaceChild(aHolder, a);
  bParent.replaceChild(bHolder, b);

  aParent.replaceChild(b, aHolder);
  bParent.replaceChild(a, bHolder);
}

function toggleBodyScroll(disable) {
  if (!window.tempScrollTop) {
    window.tempScrollTop = window.pageYOffset;
  }
  if (disable) {
    document.body.classList.add("disable-scroll");
    document.body.style.top = `-${window.tempScrollTop}px`;
  } else {
    document.body.classList.remove("disable-scroll");
    document.body.style.top = `0px`;
    window.scrollTo({ top: window.tempScrollTop });
    window.tempScrollTop = null;
  }
}

function stopAllVideos() {
  var videos = $$("video");
  for (video of videos) {
    video.pause();
  }
}

function fallbackCopyTextToClipboard(text) {
  var textArea = document.createElement("textarea");
  textArea.value = text;

  // Avoid scrolling to bottom
  textArea.style.top = "0";
  textArea.style.left = "0";
  textArea.style.position = "fixed";

  console.log(textArea);
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();

  try {
    var successful = document.execCommand("copy");
    var msg = successful ? "successful" : "unsuccessful";
    console.log("Fallback: Copying text command was " + msg);
  } catch (err) {
    console.error("Fallback: Oops, unable to copy", err);
  }

  document.body.removeChild(textArea);
}
function copyTextToClipboard(text) {
  fallbackCopyTextToClipboard(text); // feels safe
  /*if (!navigator.clipboard) {
    console.log(123456);
    fallbackCopyTextToClipboard(text);
    return;
  }
  navigator.clipboard.writeText(text).then(function() {
    console.log('Async: Copying to clipboard was successful!');
  }, function(err) {
    console.error('Async: Could not copy text: ', err);
  });*/
}

function position(elem) {
  //findParentByStyle(elem,"position","absolute");

  var left = 0,
    top = 0;

  do {
    left += elem.offsetLeft;
    top += elem.offsetTop;
  } while ((elem = elem.offsetParent));

  //console.log()
  /*{
    console.log(elem.style.top);
  }*/

  return { left: left, top: top };

  /*var doc = document.documentElement;
  var window_left = (window.pageXOffset || doc.scrollLeft) - (doc.clientLeft || 0);
  var window_top = (window.pageYOffset || doc.scrollTop)  - (doc.clientTop || 0);

  return { left: left - window_left, top: top - window_top };*/
}

function positionWithOffset(elem, offsetX, offestY) {
  var pos = position(elem);
  var rect = elem.getBoundingClientRect();
  return {
    left: pos.left + offsetX * rect.width,
    top: pos.top + offestY * rect.height,
  };
}

function scrollToElement(elem, options = {}) {
  if (!elem) return;
  var rect = elem.getBoundingClientRect();
  var diff =
    (options.parent ? position(elem) : rect).top - nonull(options.offset, 0);
  if (options.parent) {
    diff -= options.parent.scrollTop;
  }
  if (!options.top) {
    diff += (rect.height - window.innerHeight) * 0.5;
  }
  var sag = nonull(options.sag, 100);
  if (Math.abs(diff) > sag) {
    diff -= sag * Math.sign(diff);
    scrollFromTo(options.parent, diff, nonull(options.duration, 50));
  }
}
function scrollFromTo(parent, diff, time, t = 0) {
  if (time < 2) {
    time = 2;
  }
  var d = (4 * diff * (time / 2 - Math.abs(time / 2 - t))) / (time * time);
  if (parent) parent.scrollTop += d;
  else window.scrollBy(0, d);

  if (t < time)
    window.requestAnimationFrame(function () {
      scrollFromTo(parent, diff, time, t + 1);
    });
}

function getWindowScroll() {
  var doc = document.documentElement;
  var left = (window.pageXOffset || doc.scrollLeft) - (doc.clientLeft || 0);
  var top = (window.pageYOffset || doc.scrollTop) - (doc.clientTop || 0);
  return { left: left, top: top };
}

// table start

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

function findParentByAttribute(
  elem,
  parentAttribute,
  parentAttributeValue = null
) {
  elem = $(elem);
  while (elem && elem != document) {
    if (parentAttributeValue) {
      if (elem.getAttribute(parentAttribute) == parentAttributeValue) {
        return elem;
      }
    } else {
      if (elem.hasAttribute(parentAttribute)) {
        return elem;
      }
    }
    elem = elem.parent();
  }
  return null;
}

function findParentByTagName(elem, parentTagName) {
  elem = $(elem);
  while (elem && elem != document) {
    if (elem.tagName == parentTagName) {
      return elem;
    }
    elem = elem.parent();
  }
  return null;
}

function findParentById(elem, id) {
  elem = $(elem);
  while (elem && elem != document) {
    if (elem.id == id) {
      return elem;
    }
    elem = elem.parent();
  }
  return null;
}

function findParentByClassName(elem, parentClassNames, stopAtClassName = null) {
  elem = $(elem);
  while (elem && elem != document) {
    if (stopAtClassName && elem.classList.contains(stopAtClassName)) {
      return null;
    }
    if (Array.isArray(parentClassNames)) {
      for (c of parentClassNames) {
        if (elem.classList && elem.classList.contains(c)) {
          return elem;
        }
      }
    } else {
      if (elem.classList && elem.classList.contains(parentClassNames)) {
        return elem;
      }
    }

    elem = elem.parent();
  }
  return null;
}
function findParentByStyle(elem, style, value) {
  elem = $(elem);
  while (elem && elem != document) {
    if (elem.style[style] == value) {
      return elem;
    }
    elem = elem.parent();
  }
  return null;
}
function findParentByComputedStyle(elem, style, value, invert = false) {
  elem = $(elem);

  while (elem && elem != document) {
    var computedStyle = window.getComputedStyle(elem)[style];
    if (invert) {
      if (computedStyle != value) {
        return elem;
      }
    } else {
      if (computedStyle == value) {
        return elem;
      }
    }
    elem = elem.parent();
  }
  return null;
}
function findScrollableParent(elem) {
  elem = $(elem);

  while (elem && elem != document.body) {
    var overflowY = window.getComputedStyle(elem)["overflow-y"];
    if (overflowY === "scroll" || overflowY === "auto") {
      return elem;
    }
    elem = elem.parent();
  }
  return null;
}
function isInNode(elem, parent) {
  elem = $(elem);
  while (elem && elem != document) {
    if (elem == parent) {
      return true;
    }
    elem = elem.parent();
  }
  return false;
}

function removeClasses(className, selector = null) {
  if (selector === null) selector = `.${className}`;
  $$(selector).forEach((e) => {
    e.classList.remove(className);
  });
}

// table end

function escapeHTML(unsafeText) {
  let div = document.createElement("div");
  div.innerText = unsafeText;
  return div.innerHTML;
}

function decodeHtmlEntities(html) {
  var txt = document.createElement("textarea");
  txt.innerHTML = html;
  return txt.value;
}

function renderStatus(status_id) {
  // kernel.php
  return `<div class='rect status_rect' style='background:#${statusList[status_id]["color"]}'>${statusList[status_id]["title"]}</div>`;
}

// modal start

window.addEventListener("DOMContentLoaded", function () {
  registerModals();
});
function registerModals() {
  $$("[data-modal]").forEach((e) => {
    registerModal(e);
  });
}

function registerModalContent(html, callback) {
  if (!document.body) {
    window.addEventListener("DOMContentLoaded", function () {
      registerModalContent(html, callback);
      return;
    });
  }

  try {
    var div = document.createElement("DIV");
    div.insertAdjacentHTML("afterbegin", html);
    var modal = div.children[0];
    if ($("#" + modal.id)) throw "modal defined already";
    modal.setAttribute("data-modal", "true");
    registerModal(modal);
    if (callback) callback();
  } catch (e) {
    console.warn(e);
  }
}

function registerModal(e) {
  $("#modal-wrapper .modal-content").appendChild(e);
  e.style.display = "none";

  registerSelectboxes();
}

var modalHideCallbacks = {};
var modalInitialStates = {};

function setModalInitialState(name) {
  modalInitialStates[name] = getFormData($(`#${name}`));
}

function showModal(name = null, params = {}) {
  setModalInitialState(name);
  modalHideCallbacks[name] = params.hideCallback;

  var m = $("#modal-wrapper");
  var visible = name != null;
  m.classList.toggle("displayModal", visible);
  if (visible) {
    var total = 0;
    m.findAll(".modal-content > *").forEach((e) => {
      var shownow = false;
      if (e.id == name && e.style.display == "none") {
        e.style.display = "";
        shownow = true;
      }
      if (e.style.display != "none") total++;

      if (shownow) {
        var node = e;
        m.find(".modal-content").appendChild(node);
        if (params.source) {
          var r = params.source.getBoundingClientRect();
          var p = $(".modal-content").getBoundingClientRect();
          var x = 1 * (r.left - p.left) + r.width / 2;
          var y = 1 * (r.top - p.top) + r.height / 2;
          node.style.transformOrigin = `${x}px ${y}px`;
        } else node.style.transformOrigin = ``;
        node.style.transition = "0s";
        node.style.transform = "scale(0.5)";
        e.style.opacity = 0;
        setTimeout(() => {
          e.style.opacity = 1;
          node.style.transition = "";
          node.style.transform = "";
        }, 0);
      }
    });
    var modal = $(`#${name}`);
    if (modal.hasAttribute("data-expand")) {
      var q = $(`#${name} > div`);
      if (window.innerWidth >= 800) {
        if (modal.getAttribute("data-expand") == "large") total--;
        q.classList.toggle("pad0", total == 0);
        q.classList.toggle("pad1", total == 1);
        q.classList.toggle("pad2", total == 2);
        q.classList.toggle("pad3", total >= 3);
      } else {
        q.classList.toggle("pad0", false);
        q.classList.toggle("pad1", false);
        q.classList.toggle("pad2", false);
        q.classList.toggle("pad3", false);
      }
    }
  }

  toggleBodyScroll(visible);

  return visible;
}

function hideAllModals() {
  $$("#modal-wrapper .modal-content > *").forEach((e) => {
    hideModal(e.id);
  });

  toggleBodyScroll(true);
}

function hideModalTopMost() {
  var o = $$("#modal-wrapper .modal-content > *");
  for (i = o.length - 1; i >= 0; i--) {
    var modal = o[i];
    if (modal.style.display != "none") {
      hideModal(modal ? modal.id : null);
      break;
    }
  }
}

function hideParentModal(obj = null, isCancel = false) {
  if (obj) {
    var modal = findParentByAttribute(obj, "data-modal");
    hideModal(modal ? modal.id : null, isCancel);
  }
  hideModal(null);
}

function hideModal(name, isCancel = false) {
  var m = $("#modal-wrapper");

  if (name) {
    if (isCancel) {
      var wasState = modalInitialStates[name];
      var nowState = getFormData($(`#${name}`));

      if (JSON.stringify(wasState) !== JSON.stringify(nowState)) {
        if (
          !confirm(
            "Wprowadzone zmiany zostaną usunięte, czy chcesz je anulować?"
          )
        ) {
          return;
        }
      }
    }

    var modal = $(`#${name}`);
    if (modal) {
      modal.style.animation = "fadeOut 0.4s";
      visibleModalCount--;
      setTimeout(() => {
        modal.style.display = "none";
        modal.style.animation = "";
      }, 200);
    }

    modal.findAll("[data-validate]").forEach((e) => {
      if (e.classList.contains("required")) {
        e.removeEventListener("input", checkRemoveRequired);
        e.removeEventListener("change", checkRemoveRequired);
        e.classList.remove("required");
      }
    });

    const hideCallback = modalHideCallbacks[name];
    if (hideCallback) {
      hideCallBack();
    }
    // TODO: add cms hidecallback in cms
  }

  var visibleModalCount = 0;
  m.findAll(".modal-content > *").forEach((e) => {
    if (e.style.display == "" && e.style.animation == "") visibleModalCount++;
  });

  if (visibleModalCount > 0) {
    m.classList.add("displayModal");
  } else {
    toggleBodyScroll(false);
    m.style.animation = "fadeOut 0.4s";
    setTimeout(() => {
      m.classList.remove("displayModal");
      m.style.animation = "";
    }, 200);
  }
}

function isModalActive(name) {
  var next = $(`#${name}`);
  var anythingAbove = false;
  while (true) {
    next = next.next();
    if (!next) {
      break; // top most :)
    }
    var nextVisible = next.style.display == "";
    if (nextVisible) {
      anythingAbove = true;
      break;
    }
  }
  return !anythingAbove;
}

// modal end

function $(node, parent = null) {
  if (!node) return null;
  if (node.find) return node; // already initialized

  if (parent === null) {
    parent = document;
  }

  // query selector or html node
  node = typeof node == "string" ? parent.querySelector(node) : node;
  if (!node) return null;
  node.find = (query) => {
    return $(query, node);
  };
  node.findAll = (query) => {
    return $$(query, node);
  };
  node.setValue = (value, quiet = false) => {
    setValue(node, value, quiet);
  };
  node.getValue = () => {
    return getValue(node);
  };
  node.next = () => {
    // TODO parameter includeTextNodes
    return $(node.nextElementSibling);
  };
  node.prev = () => {
    return $(node.previousElementSibling);
  };
  node.parent = () => {
    return $(node.parentNode);
  };
  node.directChildren = () => {
    var res = [];
    [...node.children].forEach((node) => {
      res.push($(node));
    });
    return res;
  };
  /*node.children = () => {
    return $(node.parentNode);
  };*/

  node.findParentByAttribute = (
    parentAttribute,
    parentAttributeValue = null
  ) => {
    return window.findParentByAttribute(
      node,
      parentAttribute,
      parentAttributeValue
    );
  };

  node.findParentByTagName = (parentAttribute, parentAttributeValue = null) => {
    return window.findParentByTagName(
      node,
      parentAttribute,
      parentAttributeValue
    );
  };

  node.findParentById = (id) => {
    return window.findParentById(node, id);
  };

  node.findParentByStyle = (style, value) => {
    return window.findParentByStyle(node, style, value);
  };

  node.findParentByComputedStyle = (style, value) => {
    return window.findParentByComputedStyle(node, style, value);
  };

  node.findScrollableParent = () => {
    return window.findScrollableParent(node);
  };

  node.findParentByClassName = (parentClassNames, stopAtClassName = null) => {
    return window.findParentByClassName(
      node,
      parentClassNames,
      stopAtClassName
    );
  };

  node.isInNode = (parent) => {
    return window.isInNode(node, parent);
  };

  node.remove = () => {
    return window.removeNode(node);
  };

  node.empty = () => {
    return window.removeContent(node);
  };

  node.setContent = (html = "") => {
    return window.setContent(node, html);
  };

  return node;
}
function $$(querySelectorAll, parent = null) {
  if (parent === null) {
    parent = document;
  }
  var group = parent.querySelectorAll(querySelectorAll);
  var res = [];
  group.forEach((node) => {
    res.push($(node));
  });
  return res;
}

// validate start

function markFieldWrong(field, errors = null) {
  // look inside or above
  var field_title = field.find(".field-title");
  if (!field_title) {
    var previousNode = field.prev();
    if (previousNode && previousNode.classList.contains("field-title")) {
      field_title = previousNode;
    }
  }
  if (!field_title) {
    var field_wrapper = field.findParentByClassName("field-wrapper");
    if (field_wrapper) {
      field_title = field_wrapper.find(".field-title");
    }
  }
  if (!field_title) {
    return;
  }

  var warning = field_title.find(".fa-exclamation-triangle");
  if (warning) {
    warning.remove();
  }

  if (Array.isArray(errors) && errors.length > 0) {
    var warning = field_title.find(".fa-exclamation-triangle");
    if (warning) {
      warning.remove();
    }

    field_title.insertAdjacentHTML(
      "beforeend",
      `<i
        class="fas fa-exclamation-triangle"
        style="color: red;transform: scale(1.25);margin-left:4px"
        data-tooltip="${errors.join("<br>")}">
      </i>`
    );

    if (!field.classList.contains("required")) {
      field.addEventListener("input", checkRemoveRequired);
      field.addEventListener("change", checkRemoveRequired);
      field.classList.add("required");
    }
  } else {
    if (field.classList.contains("required")) {
      field.removeEventListener("input", checkRemoveRequired);
      field.removeEventListener("change", checkRemoveRequired);
      field.classList.remove("required");
    }
  }
}

function validateForm(params) {
  var elem = params.form ? params.form : document;

  var fields = elem.findAll("[data-validate]");
  for (field of fields) {
    if (params.hiddenClassList) {
      // if any parant has a class like one of these ignore that field
      var found = false;
      if (field.findParentByClassName(params.hiddenClassList)) {
        found = true;
        break;
      }
      if (found) continue;
    }
    if (field.findParentByClassName("hidden")) continue;

    var valid = validateField(field);
    markFieldWrong(field, valid);
    if (valid !== true) {
      scrollToView(field, {
        callback: () => {
          field.focus();
        },
      });
      return false;
    }
  }

  return true;
}

function toggleFieldCorrect(field, correct) {
  var ok = field.parent().find(".correct");
  if (ok) ok.style.display = correct === true ? "block" : "";
  var wrong = field.parent().find(".wrong");
  if (wrong) wrong.style.display = correct === true ? "" : "block";
}

function validateSize(valLen, condition, message) {
  var lengthInfo = "";
  if (condition.indexOf("+") > 0) {
    var minLen = condition.replace("+", "");
    if (valLen < minLen) {
      lengthInfo = `min. ${minLen}`;
    }
  } else if (/\d-\d/.test(condition)) {
    var [from, to] = condition.split("-");
    if (valLen < from || valLen > to) {
      lengthInfo = `${from}-${to}`;
    }
  } else {
    var reqLen = condition;
    if (valLen != reqLen) {
      lengthInfo = reqLen;
    }
  }
  if (lengthInfo) {
    return message(lengthInfo);
  }
  return true;
}

function validateField(field) {
  field = $(field);

  var errors = [];
  var newError = (message) => {
    message = message.trim();
    if (errors.indexOf(message)) {
      errors.push(message);
    }
  };

  var val = field.getValue();
  if (val === "") {
    newError("Uzupełnij to pole");
  }

  var isList = false;

  if (field.classList.contains("simple-list")) {
    isList = true;
    var valid = true;

    var list = window[field.getAttribute("data-list-name")];
    Object.entries(list.fields).forEach(([fieldName, fieldParams]) => {
      if (fieldParams.unique) {
        field.findAll(".list").forEach((listNode) => {
          var rowValueInputs = {};
          listNode
            .directChildren()
            .filter((listRow) => {
              return listRow.classList.contains("simple-list-row-wrapper");
            })
            .forEach((listRowWrapper) => {
              var rowField = listRowWrapper.find(
                `[data-list-param="${fieldName}"]`
              );

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
      newError("Wartości nie mogą się powtarzać");
    }
  }

  var validator = field.getAttribute("data-validate");
  var [validatorType, ...validatorParams] = validator.split("|");

  if (validatorParams !== undefined && validatorParams.length !== 0) {
    var params = {};
    validatorParams.forEach((param) => {
      var colonPos = param.indexOf(":");
      params[param.slice(0, colonPos)] = param.slice(colonPos + 1);
    });

    if (params["match"]) {
      var target = $(params["match"]);
      if (!target) {
        console.warn("Field missing");
      }
      var isCorrect = val == target.getValue();
      toggleFieldCorrect(field, isCorrect);
      if (!isCorrect) {
        newError("Wartości nie są identyczne");
      }
    }

    if (params["length"]) {
      var correct = validateSize(val.length, params["length"], (info) => {
        return `Wymagana ilość znaków: ${info}`;
      });
      toggleFieldCorrect(field, isCorcorrectrect);
      if (correct !== true) {
        newError(correct);
      }
    }

    if (isList) {
      var list = window[field.getAttribute("data-list-name")];

      if (params["count"]) {
        var correct = validateSize(
          list.values.length,
          params["count"],
          (info) => {
            return `Wymagana ilość elementów: ${info}`;
          }
        );

        if (correct !== true) {
          newError(correct);
        }
      }
    }
  }

  if (validatorType == "tel") {
    if (!/[\d\+\- ]{6,}/.test(val)) {
      newError("Wpisz poprawny numer telefonu");
    }
  } else if (validatorType == "nip") {
    if (val.replace(/[^0-9]/g, "").length != 10) {
      newError("Wpisz poprawny NIP (10 cyfr)");
    }
  } else if (validatorType == "email") {
    const re = /\S+@\S+\.\S+/;
    if (!re.test(String(val).toLowerCase())) {
      newError("Wpisz poprawny adres email");
    }
  } else if (validatorType == "password") {
    // default password length
    if (!params || !params["length"]) {
      var isCorrect = val.length >= 8;
      toggleFieldCorrect(field, isCorrect);
      if (!isCorrect) {
        newError("Wymagana długość: 8 znaków");
      }
    }
  } else if (validatorType == "price") {
    if (+val <= 0.001) {
      newError("Wpisz dodatnią wartość");
    }
  }

  if (errors.length === 0) {
    return true;
  }
  return errors;
}

function checkRemoveRequired() {
  var valid = validateField(this);
  markFieldWrong(this, valid);
}

function clearValidateRequired() {
  removeClasses("required");
}

// validate end

function moveCursorToEnd(el) {
  el.focus();
  if (typeof el.selectionStart == "number") {
    el.selectionStart = el.selectionEnd = el.value.length;
  } else if (typeof el.createTextRange != "undefined") {
    var range = el.createTextRange();
    range.collapse(false);
    range.select();
  }
}

function setValue(input, value, quiet = false) {
  input = $(input);
  if (input.classList.contains("simple-list")) {
    list = window[input.getAttribute("data-list-name")];
    list.setValuesFromString(value);
  }
  if (input.classList.contains("table-selection-value")) {
    var datatable = input.findParentByClassName("datatable-wrapper");
    window[datatable.getAttribute("data-table-name")].setSelectedValuesString(
      value
    );
  } else if (input.classList.contains("jscolor")) {
    var hex = value.replace("#", "");
    input.value = hex;
    input.style.background = hex ? "#" + hex : "";
  } else if (input.getAttribute("type") == "checkbox") {
    input.checked = value ? true : false;
  } else if (input.hasAttribute("data-category-picker")) {
    setCategoryPickerValues(input.next(), JSON.parse(value));
  } else {
    var type = input.getAttribute("data-type");
    if (type == "html") {
      var pointChild = input.getAttribute("data-point-child");
      if (pointChild) {
        input = input.find(pointChild);
      }
      input.innerHTML = value;
    } else if (type == "attribute_values") {
      input.findAll(".combo-select-wrapper").forEach((combo) => {
        combo.findAll("select").forEach((select) => {
          var option = [...select.options].find((o) => {
            return value.selected.indexOf(parseInt(o.value)) !== -1;
          });
          if (option) {
            select.setValue(option.value);
          } else {
            select.setValue("");
          }
        });
      });

      input.findAll(".any-value-wrapper").forEach((any) => {
        any.find(`.has_attribute`).setValue(false);
      });

      value.values.forEach((e) => {
        var attribute_row = input.find(
          `[data-attribute_id="${e.attribute_id}"]`
        );

        if (attribute_row) {
          var has_attribute_node = attribute_row.find(`.has_attribute`);
          var attribute_value_node = attribute_row.find(`.attribute_value`);
          if (has_attribute_node && attribute_value_node) {
            has_attribute_node.setValue(true);
            attribute_value_node.setValue(
              nonull(e.numerical_value, nonull(e.text_value, e.date_value))
            );
          }
        }
      });
    } else if (type == "src") {
      var prefix = input.getAttribute(`data-src-prefix`);
      if (!prefix) prefix = "/uploads/df/";
      if (value) value = prefix + value;
      input.setAttribute("src", value);
    } else if (input.tagName == "SELECT") {
      if ([...input.options].find((e) => e.value == value)) {
        input.value = value;
      }
    } else {
      // for text fields
      input.value = value;
    }
  }
  if (!quiet) {
    input.dispatchEvent(new Event("change"));
  }
}

function getValue(input) {
  if (input.classList.contains("simple-list")) {
    list = window[input.getAttribute("data-list-name")];
    return JSON.stringify(list.values);
  }
  if (input.classList.contains("jscolor")) {
    var value = input.value;
    if (value && value.charAt(0) != "#") {
      value = "#" + value;
    }
    return value;
  } else if (input.getAttribute("type") == "checkbox") {
    return input.checked ? 1 : 0;
  } else {
    var type = input.getAttribute("data-type");
    if (type == "html") {
      var pointChild = input.getAttribute("data-point-child");
      if (pointChild) {
        input = input.find(pointChild);
      }
      return input.innerHTML;
    } else if (type == "attribute_values") {
      var attribute_selected_values = [];
      input.findAll("[data-attribute-value]").forEach((select) => {
        if (select.value) {
          attribute_selected_values.push(parseInt(select.value));
        }
      });
      var attribute_values = {};
      input.findAll(".any-value-wrapper").forEach((attribute_row) => {
        var attr_id = attribute_row.getAttribute("data-attribute_id");
        var attr_val_node = attribute_row.find(".attribute_value:not(.hidden)");

        if (attr_val_node) {
          attribute_values[attr_id] = attr_val_node.getValue();
        }
      });
      return JSON.stringify({
        selected: attribute_selected_values,
        values: attribute_values,
      });
    } else if (type == "src") {
      var prefix = input.getAttribute(`data-src-prefix`);
      if (!prefix) prefix = "/uploads/df/";
      var src = input.getAttribute("src");
      if (src && src.length > prefix.length) src = src.substr(prefix.length);
      return src;
    } else if (type == "date") {
      var format = input.getAttribute(`data-format`);
      if (format == "dmy") {
        return reverseDateString(input.value, "-");
      }
      return input.value;
    } else {
      return input.value;
    }
  }
}

function toggleDisabled(elem, disabled) {
  if (disabled) elem.setAttribute("disabled", true);
  else elem.removeAttribute("disabled");
}

function smoothScroll(diff, params = {}) {
  var time = 40;
  var t = 0;
  if (params.time) time = params.time;
  if (params.t) t = params.t;

  window.scrollBy(
    0,
    (4 * diff * (time / 2 - Math.abs(time / 2 - t))) / (time * time)
  );
  if (t < time) {
    requestAnimationFrame(() => {
      smoothScroll(diff, { time: time, t: t + 1 });
    });
  } else if (params.callback) {
    params.callback();
  }
}

function scrollToView(elem, params = {}) {
  var time = 40;
  var offset = 0;
  var margin = 0.2;
  if (params.time) time = params.time;
  if (params.offset) time = params.offset;
  if (params.margin) margin = params.margin;

  var r = elem.getBoundingClientRect();

  var top = r.top + offset;
  var bottom = r.top + r.height + offset;

  var topMin = window.innerHeight * margin;
  var bottomMin = window.innerHeight * (1 - margin);

  var diff = 0;

  if (top < topMin) {
    diff = top - topMin;
  } else if (bottom > bottomMin) {
    diff = bottom - bottomMin;
  }

  smoothScroll(diff, { time: time, callback: params.callback });
}

var toolList = [];
function useTool(name) {
  if (toolList.indexOf(name) !== -1) {
    console.warn(`module ${name} registered already`);
    return;
  }
  toolList.push(name);
  var el = document.createElement("script");
  el.src = `/admin/tools/${name}.js?v=${RELEASE}`;
  if (document.body) {
    document.body.appendChild(el);
  } else {
    window.addEventListener("DOMContentLoaded", function () {
      document.body.appendChild(el);
    });
  }
}

function validURL(str) {
  var pattern = new RegExp(
    "^(https?:\\/\\/)?" + // protocol
    "((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|" + // domain name
    "((\\d{1,3}\\.){3}\\d{1,3}))" + // OR ip (v4) address
    "(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*" + // port and path
    "(\\?[;&a-z\\d%_.~+=-]*)?" + // query string
      "(\\#[-a-z\\d_]*)?$",
    "i"
  ); // fragment locator
  return !!pattern.test(str);
}

// youtube start

function getIdFromYoutubeUrl(url) {
  var res = url.match(
    /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/ ]{11})/i
  );
  if (!res || res.length < 2) return false;
  return res[1];
}

function getIdFromYoutubeThumbnail(url) {
  return url
    .replace("https://img.youtube.com/vi/", "")
    .replace("/hqdefault.jpg", "");
}

function isYTThumbnail(src) {
  return src.indexOf(`https://img.youtube.com/vi/`) == 0;
}
function getThumbnailFromYoutubeId(id) {
  return `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
}
function getUrlFromYoutubeId(id) {
  return `https://www.youtube.com/watch?v=${id}`;
}

// youtube end

function removeClassesWithPrefix(node, prefix) {
  node.className = node.className.replace(
    new RegExp(`\\b${prefix}[\\w-]*\\b`, "g"),
    ""
  );
}

function matchClassesWithPrefix(node, prefix) {
  out = [];
  node.classList.forEach((e) => {
    if (e.indexOf(prefix) === 0) out.push(e);
  });
  return out;
}

function scrollToBottom(node) {
  node.scrollTop = node.scrollHeight;
}

function setFormData(data, form = null, params = {}) {
  if (!form) form = document.body;
  Object.entries(data).forEach(([name, value]) => {
    var selector = `[name="${name}"]`;
    if (params.type == "simple-list") {
      selector = `[data-list-param="${name}"]`;
    }
    var e = $(form).find(selector);
    if (!e) {
      return;
    }
    setValue(e, value);
  });

  resizeCallback();
}

function getFormData(form = null) {
  if (!form) form = document.body;
  var data = {};

  form = $(form);
  var excludeHidden = form.hasAttribute("data-exclude-hidden");
  $(form)
    .findAll(`[name]`)
    .forEach((e) => {
      if (excludeHidden && e.findParentByClassName("hidden")) return;
      data[e.getAttribute("name")] = getValue(e);
    });
  return data;
}

function getNodeTextWidth(node) {
  if (!node) return;
  var textNode = [...node.childNodes].find(
    (child) => child.nodeType === Node.TEXT_NODE
  );
  if (!textNode) return getNodeTextWidth(node.children[0]);
  var range = document.createRange();
  range.selectNode(textNode);
  return range.getBoundingClientRect().width;
}

// category picker start
function registerCategoryPickers() {
  $$("[data-category-picker]").forEach((e) => {
    var n = e.next();
    if (n && n.classList.contains("category-picker")) return;

    var parent_id = e.getAttribute("data-parent_id");
    if (!parent_id) parent_id = "";

    /*Object.defineProperty(e, "value", {
        get: function() {return this._value;},
        set: function(v) {
            this._value = v;
            setCategoryPickerValues(e.nextSibling);
        }
    });*/

    var select = e.hasAttribute("data-single") ? "single" : "multiple";

    e.insertAdjacentHTML(
      "afterend",
      `
          <div class="category-picker" data-category-picker-source="${e.getAttribute(
            "data-category-picker-source"
          )}" data-category-picker-name="${e.getAttribute(
        "name"
      )}" data-select="${select}" data-scope_parent_id="${parent_id}"></div>
      `
    );
  });
}

function setCategoryPickerValues(element, values, params = {}) {
  if (!element) {
    console.warn(`Category picker element doesn't exist`);
    return;
  }
  element = $(element);
  element.findAll(".expandY").forEach((e) => {
    e.classList.add("hidden");
  });
  element.findAll(".expand").forEach((e) => {
    e.classList.remove("open");
  });

  var singleselect = element.getAttribute("data-select") == "single";
  if (!singleselect) {
    values = values.map((e) => e.toString());
  }
  var example = null;
  element.findAll("[data-category_id]").forEach((e) => {
    if (!example) example = e;

    toggleDisabled(e, false);

    var check = false;
    if (singleselect) {
      if (values != null && values != undefined) {
        check = values.toString() == e.getAttribute("data-category_id");
      }
    } else {
      check = values.indexOf(e.getAttribute("data-category_id")) !== -1;
    }
    e.checked = check;
    if (check) {
      expandCategoriesAbove(e);
    }
  });
  if (example) {
    categoryChanged(example);
  }

  if (params.disable) {
    params.disable.forEach((i) => {
      var el = element.find(`[data-category_id="${i}"]`);
      if (el) {
        toggleDisabled(el, true);
        el.checked = false;
      }
    });
  }
  if (params.disable_with_children) {
    params.disable_with_children.forEach((i) => {
      var el = element.find(`[data-category_id="${i}"]`);
      if (el) {
        toggleDisabled(el, true);
        el.checked = false;
        el.parent()
          .parent()
          .next()
          .findAll("[data-category_id]")
          .forEach((xu) => {
            toggleDisabled(xu, true);
            xu.checked = false;
          });
      }
    });
  }
}

function expandCategoriesAbove(node, alsoCurrent = true) {
  node = $(node);
  if (alsoCurrent) {
    var parent = node.findParentByClassName([
      "category-picker-row",
      "categories",
    ]);
    if (parent) {
      var nodeExpander = parent.next();
      if (nodeExpander && parent.find(".expand")) {
        return expandCategoriesAbove(nodeExpander, false);
      }
    }
  }

  parent = node;
  while (true) {
    var parent = parent.findParentByClassName(["expandY", "categories"]);
    if (!parent) break;
    var btn = parent.prev().find(".btn");
    if (!btn) break;
    expandWithArrow(btn.parent().next(), btn, {
      duration: 0,
    });
    parent = parent.parent();
  }
}

function categoryChanged(el) {
  el = $(el);
  var element = el.findParentByClassName("category-picker");
  var name = element.getAttribute(`data-category-picker-name`);
  var singleselect = element.getAttribute("data-select") == "single";
  if (singleselect) {
    if (el.checked) {
      element.findAll("[data-category_id]").forEach((e) => {
        if (e != el) e.checked = false;
      });
    } else if (!element.find("[data-category_id]:checked")) {
      el.checked = true;
    }
  }

  var value = "";
  if (singleselect) {
    element.findAll("[data-category_id]").forEach((e) => {
      if (e.checked) {
        value = parseInt(e.getAttribute("data-category_id"));
        return;
      }
    });
  } else {
    checked = [];
    element.findAll("[data-category_id]").forEach((e) => {
      if (e.checked) {
        checked.push(parseInt(e.getAttribute("data-category_id")));
      }
    });
    value = JSON.stringify(checked);
  }
  $(`[name=${name}]`).value = value;

  if (el.checked) {
    var expandWhenClosed = el.parent().parent().find(".expand:not(.open)");
    if (expandWhenClosed) {
      expandWhenClosed.click();
    }
  }
}

function loadCategoryPicker(
  source = "product_categories",
  options = {},
  callback = null
) {
  registerCategoryPickers();
  //parent_id = +parent_id;
  xhr({
    //url: `/helpers/categories_template`,
    url: `/helpers/categories_template&table=${source}`,
    type: "text",
    //url: `/helpers/categories_template&parent_id=${parent_id}`,
    success: (c) => {
      /*if (!$(`.category-picker-template-${parent_id}`)) {
          document.body.insertAdjacentHTML("beforeend",`<template class="category-picker-template-${parent_id}"></template>`);
      }
      $$(`.category-picker[parent_id="${parent_id}"], .category-picker-template-${parent_id}`).forEach(e=>{
          e.innerHTML = c;
      });*/
      $$(`.category-picker[data-category-picker-source="${source}"]`).forEach(
        (e) => {
          [...e.children].forEach((e) => {
            removeNode(e);
          });
          e.insertAdjacentHTML("afterbegin", c);

          if (options.skip) {
            var kid = e.find(`.category-picker-column `.repeat(options.skip));
            if (kid) {
              e.innerHTML = kid.innerHTML;
            }
          } else {
            var main = e.find(".category_name");
            if (main)
              main.innerHTML = nonull(
                options.main_category,
                "Kategoria główna"
              );

            var parent_id = e.getAttribute("scope_parent_id");
            if (parent_id && parent_id != 0) {
              e.innerHTML = e.find(`[data-parent_id="${parent_id}"]`).outerHTML;
            }
          }
        }
      );

      if (callback) {
        callback();
      }
    },
  });
}
// category picker end

function getLink(phrase) {
  // also kernel.php
  const pl = [
    ",",
    " ",
    "ę",
    "Ę",
    "ó",
    "Ó",
    "ą",
    "Ą",
    "ś",
    "Ś",
    "ł",
    "Ł",
    "ż",
    "Ż",
    "ź",
    "Ź",
    "ć",
    "Ć",
    "ń",
    "Ń",
  ];
  const en = [
    "-",
    "-",
    "e",
    "E",
    "o",
    "O",
    "a",
    "A",
    "s",
    "S",
    "l",
    "L",
    "z",
    "Z",
    "z",
    "Z",
    "c",
    "C",
    "n",
    "N",
  ];
  var le = pl.length;
  for (let i = 0; i < le; i++) {
    phrase = phrase.replace(new RegExp(`${pl[i]}`, "g"), en[i]);
  }
  return phrase
    .toLowerCase()
    .replace(/[^(a-zA-Z0-9-)]/g, "")
    .replace(/-+/g, "-");
}

window.addEventListener("DOMContentLoaded", () => {
  $$(".mobile-hover").forEach((e) => {
    if (mobilecheck()) {
      e.addEventListener("touchstart", () => {
        if (!e.classList.contains("hovered")) {
          setTimeout(() => {
            e.classList.add("hovered");
          }, 0);
        }
      });
    } else {
      e.addEventListener("mouseover", () => {
        e.classList.add("hovered");
      });
      e.addEventListener("mouseleave", () => {
        e.classList.remove("hovered");
      });
    }
  });
});

document.addEventListener("touchstart", (event) => {
  var e = $(".hovered");
  var toggle = $(".hovered .dropdown-header");
  if (e && (!isInNode(event.target, e) || isInNode(event.target, toggle))) {
    //if (e && !isInNode(event.target, e)) {
    e.classList.remove("hovered");
  }
});

/* tab menu start */

document.addEventListener("click", (event) => {
  var t = $(event.target);
  var option = t.findParentByClassName("tab-option");
  var menu = t.findParentByClassName("tab-menu");
  if (!option || !header) return;

  var tab_id = option.getAttribute("data-tab_id");

  showTab(menu, tab_id);
});

function showTab(tab_menu, tab_id) {
  tab_menu.findAll(".tab-header .tab-option").forEach((e) => {
    e.classList.toggle("current", e.getAttribute("data-tab_id") == tab_id);
  });
  tab_menu.findAll(".tab-content").forEach((e) => {
    e.classList.toggle("hidden", e.getAttribute("data-tab_id") != tab_id);
  });
}

/* tab menu end */

/* notification start */

function showNotification(message, params = {}) {
  $$(".notification").forEach((e) => {
    e.style.opacity = 0;
    e.style.top = "-10px";
  });
  var notification = document.createElement("DIV");
  notification.className = "notification";
  notification.insertAdjacentHTML(
    "beforeend",
    `
    <i class="fa fa-times-circle" onclick="dismissNotification(this.parent())"></i>
    ${message}
  `
  );
  notification.style.top = "-20px";
  notification.style.opacity = "0";
  if (params.width) {
    notification.style.width = params.width;
    notification.style.maxWidth = params.width;
  } else {
    notification.style.width = "auto";
    notification.style.maxWidth = "unset";
  }
  document.body.insertAdjacentElement("beforeend", notification);
  setTimeout(() => {
    notification.style.top = "";
    notification.style.opacity = "";
  });

  setTimeout(() => {
    dismissNotification(notification);
  }, 2000);
}

function dismissNotification(n) {
  if (!n) return;
  n.style.opacity = 0;
  n.style.pointerEvents = "none";
  setTimeout(() => {
    removeNode(n);
  }, 200);
}

/* notification end */

/* cookies start */

function setCookie(cname, cvalue) {
  var d = new Date();
  d.setTime(d.getTime() + 60 * 60 * 1000);
  var expires = "expires=" + d.toUTCString();
  document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/;samesite";
}

function getCookie(cname) {
  var name = cname + "=";
  var ca = document.cookie.split(";");
  for (var i = 0; i < ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == " ") {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}

// load save fields in cookie
var ignoreValueChanges = false;
window.addEventListener("DOMContentLoaded", () => {
  $$("[data-cookie]").forEach((e) => {
    e.addEventListener("change", () => {
      if (ignoreValueChanges) return;
      var cookieName = e.getAttribute("data-cookie");
      if (!cookieName) cookieName = e.getAttribute("name");
      setCookie(cookieName, e.value);
    });
  });
});

function loadFormFromCookies() {
  $$("[data-cookie]").forEach((e) => {
    var cookieName = e.getAttribute("data-cookie");
    if (!cookieName) cookieName = e.getAttribute("name");
    var value = getCookie(cookieName);
    if (value) {
      setValue(e, value);
    }
  });
}

/* cookies end */

/* manage user start */
setInterval(() => {
  // keep connected
  xhr({
    url: "/ping.php",
  });
}, 60000);

function logout() {
  if (USER_TYPE == "f") {
    window.location = "/logout";
    return false;
  }
  if (USER_TYPE == "g") {
    try {
      var auth2 = gapi.auth2.getAuthInstance();
      auth2.signOut().then(function () {
        window.location = "/logout";
      });
      auth2.disconnect();
    } catch (error) {
      console.log(error);
      window.location = "/logout";
    }
    return false;
  }
}

function onSignIn(googleUser) {
  var form = $("#google-form");
  if (IS_LOGGED || !form) return;

  var id_token = googleUser.getAuthResponse().id_token;
  if (!id_token) return;

  form.id_token.value = id_token;
  form.submit();
}
/* manage user end */

/* miejscowosc picker start */
function kodPocztowyChange(src) {
  xhr({
    url: `/kod_pocztowy_api`,
    params: {
      kod: src.value,
    },
    success: (res) => {
      var list = "";
      try {
        var items = [];
        for (i = 0; i < res.length; i++) {
          items.push(res[i].miejscowosc);
        }

        var dups = {};
        items = items.filter(function (el) {
          var hash = el.valueOf();
          var isDup = dups[hash];
          dups[hash] = true;
          return !isDup;
        });

        for (i = 0; i < items.length; i++) {
          var miejscowosc = items[i];
          list += `<div onclick='chooseMiejscowosc(this)'>${miejscowosc}</div>`;
        }
      } catch (e) {}

      var targetList = getMiejscowoscPickerList(src);
      if (!targetList) return;
      targetList.innerHTML = list;
    },
  });
}

function getMiejscowoscPickerTarget(obj) {
  if (!obj) return;
  obj = $(obj);
  var wrapper = obj.findParentByClassName("miejscowosc-picker-wrapper");
  if (!wrapper) {
    console.warn("miejscowosc picker wrapper missing");
    return;
  }
  var target = wrapper.find(".miejscowosc-picker-target");
  if (!target) {
    console.warn("miejscowosc picker target missing");
    return;
  }
  return target;
}

function getMiejscowoscPickerList(obj) {
  if (!obj) return;
  obj = $(obj);
  var wrapper = obj.findParentByClassName("miejscowosc-picker-wrapper");
  if (!wrapper) {
    console.warn("miejscowosc picker wrapper missing");
    return;
  }
  var list = wrapper.find(".miejscowosc-picker-list");
  if (!list) {
    console.warn("miejscowosc picker list missing");
    return;
  }
  return list;
}

function chooseMiejscowosc(obj) {
  var target = getMiejscowoscPickerTarget(obj);
  if (!target) return;
  target.value = obj.textContent;
}
/* miejscowosc picker end */

/* top nav start */

window.addEventListener("DOMContentLoaded", () => {
  $$("nav > div").forEach((e) => {
    e.addEventListener("mouseenter", () => {
      var x = e.find(".float-category");
      if (!x || !x.textContent) return;
      var rect = e.getBoundingClientRect();

      if (floatCategoryHovered && floatCategoryHovered != x) {
        hideFloatingCategory();
      }
      dropdownButtonHovered = e;
      floatCategoryHovered = x;

      dropdownButtonHovered.classList.add("hovered");
      floatCategoryHovered.style.display = "block";
      floatCategoryHovered.style.left = rect.left + "px";
      floatCategoryHovered.style.top = rect.top + rect.height - 1 + "px";
      setTimeout(() => {
        floatCategoryHovered.classList.add("visible");
      });
    });
  });
});

function hideFloatingCategory() {
  floatCategoryHovered.classList.remove("visible");
  dropdownButtonHovered.classList.remove("hovered");

  let zzz = floatCategoryHovered;
  setTimeout(() => {
    zzz.style.display = "";
  }, 150);

  dropdownButtonHovered = null;
  floatCategoryHovered = null;
}

var dropdownButtonHovered = null;
var floatCategoryHovered = null;
document.addEventListener("mousemove", (event) => {
  if (!dropdownButtonHovered) return;
  if (isInNode(event.target, dropdownButtonHovered)) return;
  hideFloatingCategory();
});

/* top nav end */

/* custom css engine start */

window.addEventListener("resize", function () {
  resizeCallback();
});
window.addEventListener("DOMContentLoaded", function () {
  resizeCallback();
});

// remember to switch back to regular responsive type, used in slider edit form
var forceMobile = false;

function resizeCallback() {
  if (window.responsiveImages) {
    window.responsiveImages();
  }

  var responsiveType =
    forceMobile || window.innerWidth < 800 ? "mobile" : "desktop";

  $$(".cms-container").forEach((e) => {
    if (responsiveType == "desktop") {
      e.classList.toggle(
        "desktop-full-width",
        e.hasAttribute("data-desktop-full-width")
      );
    } else {
      e.classList.remove("desktop-full-width");
    }
  });

  var attribute = `data-${responsiveType}-width`;
  $$(`[${attribute}]`).forEach((e) => {
    e.style.width = e.getAttribute(attribute);
  });

  var attribute = `data-${responsiveType}-min-height`;
  $$(`[${attribute}]`).forEach((e) => {
    e.style.minHeight = e.getAttribute(attribute);
  });

  for (let direction of ["Left", "Right", "Top", "Bottom"]) {
    for (let type of ["margin", "padding"]) {
      var attribute = `data-${type}_${direction.toLowerCase()}`;
      $$(`[${attribute}]`).forEach((e) => {
        if (e.classList.contains("removing")) {
          return;
        }
        var v = e.getAttribute(attribute);
        var jsstyle = type + direction;
        if (
          e.classList.contains("cms-block") &&
          v.charAt(v.length - 1) == "%"
        ) {
          v =
            (e.parent().getBoundingClientRect().width * parseInt(v)) / 100 +
            "px";
        }

        if (
          ["Top", "Bottom"].indexOf(direction) != -1 &&
          e.classList.contains("cms-container") &&
          findParentById(e, "cms")
        ) {
          v = `calc(${v} + 10px)`;
        }

        e.style[jsstyle] = v;
      });
    }
  }

  var attribute = `data-${responsiveType}-justify-content`;
  $$(`[${attribute}]`).forEach((e) => {
    e.style.justifyContent = e.getAttribute(attribute);
  });

  var attribute = `data-${responsiveType}-align-items`;
  $$(`[${attribute}]`).forEach((e) => {
    e.style.alignItems = e.getAttribute(attribute);
  });

  var attribute = `data-${responsiveType}-flex-flow`;
  $$(`[${attribute}]`).forEach((e) => {
    e.style.flexFlow = e.getAttribute(attribute);
  });
}

/* custom css engine end */

/* custom selectbox start */

window.addEventListener("DOMContentLoaded", function () {
  registerSelectboxes();
});

function registerSelectboxes() {
  $$(".selectbox:not(.registered)").forEach((e) => {
    e.classList.add("registered");
    e.findAll("[data-option]").forEach((o) => {
      o.addEventListener("click", () => {
        var i = e.find("input");
        if (i) {
          setValue(i, o.getAttribute("data-option"));
          o.blur();
        }
      });
    });
  });
  /*$$(".selectbox:not(.showhover)").forEach((e) => {
    e.classList.add("showhover");
    e.findAll("[data-option]").forEach((o) => {
      o.addEventListener("click", () => {
        var i = e.find("input");
        if (i) {
          setValue(i, o.getAttribute("data-option"));
        }
      });
    });
  });*/
}

/* custom selextbox end */

/* text counter start */
function registerTextCounters() {
  $$("[data-show-count]:not(.registered)").forEach((e) => {
    e.classList.add("registered");
    e.addEventListener("change", () => {
      e.next().find("span").innerHTML = e.value.length;
      if (e.value.length > e.getAttribute("data-show-count")) {
        e.next().style.color = "#f00";
        e.next().style.fontWeight = "bold";
      } else if (e.value.length > 0.9 * e.getAttribute("data-show-count")) {
        e.next().style.color = "#fa0";
        e.next().style.fontWeight = "bold";
      } else {
        e.next().style.color = "";
        e.next().style.fontWeight = "";
      }
    });
    e.addEventListener("input", () => {
      e.dispatchEvent(new Event("change"));
    });
    e.insertAdjacentHTML(
      "afterend",
      `
          <div style="color:#555">
            <span></span><span> / ${e.getAttribute(
              "data-show-count"
            )} znaków ${nonull(e.getAttribute("data-count-description"))}</span>
          </div>
      `
    );
    e.dispatchEvent(new Event("change"));
  });
}
/* text counter end */

function addItemtoBasket(variant_id, diff, callback) {
  if (diff > 0) url = "/basket/add/" + variant_id + "/" + diff;
  else url = "/basket/remove/" + variant_id + "/" + -diff;

  xhr({
    url: url,
    success: (res) => {
      setContent($("#basketContent"), res.basket_content_html);

      $("#amount").innerHTML = res.item_count; // header basket

      if (callback) {
        callback(res);
      }
    },
  });
}

function rgbStringToHex(rgbString) {
  if (rgbString.substr(0, 3) != "rgb") return rgbString;
  return rgbString.replace(/rgb\((.+?)\)/gi, (_, rgb) => {
    return (
      "#" +
      rgb
        .split(",")
        .map((str) => parseInt(str, 10).toString(16).padStart(2, "0"))
        .join("")
    );
  });
}

function updateOnlineStatus() {
  $(".offline").classList.toggle("shown", !navigator.onLine);
}
window.addEventListener("DOMContentLoaded", () => {
  window.addEventListener("offline", () => {
    updateOnlineStatus();
  });
  window.addEventListener("online", () => {
    updateOnlineStatus();
  });
});

// datapicker start
function getDatepickerDefaultOptions(e) {
  return {
    todayHighlight: true,
    todayBtn: true,
    clearBtn: true,
    maxView: 2,
    language: "pl",
    autohide: true,
    container: e.findScrollableParent(),
  };
}

window.addEventListener("DOMContentLoaded", () => {
  registerDatepickers();
});

function registerDatepickers() {
  $$(".default_datepicker:not(.registered)").forEach((e) => {
    e.classList.add("registered");

    new Datepicker(e, getDatepickerDefaultOptions(e));
  });
}
// datapicker end
