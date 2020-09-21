/* js[global] */

function setCategoryPickerValuesString(element, values, params = {}) {
  element = $(element);

  element.setAttribute("value", values);

  element.findAll(".expand_y").forEach((e) => {
    e.classList.add("hidden");
    e.style.height = "0";
  });
  element.findAll(".expand_arrow").forEach((e) => {
    e.classList.remove("open");
  });

  var singleselect = element.hasAttribute("data-single");
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
      if (nodeExpander && parent.find(".expand_arrow")) {
        return expandCategoriesAbove(nodeExpander, false);
      }
    }
  }

  parent = node;
  while (true) {
    var parent = parent.findParentByClassName(["expand_y", "categories"]);
    if (!parent) break;
    var btn = parent.prev().find(".btn");
    if (!btn) break;
    expandWithArrow(btn.parent().next(), btn, true, {
      duration: 0,
    });
    parent = parent.parent();
  }
}

function categoryChanged(el) {
  el = $(el);
  var element = el.findParentByClassName("category-picker");
  var singleselect = element.hasAttribute("data-single");
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
  element.setAttribute("value", value);

  if (el.checked) {
    var expandWhenClosed = el
      .parent()
      .parent()
      .find(".expand_arrow:not(.open)");
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
  xhr({
    url: `/helpers/categories_template&table=${source}`,
    type: "text",
    success: (c) => {
      $$(`.category-picker[data-source="${source}"]`).forEach((e) => {
        [...e.children].forEach((e) => {
          removeNode(e);
        });
        e.insertAdjacentHTML("afterbegin", c);

        if (options.skip) {
          var kid = e.find(`.category-picker-column `.repeat(options.skip)); // TODO: idk what it is
          if (kid) {
            e.innerHTML = kid.innerHTML;
          }
        } else {
          var main = e.find(".category_name");
          if (main)
            main.innerHTML = nonull(options.main_category, "Kategoria główna");

          var parent_id = e.getAttribute("scope_parent_id");
          if (parent_id && parent_id != 0) {
            e.innerHTML = e.find(`[data-parent_id="${parent_id}"]`).outerHTML;
          }
        }
      });

      if (callback) {
        callback();
      }
    },
  });
}
