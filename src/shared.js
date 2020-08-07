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
  obj = obj.parentNode.parentNode;
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
  document.querySelectorAll("nav a").forEach((a) => {
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

  document.querySelectorAll(".expandClick").forEach((e) => {
    e.querySelector(".expandHeader").addEventListener("click", () => {
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

// popup start
document.addEventListener("DOMContentLoaded", function () {
  if (!mobilecheck()) {
    document.querySelectorAll(".navbar_wrapper .dropdown").forEach((e) => {
      var a = e.querySelector("a");
      var u = e.querySelector(".dropdown-header");
      if (a && u) {
        u.addEventListener("click", () => {
          window.location = a.href;
        });
      }
    });
  }
  var popup = document.querySelector(".old-popupWrapper");
  if (popup) {
    popup.addEventListener("click", function (e) {
      if (e.target == popup) hidePopup();
    });
  }
});

function hidePopup() {
  var p = document.querySelector(".old-popupWrapper");
  if (!p) return;
  p.style.opacity = 0;
  setTimeout(function () {
    p.style.top = "-100vh";
  }, 400);
  toggleBodyScroll(false);
}

function showPopup() {
  var p = document.querySelector(".old-popupWrapper");
  if (!p) return;
  p.style.top = "0";
  p.style.opacity = 1;
  toggleBodyScroll(true);
}
// popup end

function dateToString(d, type = "") {
  var mon = d.getMonth() + 1;
  var day = d.getDate();

  if (mon < 10) mon = "0" + mon;
  if (day < 10) day = "0" + day;

  return type == "dmy"
    ? day + "-" + mon + "-" + d.getFullYear()
    : d.getFullYear() + "-" + mon + "-" + day;
}

function xhr(data) {
  var xhr = new XMLHttpRequest();
  xhr.open("POST", data.url, true);
  xhr.setRequestHeader("enctype", "multipart/form-data");
  xhr.onload = function () {
    if (data.success) {
      data.success(xhr.responseText);
    }
  };

  var formData = data.formData ? data.formData : new FormData();
  if (data.params) {
    for (const [key, value] of Object.entries(data.params)) {
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
  document.querySelectorAll("iframe.ql-video").forEach((e) => {
    var h = Math.round(0.56 * e.getBoundingClientRect().width);
    if (h > 500) h = 500;
    e.style.height = h + "px";
  });
}

function nonull(a, e = "") {
  if (a === null || a === undefined) return e;
  return a;
}

function delay(action, time, context = window) {
  if (context["await" + action]) clearTimeout(context["await" + action]);
  context["await" + action] = setTimeout(function () {
    context[action](true);
  }, time);
}

function removeNode(n) {
  if (n && n.parentNode) n.parentNode.removeChild(n);
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
  if (![...parent.children].find(isMissingCallback)) {
    parent.insertAdjacentHTML(position, html);
  }
}

function swapNodes(n1, n2) {
  if (!n1 || !n2) return;

  var p1 = n1.parentNode;
  var p2 = n2.parentNode;
  var i1, i2;

  if (!p1 || !p2 || p1.isEqualNode(n2) || p2.isEqualNode(n1)) return;

  for (var i = 0; i < p1.children.length; i++) {
    if (p1.children[i].isEqualNode(n1)) {
      i1 = i;
    }
  }
  for (var i = 0; i < p2.children.length; i++) {
    if (p2.children[i].isEqualNode(n2)) {
      i2 = i;
    }
  }

  if (p1.isEqualNode(p2) && i1 < i2) {
    i2++;
  }
  p1.insertBefore(n2, p1.children[i1]);
  p2.insertBefore(n1, p2.children[i2]);
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
  videos = document.querySelectorAll("video");
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

function scrollToElement(elem, parent = null, offset = 0, center = true) {
  if (!elem) return;
  var pos = position(elem);
  var diff = pos.top - offset;
  if (parent) {
    diff -= parent.scrollTop;
  }
  if (center) {
    diff += (elem.getBoundingClientRect().height - window.innerHeight) * 0.5;
  }
  var sag = 100;
  if (Math.abs(diff) > sag) {
    diff -= sag * Math.sign(diff);
    scrollFromTo(parent, diff, 50, 0);
  }
}
function scrollFromTo(parent, diff, time, t) {
  // if (window.innerWidth > 767) return;
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

// tooltip start
var lastTooltip = null;
window.addEventListener("mousemove", function (event) {
  var t = document.querySelector(".tooltip");
  if (!t) return;

  var e = findParentByAttribute(event.target, "data-tooltip");
  if (e) {
    var tooltipText = e.getAttribute("data-tooltip");
    if (lastTooltip != e) {
      t.style.display = "block";
      t.innerHTML = tooltipText;
    }

    var pos = e.getBoundingClientRect();
    var tooltipRect = t.getBoundingClientRect();

    var offsetX = 7;
    var left = pos.left + offsetX + pos.width;

    var position = e.getAttribute("data-position");
    if (position == "center") {
      left -= pos.width / 2 + tooltipRect.width / 2 + offsetX;
    }

    var maxLeft = window.innerWidth - 30 - tooltipRect.width;
    if (left > maxLeft) {
      left -= tooltipRect.width / 2 + offsetX;
    }
    if (left > maxLeft) {
      left = maxLeft;
    }
    if (left < 10) {
      left = 10;
    }

    t.style.left = left + "px";
    t.style.top = pos.top + 4 + pos.height + "px";
  } else t.style.display = "none";

  lastTooltip = e;
});
window.addEventListener("click", function (ev) {
  var t = document.querySelector(".tooltip");
  if (t) t.style.display = "none";
});
// tooltip end

// table start

function createTable(table) {
  // REQUIRED name, definition | renderRow, url, primary, db_table
  // OPTIONAL controls OR controlsRight, width, nosearch, rowCount (10,20,50), callback
  // sortable (requires primary, db_table),
  // selectable: {data,output},
  // hasMetadata: (boolean, enables outputting metadata from additional row inputs)
  // tree_view
  // lang: {subject, main_category}

  table.awaitId = null;
  table.currPage = 0;
  table.pageCount = 0;
  table.request = null;
  table.results = [];

  if (!table.lang) table.lang = {};
  table.lang.subject = nonull(table.lang.subject, "wyników");

  table.target = document.querySelector("." + table.name);

  table.target.classList.add("datatable-wrapper");
  table.target.setAttribute("data-table-name", table.name);

  if (table.selectable) {
    table.selectable = table.selectable;
    table.selection = "";
    table.singleselect = table.selectable.singleselect;
    if (table.hasMetadata) {
      table.metadata = "";
    }

    table.setSelectedValuesString = (v) => {
      var selection = null;
      if (table.singleselect) {
        selection = v;
      } else if (table.hasMetadata) {
        var metadata = [];
        selection = [];
        try {
          Object.entries(JSON.parse(v)).forEach(([row_id, row_metadata]) => {
            selection.push(parseInt(row_id));
            metadata[parseInt(row_id)] = row_metadata;
          });
        } catch (e) {
          console.log(e);
        }

        table.metadata = metadata;
      } else {
        // no metadata, raw table
        selection = [];

        try {
          for (val of JSON.parse(v)) {
            selection.push(parseInt(val));
          }
        } catch (e) {}
      }
      table.selection = selection;

      table.selectionValueElement.value = v;

      table.createList();
    };
    table.getSelectedValuesString = () => {
      if (table.singleselect && !table.hasMetadata) {
        return table.selection;
      } else {
        return JSON.stringify(table.selection);
      }
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
      <select data-param="rowCount" oninput="${table.name}.setPage(0)">
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
        }" ${
        table.selectable.validate
          ? `data-validate data-validate-target='.${table.name} .selectedRows'`
          : ""
      }>
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
  table.searchElement = table.target.querySelector(".search-wrapper");
  table.tableElement = table.target.querySelector(".table-wrapper");
  table.totalRowsElement = table.target.querySelector(".total-rows");
  table.paginationElement = table.target.querySelector(".pagination");
  table.selectionElement = table.target.querySelector(".selectedRows");
  table.selectionValueElement = table.target.querySelector(
    ".table-selection-value"
  );

  if (table.tree_view) {
    table.breadcrumbElement = table.target.querySelector(".breadcrumb");

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

        xhr({
          url: table.url,
          params: {
            category_id: category_id,
          },
          success: (res) => {
            loadCategoryFormCallback(JSON.parse(res).results[0]);
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
    headersHTML += `<th style="width:33px"></th>`;
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

  table.setPage = function (i) {
    if (i < 0) i = 0;
    else if (i > table.pageCount - 1) i = table.pageCount - 1;
    table.currPage = i;
    table.search();
  };

  table.setPageEvent = function (obj, e) {
    if (e.keyCode == 13) {
      table.setPage(parseInt(obj.value) - 1);
    }
  };

  document.querySelectorAll(`.${table.name} *[data-param]`).forEach((e) => {
    e.addEventListener("input", function () {
      if (e.tagName.toLowerCase() == "input") table.awaitSearch();
      else table.search();
    });
  });

  table.search = function (callback = null, createList = false) {
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

    if (createList) {
      params[table.primary] = table.getSelectedValuesString();
    } else {
      params = table.params ? table.params() : "";
      if (!params) {
        params = {};
      }
      if (table.requiredParam) {
        var x = table.requiredParam();
        if (x || x === 0) {
          params[requiredFilterTables[table.db_table]] = x;
        }
      }
      document.querySelectorAll(`.${table.name} *[data-param]`).forEach((e) => {
        params[e.getAttribute("data-param")] = e.value;
      });
      if (table.selectable) {
        // TODO get values from metadata or regular array
        params[table.primary] = "!" + table.getSelectedValuesString(); // ! means ignore
      }
      if (table.tree_view) {
        params.parent_id = table.getParentId();
      }
    }

    var paramsJson = JSON.stringify(params);
    if (table.lastParamsJson && table.lastParamsJson != paramsJson) {
      table.currPage = 0;
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
      success: (response) => {
        var res = JSON.parse(response);
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

        var table_body = output;

        output = "";
        var range = 3;
        var mobile = window.innerWidth < 760;
        if (mobile) range = 1;
        var center = table.currPage;
        if (table.currPage < range) center = range;
        if (table.currPage > table.pageCount - range - 1)
          center = table.pageCount - range - 1;
        for (i = 0; i < table.pageCount; i++) {
          if (
            i == 0 ||
            i == table.pageCount - 1 ||
            (i >= center - range && i <= center + range)
          ) {
            if (i == center - range && i > 1) output += " ... ";
            output += `<div class='pagination_item ${
              i == table.currPage ? " current" : ``
            }'
                      ${
                        i != table.currPage
                          ? `onclick="${table.name}.setPage(${i})"`
                          : ``
                      } 
            }>${i + 1}</div>`;
            if (i == center + range && i < table.pageCount - 2)
              output += " ... ";
          }
        }
        if (table.pageCount > 20 && !mobile) {
          output += `<span class='setMyPage'><input class='myPage' type='text' placeholder='Nr strony (1-${table.pageCount})' onkeypress='${table.name}.setPageEvent(this,event)'></span>`;
        }

        if (createList) {
          table.selectionElement.innerHTML = table_body;
        } else {
          table.paginationElement.innerHTML = output;
          table.totalRowsElement.innerHTML = res.totalRows;
          table.tableElement.innerHTML = table_body;
        }

        table.target.querySelectorAll("td").forEach((e) => {
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

        if (table.hasMetadata) {
          table.registerMetadataFields();
        }

        if (callback) callback(res); // custom
        if (table.callback) table.callback(res); // default
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

      if (table.hasMetadata) {
        try {
          Object.entries(table.metadata).forEach(([key, value]) => {
            var row = table.selectionElement.querySelector(
              `[data-primary="${key}"]`
            );
            if (row) {
              Object.entries(value).forEach(([key, value]) => {
                var m = row.querySelector(`[data-metadata="${key}"]`);
                if (m) m.value = value;
              });
            }
          });
        } catch (e) {
          console.error(e);
        }
      }
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
    if (table.singleselect) {
      table.selection = null;
    } else {
      const index = table.selection.indexOf(data_id);
      if (index !== -1) {
        table.selection.splice(index, 1);
      } else return;
    }

    removeNode(table.target.querySelector(`[data-primary='${data_id}']`));
    table.selectionChange();
  };
  table.addRow = (data_id) => {
    if (table.singleselect && table.selection) {
      table.removeRow(table.selection);
    }
    if (table.singleselect || table.selection.indexOf(data_id) === -1) {
      if (table.singleselect) {
        table.selection = data_id;
        if (table.hasMetadata) {
          table.metadataChange();
        }
      } else {
        table.selection.push(data_id);
      }
      var x = table.target.querySelector(`[data-primary='${data_id}']`);
      table.selectionElement.querySelector("tbody").appendChild(x);
      var d = x.querySelector(".fa-plus-circle");
      d.outerHTML = d.outerHTML
        .replace("plus", "minus")
        .replace("addRow", "removeRow");
      table.selectionChange();
    }
  };
  table.selectionChange = () => {
    if (table.hasMetadata) {
      table.registerMetadataFields();
    }

    var e = table.selectionElement.querySelector(".no-results");
    if (e)
      e.style.display = table.selectionElement.querySelector("td")
        ? "none"
        : "";
    var e = table.target.querySelector(".table-search-container .no-results");
    if (e)
      e.style.display = table.target.querySelector(".table-search-container td")
        ? "none"
        : "";

    if (table.hasMetadata) {
      var metadata = {};
      table.selectionElement
        .querySelectorAll("tr[data-primary]")
        .forEach((e) => {
          var row = {};
          e.querySelectorAll("[data-metadata]").forEach((m) => {
            row[m.getAttribute("data-metadata")] = m.value;
          });
          metadata[parseInt(e.getAttribute("data-primary"))] = row;
        });
      table.metadata = metadata;
    }

    var selection = [];
    table.selectionElement.querySelectorAll("[data-primary]").forEach((e) => {
      selection.push(parseInt(e.getAttribute("data-primary")));
    });

    table.selection = selection;

    table.selectionValueElement.value = table.hasMetadata
      ? table.getSelectedValuesAllString()
      : table.getSelectedValuesString();
  };
  if (table.hasMetadata) {
    table.metadataChange = () => {
      var out = {};
      table.selectionElement
        .querySelectorAll("tr[data-primary]")
        .forEach((e) => {
          var row = {};
          e.querySelectorAll("[data-metadata]").forEach((m) => {
            row[m.getAttribute("data-metadata")] = m.value;
          });
          out[e.getAttribute("data-primary")] = row;
        });
      table.selectionChange();
    };
    table.registerMetadataFields = () => {
      table.selectionElement
        .querySelectorAll("[data-metadata]")
        .forEach((m) => {
          m.oninput = () => {
            table.metadataChange();
          };
          m.onchange = () => {
            table.metadataChange();
          };
        });
    };
  }

  window[table.name] = table;
}

var tableRearrange = {};

window.addEventListener("dragstart", (event) => {
  if (event.target.tagName == "TR") {
    tableRearrange.source = event.target;
    tableRearrange.placeFrom = tableRearrange.source.querySelector(
      ".kolejnosc"
    ).value;
  }
  if (tableRearrange.source && tableRearrange.source.classList) {
    tableRearrange.source.classList.add("grabbed");
  }
});

window.addEventListener("dragend", () => {
  if (tableRearrange.source) {
    var input = tableRearrange.source.querySelector(".kolejnosc");
    input.value = tableRearrange.placeTo;
    rearrange(input);
  }
  removeClasses("grabbed");
  document.querySelectorAll(".tableRearrange").forEach((e) => {
    removeNode(e);
  });
  tableRearrange.element = null;
});

function rearrange(input) {
  var datatable = window[input.getAttribute("data-table")];
  var rowId = input.getAttribute("data-index");
  var toIndex = input.value;
  if (toIndex < 1) toIndex = 1;

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
      +tableRearrange.target.querySelector(".kolejnosc").value + isAfter * 1;
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
      if (findParentByClassName(obj, ["selectedRows"])) {
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
  while (elem && elem != document) {
    if (parentAttributeValue) {
      if (elem.getAttribute(parentAttribute) == parentAttributeValue) {
        return $(elem);
      }
    } else {
      if (elem.hasAttribute(parentAttribute)) {
        return $(elem);
      }
    }
    elem = elem.parentNode;
  }
  return null;
}

function findParentByTagName(elem, parentTagName) {
  while (elem && elem != document) {
    if (elem.tagName == parentTagName) {
      return $(elem);
    }
    elem = elem.parentNode;
  }
  return null;
}

function findParentById(elem, id) {
  while (elem && elem != document) {
    if (elem.id == id) {
      return $(elem);
    }
    elem = elem.parentNode;
  }
  return null;
}

function findParentByClassName(elem, parentClassNames, stopAtClassName = null) {
  while (elem && elem != document) {
    if (stopAtClassName && elem.classList.contains(stopAtClassName)) {
      return null;
    }
    if (Array.isArray(parentClassNames)) {
      for (c of parentClassNames) {
        if (elem.classList && elem.classList.contains(c)) {
          return $(elem);
        }
      }
    } else {
      if (elem.classList && elem.classList.contains(parentClassNames)) {
        return $(elem);
      }
    }

    elem = elem.parentNode;
  }
  return null;
}
function findParentByStyle(elem, style, value) {
  while (elem && elem != document) {
    if (elem.style[style] == value) {
      return $(elem);
    }
    elem = elem.parentNode;
  }
  return null;
}
function isInNode(elem, parent) {
  while (elem && elem != document) {
    if (elem == parent) {
      return true;
    }
    elem = elem.parentNode;
  }
  return false;
}

function removeClasses(className, selector = null) {
  if (selector === null) selector = `.${className}`;
  document.querySelectorAll(selector).forEach((e) => {
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
  document.querySelectorAll("[data-modal]").forEach((e) => {
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
  document.querySelector("#modal-wrapper .modal-content").appendChild(e);
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
    m.querySelectorAll(".modal-content > *").forEach((e) => {
      var shownow = false;
      if (e.id == name && e.style.display == "none") {
        e.style.display = "";
        shownow = true;
      }
      if (e.style.display != "none") total++;

      if (shownow) {
        var node = e;
        m.querySelector(".modal-content").appendChild(node);
        if (params.source) {
          var r = params.source.getBoundingClientRect();
          var p = document
            .querySelector(".modal-content")
            .getBoundingClientRect();
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
    var modal = document.querySelector(`#${name}`);
    if (modal.hasAttribute("data-expand")) {
      var q = document.querySelector(`#${name} > div`);
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
  document
    .querySelectorAll("#modal-wrapper .modal-content > *")
    .forEach((e) => {
      hideModal(e.id);
    });

  toggleBodyScroll(true);
}

function hideModalTopMost() {
  var o = document.querySelectorAll("#modal-wrapper .modal-content > *");
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

    const hideCallback = modalHideCallbacks[name];
    if (hideCallback) {
      hideCallBack();
    }
    // TODO: add cms hidecallback in cms
  }

  var visibleModalCount = 0;
  m.querySelectorAll(".modal-content > *").forEach((e) => {
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
    next = next.nextElementSibling;
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

function $(node) {
  // query selector or html node
  var node = node instanceof HTMLElement ? node : document.querySelector(node);
  if (!node) return null;
  node.$ = node.querySelector;
  node.$$ = node.querySelectorAll;
  node.setValue = (value) => {
    setValue(node, value);
  };
  node.getValue = () => {
    return getValue(node);
  };
  return node;
}
function $$(querySelectorAll) {
  var group = document.querySelectorAll(querySelectorAll);
  var res = [];
  group.forEach((node) => {
    res.push($(node));
  });
  return res;
}

// validate start

function validateForm(params) {
  registerValidateFields();

  var elem = params.form ? params.form : document;

  var fields = elem.querySelectorAll("[data-validate]");
  for (field of fields) {
    if (params.hiddenClassList) {
      // if any parant has a class like one of these ignore that field
      var found = false;
      if (findParentByClassName(field, params.hiddenClassList)) {
        found = true;
        break;
      }
      if (found) continue;
    }
    if (findParentByClassName(field, ["hidden"])) continue;

    if (!validateField(field)) {
      var visibleField = getValidationTarget(field);

      visibleField.classList.add("required");
      scrollToView(visibleField, {
        callback: () => {
          field.focus();
        },
      });
      return false;
    }
  }

  return true;
}

function getValidationTarget(field) {
  var target = field.getAttribute("data-validate-target");
  if (target) {
    return document.querySelector(target);
  }
  return field;
}

function toggleFieldCorrect(field, isCorrect) {
  var ok = field.parentNode.querySelector(".correct");
  if (ok) ok.style.display = isCorrect ? "block" : "";
  var wrong = field.parentNode.querySelector(".wrong");
  if (wrong) wrong.style.display = isCorrect ? "" : "block";
}

function validateField(field) {
  var val = field.value;

  if (val === "") return false;

  var validator = field.getAttribute("data-validate");

  if (validator == "nip") {
    if (val.replace(/[^0-9]/g, "").length != 10) return false;
  }
  if (validator == "email") {
    const re = /\S+@\S+\.\S+/;
    if (!re.test(String(val).toLowerCase())) return false;
  }
  if (validator == "password") {
    var isCorrect = val.length >= 8;
    toggleFieldCorrect(field, isCorrect);
    if (!isCorrect) {
      return false;
    }
  }
  if (validator.substr(0, 6) == "match:") {
    var target = $(validator.substr(6));
    if (!target) {
      console.warn("Password field missing");
      return;
    }
    var isCorrect = val == target.value;
    toggleFieldCorrect(field, isCorrect);
    if (!isCorrect) {
      return false;
    }
  }

  if (validator == "price") {
    if (+val <= 0.001) {
      return false;
    }
  }

  return true;
}

function registerValidateFields() {
  var fields = document.querySelectorAll(
    "[data-validate]:not([data-validate-registered])"
  );
  for (field of fields) {
    field.setAttribute("data-validate-registered", true);

    var removeRequired = () => {
      if (validateField(field)) {
        var visibleField = getValidationTarget(field);
        visibleField.classList.remove("required");
      }
    };
    field.addEventListener("input", removeRequired);
    field.addEventListener("change", removeRequired);
  }
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

function setValue(input, value) {
  if (input.classList.contains("table-selection-value")) {
    var datatable = findParentByClassName(input, "datatable-wrapper");
    window[datatable.getAttribute("data-table-name")].setSelectedValuesString(
      value
    );
  } else if (input.classList.contains("jscolor")) {
    var hex = value.replace("#", "");
    input.value = hex;
    input.style.background = hex ? "#" + hex : "";
  } else if (input.getAttribute("type") == "checkbox") {
    input.checked = value ? true : false;

    input.dispatchEvent(new Event("change"));
  } else {
    var type = input.getAttribute("data-type");
    if (type == "html") {
      var pointChild = input.getAttribute("data-point-child");
      if (pointChild) {
        input = input.querySelector(pointChild);
      }
      input.innerHTML = value;

      input.dispatchEvent(new Event("change"));
    } else if (type == "src") {
      var prefix = input.getAttribute(`data-src-prefix`);
      if (!prefix) prefix = "/uploads/df/";
      if (value) value = prefix + value;
      input.setAttribute("src", value);

      input.dispatchEvent(new Event("change"));
    } else {
      input.value = value;

      input.dispatchEvent(new Event("change"));
    }
  }
}

function getValue(input) {
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
        input = input.querySelector(pointChild);
      }
      return input.innerHTML;
    } else if (type == "src") {
      var prefix = input.getAttribute(`data-src-prefix`);
      if (!prefix) prefix = "/uploads/df/";
      var src = input.getAttribute("src");
      if (src && src.length > prefix.length) src = src.substr(prefix.length);
      return src;
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

function setFormData(data, form = null) {
  if (!form) form = document;
  Object.entries(data).forEach(([name, value]) => {
    var e = form.querySelector(`[name="${name}"]`);
    if (e && e.tagName == "SELECT") {
      if (![...e.options].find((e) => e.value == value)) {
        return;
      }
    }
    if (e) {
      setValue(e, value);
      return;
    }
  });

  resizeCallback();
}

function getFormData(form = null) {
  if (!form) form = document;
  var data = {};

  var excludeHidden = form.hasAttribute("data-exclude-hidden");
  form.querySelectorAll(`[name]`).forEach((e) => {
    if (excludeHidden && findParentByClassName(e, ["hidden"])) return;
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
  document.querySelectorAll("[data-category-picker]").forEach((e) => {
    var n = e.nextElementSibling;
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
  element.querySelectorAll(".expandY").forEach((e) => {
    e.classList.add("hidden");
  });
  element.querySelectorAll(".expand").forEach((e) => {
    e.classList.remove("open");
  });

  var singleselect = element.getAttribute("data-select") == "single";
  if (!singleselect) {
    values = values.map((e) => e.toString());
  }
  var example = null;

  element.querySelectorAll("[data-category_id]").forEach((e) => {
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
      var el = element.querySelector(`[data-category_id="${i}"]`);
      if (el) {
        toggleDisabled(el, true);
        el.checked = false;
      }
    });
  }
  if (params.disable_with_children) {
    params.disable_with_children.forEach((i) => {
      var el = element.querySelector(`[data-category_id="${i}"]`);
      if (el) {
        toggleDisabled(el, true);
        el.checked = false;
        el.parentNode.parentNode.nextSibling
          .querySelectorAll("[data-category_id]")
          .forEach((xu) => {
            toggleDisabled(xu, true);
            xu.checked = false;
          });
      }
    });
  }
}

function expandCategoriesAbove(node, alsoCurrent = true) {
  if (alsoCurrent) {
    var parent = findParentByClassName(
      node,
      "category-picker-row",
      "categories"
    );
    if (parent) {
      var nodeExpander = parent.nextElementSibling;
      if (nodeExpander && parent.querySelector(".expand")) {
        return expandCategoriesAbove(nodeExpander, false);
      }
    }
  }

  parent = node;
  while (true) {
    var parent = findParentByClassName(parent, "expandY", "categories");
    if (!parent) break;
    var btn = parent.previousSibling.querySelector(".btn");
    if (!btn) break;
    expandWithArrow(btn.parentNode.nextSibling, btn, {
      duration: 0,
    });
    parent = parent.parentNode;
  }
}

function categoryChanged(el) {
  var element = findParentByClassName(el, ["category-picker"]);
  var name = element.getAttribute(`data-category-picker-name`);
  var singleselect = element.getAttribute("data-select") == "single";
  if (singleselect) {
    if (el.checked) {
      element.querySelectorAll("[data-category_id]").forEach((e) => {
        if (e != el) e.checked = false;
      });
    } else if (!element.querySelector("[data-category_id]:checked")) {
      el.checked = true;
    }
  }

  var value = "";
  if (singleselect) {
    element.querySelectorAll("[data-category_id]").forEach((e) => {
      if (e.checked) {
        value = parseInt(e.getAttribute("data-category_id"));
        return;
      }
    });
  } else {
    checked = [];
    element.querySelectorAll("[data-category_id]").forEach((e) => {
      if (e.checked) {
        checked.push(parseInt(e.getAttribute("data-category_id")));
      }
    });
    value = JSON.stringify(checked);
  }
  $(`[name=${name}]`).value = value;

  if (el.checked) {
    var expandWhenClosed = el.parentNode.parentNode.querySelector(
      ".expand:not(.open)"
    );
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
    //url: `/helpers/categories_template&parent_id=${parent_id}`,
    success: (c) => {
      /*if (!$(`.category-picker-template-${parent_id}`)) {
          document.body.insertAdjacentHTML("beforeend",`<template class="category-picker-template-${parent_id}"></template>`);
      }
      document.querySelectorAll(`.category-picker[parent_id="${parent_id}"], .category-picker-template-${parent_id}`).forEach(e=>{
          e.innerHTML = c;
      });*/
      document
        .querySelectorAll(
          `.category-picker[data-category-picker-source="${source}"]`
        )
        .forEach((e) => {
          [...e.children].forEach((e) => {
            removeNode(e);
          });
          e.insertAdjacentHTML("afterbegin", c);

          if (options.skip) {
            var kid = e.querySelector(
              `.category-picker-column `.repeat(options.skip)
            );
            if (kid) {
              e.innerHTML = kid.innerHTML;
            }
          } else {
            var main = e.querySelector(".category_name");
            if (main)
              main.innerHTML = nonull(
                options.main_category,
                "Kategoria główna"
              );

            var parent_id = e.getAttribute("scope_parent_id");
            if (parent_id && parent_id != 0) {
              e.innerHTML = e.querySelector(
                `[data-parent_id="${parent_id}"]`
              ).outerHTML;
            }
          }
        });

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
  document.querySelectorAll(".mobile-hover").forEach((e) => {
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
  var e = document.querySelector(".hovered");
  var toggle = document.querySelector(".hovered .dropdown-header");
  if (e && (!isInNode(event.target, e) || isInNode(event.target, toggle))) {
    //if (e && !isInNode(event.target, e)) {
    e.classList.remove("hovered");
  }
});

/* tab menu start */

document.addEventListener("click", (event) => {
  var t = event.target;
  var option = findParentByClassName(t, "tab-option");
  var menu = findParentByClassName(t, "tab-menu");
  if (!option || !header) return;

  var tab_id = option.getAttribute("data-tab_id");

  showTab(menu, tab_id);
});

function showTab(tab_menu, tab_id) {
  tab_menu.querySelectorAll(".tab-header .tab-option").forEach((e) => {
    e.classList.toggle("current", e.getAttribute("data-tab_id") == tab_id);
  });
  tab_menu.querySelectorAll(".tab-content").forEach((e) => {
    e.classList.toggle("hidden", e.getAttribute("data-tab_id") != tab_id);
  });
}

/* tab menu end */

/* notification start */

function showNotification(message, params = {}) {
  document.querySelectorAll(".notification").forEach((e) => {
    e.style.opacity = 0;
    e.style.top = "-10px";
  });
  var notification = document.createElement("DIV");
  notification.className = "notification";
  notification.insertAdjacentHTML(
    "beforeend",
    `
    <i class="fa fa-times-circle" onclick="dismissNotification(this.parentNode)"></i>
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
  document.querySelectorAll("[data-cookie]").forEach((e) => {
    e.addEventListener("change", () => {
      if (ignoreValueChanges) return;
      var cookieName = e.getAttribute("data-cookie");
      if (!cookieName) cookieName = e.getAttribute("name");
      setCookie(cookieName, e.value);
    });
  });
});

function loadFormFromCookies() {
  document.querySelectorAll("[data-cookie]").forEach((e) => {
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
        res = JSON.parse(res);
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
  var wrapper = findParentByClassName(obj, "miejscowosc-picker-wrapper");
  if (!wrapper) {
    console.warn("miejscowosc picker wrapper missing");
    return;
  }
  var target = wrapper.querySelector(".miejscowosc-picker-target");
  if (!target) {
    console.warn("miejscowosc picker target missing");
    return;
  }
  return target;
}

function getMiejscowoscPickerList(obj) {
  if (!obj) return;
  var wrapper = findParentByClassName(obj, "miejscowosc-picker-wrapper");
  if (!wrapper) {
    console.warn("miejscowosc picker wrapper missing");
    return;
  }
  var list = wrapper.querySelector(".miejscowosc-picker-list");
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
  document.querySelectorAll("nav > div").forEach((e) => {
    e.addEventListener("mouseenter", () => {
      var x = e.querySelector(".float-category");
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

  document.querySelectorAll(".cms-container").forEach((e) => {
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
  document.querySelectorAll(`[${attribute}]`).forEach((e) => {
    e.style.width = e.getAttribute(attribute);
  });

  var attribute = `data-${responsiveType}-min-height`;
  document.querySelectorAll(`[${attribute}]`).forEach((e) => {
    e.style.minHeight = e.getAttribute(attribute);
  });

  for (let direction of ["Left", "Right", "Top", "Bottom"]) {
    for (let type of ["margin", "padding"]) {
      var attribute = `data-${type}_${direction.toLowerCase()}`;
      document.querySelectorAll(`[${attribute}]`).forEach((e) => {
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
            (e.parentNode.getBoundingClientRect().width * parseInt(v)) / 100 +
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
  document.querySelectorAll(`[${attribute}]`).forEach((e) => {
    e.style.justifyContent = e.getAttribute(attribute);
  });

  var attribute = `data-${responsiveType}-align-items`;
  document.querySelectorAll(`[${attribute}]`).forEach((e) => {
    e.style.alignItems = e.getAttribute(attribute);
  });

  var attribute = `data-${responsiveType}-flex-flow`;
  document.querySelectorAll(`[${attribute}]`).forEach((e) => {
    e.style.flexFlow = e.getAttribute(attribute);
  });
}

/* custom css engine end */

/* custom selectbox start */

window.addEventListener("DOMContentLoaded", function () {
  registerSelectboxes();
});

function registerSelectboxes() {
  document.querySelectorAll(".selectbox:not(.registered)").forEach((e) => {
    e.classList.add("registered");
    e.querySelectorAll("[data-option]").forEach((o) => {
      o.addEventListener("click", () => {
        var i = e.querySelector("input");
        if (i) {
          setValue(i, o.getAttribute("data-option"));
          o.blur();
        }
      });
    });
  });
  /*document.querySelectorAll(".selectbox:not(.showhover)").forEach((e) => {
    e.classList.add("showhover");
    e.querySelectorAll("[data-option]").forEach((o) => {
      o.addEventListener("click", () => {
        var i = e.querySelector("input");
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
  document
    .querySelectorAll("[data-show-count]:not(.registered)")
    .forEach((e) => {
      e.classList.add("registered");
      e.addEventListener("change", () => {
        e.nextElementSibling.querySelector("span").innerHTML = e.value.length;
        if (e.value.length > e.getAttribute("data-show-count")) {
          e.nextElementSibling.style.color = "#f00";
          e.nextElementSibling.style.fontWeight = "bold";
        } else if (e.value.length > 0.9 * e.getAttribute("data-show-count")) {
          e.nextElementSibling.style.color = "#fa0";
          e.nextElementSibling.style.fontWeight = "bold";
        } else {
          e.nextElementSibling.style.color = "";
          e.nextElementSibling.style.fontWeight = "";
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
      var json = JSON.parse(res);

      setContent($("#basketContent"), json.basket_content_html);

      $("#amount").innerHTML = json.item_count; // header basket

      if (callback) {
        callback(json);
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

// simple list start

function createSimpleList(params = {}) {
  var list = {};
  list.name = params.name;
  list.fields = params.fields;
  list.params = params;
  list.recursive = nonull(params.recursive, 0);

  list.wrapper = $(`.${params.name}`);
  list.wrapper.classList.add("simple-list");

  var className = "";

  if (!params.title) {
    params.title = "";
  }

  if (params.title) {
    className = "field-title";
  }

  list.wrapper.insertAdjacentHTML(
    "afterbegin",
    `
      <div class="${className}">
          <span>${params.title}</span>
          <div class="btn primary" onclick="${list.name}.insertRow(this,true)">Dodaj <i class="fas fa-arrow-up"></i></div>
          <div class="btn primary" onclick="${list.name}.insertRow(this,false)">Dodaj <i class="fas fa-arrow-down"></i></div>
      </div>
      <div class="list"></div>
      <input type="hidden" class="simple-list-value" name="${list.name}" onchange="${list.name}.setValuesFromString(this.value)">
  `
  );

  list.insertRow = (btn, begin = true) => {
    list.addRow(params.default_row, btn.parentNode.nextElementSibling, begin);
  };

  list.target = $(`.${params.name} .list`);
  list.target.setAttribute("data-depth", 1);

  list.outputNode = document.querySelector(
    `.${params.name} .simple-list-value`
  );

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

    addValues = (values, listTarget = null) => {
      if (listTarget === null) {
        listTarget = list.target;
      }
      for (var value_data of values) {
        var parent_value_list = list.addRow(value_data.values, listTarget);
        if (value_data.children) {
          addValues(value_data.children, parent_value_list);
        }
      }
    };
    addValues(values);
  };

  list.addRow = (values, listTarget = null, begin = false) => {
    if (listTarget === null) {
      listTarget = list.target;
    }

    var canAdd = true;

    [...listTarget.children].forEach((simpleListRowWrapper) => {
      simpleListRowWrapper
        .querySelector(".simple-list-row")
        .querySelectorAll("[data-list-param]")
        .forEach((e) => {
          var param = e.getAttribute("data-list-param");
          if (
            list.fields[param].unique &&
            getValue(e) == values[param] &&
            getValue(e) !== ""
          ) {
            canAdd = false;
          }
        });
    });

    if (!canAdd) {
      return;
    }

    var depth = parseInt(listTarget.getAttribute("data-depth"));

    var addBtn =
      depth < list.recursive
        ? `<div style="padding: 5px 0">
              <span>Powiązane wartości</span>
              <div class="btn primary" onclick="${list.name}.insertRow(this,true)">Dodaj <i class="fas fa-arrow-up"></i></div>
              <div class="btn primary" onclick="${list.name}.insertRow(this,false)">Dodaj <i class="fas fa-arrow-down"></i></div>
          </div>`
        : "";

    listTarget.insertAdjacentHTML(
      begin ? "afterbegin" : "beforeend",
      `
          <div class='simple-list-row-wrapper'>
              <div class='simple-list-row'>
                  ${params.render(values)}
                  <div style="flex-grow:1"></div>
                  <i class="btn secondary fas fa-arrow-up" onclick="swapNodes(this.parentNode.parentNode,this.parentNode.parentNode.previousElementSibling);${
                    list.name
                  }.valuesChanged();"></i>
                  <i class="btn secondary fas fa-arrow-down" onclick="swapNodes(this.parentNode.parentNode,this.parentNode.parentNode.nextElementSibling);${
                    list.name
                  }.valuesChanged();"></i>
                  <div style="width:10px"></div>
                  <i class="btn secondary fas fa-times" onclick="removeNode(this.parentNode.parentNode);${
                    list.name
                  }.valuesChanged();"></i>
              </div>
              <div class="sub-list">
                  ${addBtn}
                  <div class="list" data-depth="${1 + depth}"></div>
              </div>
          </div>
      `
    );

    list.valuesChanged();

    [
      ...list.target.querySelectorAll(
        "[data-list-param]:not(.param-registered)"
      ),
    ].forEach((e) => {
      e.classList.add("param-registered");

      e.addEventListener("change", () => {
        list.valuesChanged();
      });
    });

    var n = begin ? 0 : listTarget.children.length - 1;
    return listTarget.children[n].querySelector(".list");
  };

  list.valuesChanged = () => {
    var getDirectRows = (listTarget, level) => {
      var rows = [];
      [...listTarget.children].forEach((simpleListRowWrapper) => {
        var row = {
          values: {},
        };
        simpleListRowWrapper
          .querySelector(".simple-list-row")
          .querySelectorAll("[data-list-param]")
          .forEach((e) => {
            var param = e.getAttribute("data-list-param");
            row.values[param] = getValue(e);
          });
        if (level < list.recursive) {
          row.children = getDirectRows(
            simpleListRowWrapper.querySelector(".sub-list > .list"),
            level++
          );
        }

        rows.push(row);
      });
      return rows;
    };

    list.values = getDirectRows(list.target, 1);

    list.outputNode.value = JSON.stringify(list.values);
  };

  if (params.output) {
    $(params.output).setAttribute("data-type", "simple-list");
  }

  window[list.name] = list;
}

// simple list end

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
