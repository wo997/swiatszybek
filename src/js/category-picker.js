/* js[global] */

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
