/* js[global] */

function setCategoryPickerValue(element, value, params = {}) {
	if (typeof value === "string") {
		try {
			value = JSON.parse(value);
			setCategoryPickerValue(element, value, params);
		} catch (e) {}
		return;
	}

	element = $(element);

	element.category_picker = {
		value: value,
	};

	element._children(".expand_y").forEach((e) => {
		e.classList.add("hidden");
		e.style.height = "0";
	});
	element._children(".expand_arrow").forEach((e) => {
		e.classList.remove("open");
	});

	var singleselect = element.hasAttribute("data-single");
	if (!singleselect) {
		value = value.map((e) => e.toString());
	}
	var example = null;
	element._children("[data-category_id]").forEach((e) => {
		if (!example) example = e;

		e.toggleAttribute("disabled", false);

		var check = false;
		if (singleselect) {
			if (value != null && value != undefined) {
				check = value.toString() == e.getAttribute("data-category_id");
			}
		} else {
			check = value.indexOf(e.getAttribute("data-category_id")) !== -1;
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
			var el = element._child(`[data-category_id="${i}"]`);
			if (el) {
				el.toggleAttribute("disabled", true);
				el.checked = false;
			}
		});
	}
	if (params.disable_with_children) {
		params.disable_with_children.forEach((i) => {
			var el = element._child(`[data-category_id="${i}"]`);
			if (el) {
				el.toggleAttribute("disabled", true);
				el.checked = false;
				el.parent()
					.parent()
					._next()
					._children("[data-category_id]")
					.forEach((xu) => {
						xu.toggleAttribute("disabled", true);
						xu.checked = false;
					});
			}
		});
	}
}

function expandCategoriesAbove(node, alsoCurrent = true) {
	if (!node) {
		return;
	}

	node = $(node);
	if (alsoCurrent) {
		var parent = node._parent(".category-picker-row, .categories");
		if (parent) {
			var nodeExpander = parent._next();
			if (nodeExpander && parent._child(".expand_arrow")) {
				return expandCategoriesAbove(nodeExpander, false);
			}
		}
	}

	parent = node;
	while (true) {
		var parent = parent._parent(".expand_y, .categories");
		if (!parent) {
			return;
		}
		var btn = parent._prev();
		if (!btn) {
			return;
		}
		var submenu = btn._next();
		if (!submenu) {
			return;
		}
		expandMenu(submenu, btn, true, {
			duration: 0,
		});
		parent = parent.parent();
	}
}

function categoryChanged(el) {
	el = $(el);
	var element = el._parent(".category-picker");
	var singleselect = element.hasAttribute("data-single");
	if (singleselect) {
		if (el.checked) {
			element._children("[data-category_id]").forEach((e) => {
				if (e != el) e.checked = false;
			});
		} else if (!element._child("[data-category_id]:checked")) {
			el.checked = true;
		}
	}

	var value = "";
	if (singleselect) {
		element._children("[data-category_id]").forEach((e) => {
			if (e.checked) {
				value = parseInt(e.getAttribute("data-category_id"));
				return;
			}
		});
	} else {
		checked = [];
		element._children("[data-category_id]").forEach((e) => {
			if (e.checked) {
				checked.push(parseInt(e.getAttribute("data-category_id")));
			}
		});
		value = checked;
	}
	element.category_picker.value = value;

	if (el.checked) {
		var expandWhenClosed = el
			.parent()
			.parent()
			._child(".expand_arrow:not(.open)");
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
				e._direct_children().forEach((e) => {
					e.remove();
				});
				e.insertAdjacentHTML("afterbegin", c);

				if (options.skip) {
					var kid = e._child(`.category-picker-column `.repeat(options.skip));
					if (kid) {
						e.innerHTML = kid.innerHTML;
					}
				} else {
					var main = e._child(".category_name");
					if (main)
						main.innerHTML = def(options.main_category, "Kategoria główna");

					var parent_id = e.getAttribute("scope_parent_id");
					if (parent_id && parent_id != 0) {
						e.innerHTML = e._child(`[data-parent_id="${parent_id}"]`).outerHTML;
					}
				}
			});

			if (callback) {
				callback();
			}
		},
	});
}
