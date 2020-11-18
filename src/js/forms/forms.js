/* js[global] */

windowload(() => {
  registerForms();
});

window.addEventListener("beforeunload", function (e) {
  var form = $("[data-warn-before-leave]");
  if (!form) {
    return;
  }

  const wasState = form.initial_state;
  const nowState = form.history.last();

  if (isEquivalent(wasState, nowState)) {
    e.returnValue = "Czy na pewno chcesz opuścić stronę?";
  }
});

function checkFormCloseWarning(form) {
  const wasState = form.initial_state;
  const nowState = form.history ? form.history.last() : getFormData(form);

  if (isEquivalent(wasState, nowState)) {
    return confirm(
      "Wprowadzone zmiany zostaną usunięte, czy chcesz je anulować?"
    );
  }
  return true;
}

function setFormInitialState(form) {
  form = $(form);
  form.initial_state = getFormData(form);

  form.history = [form.initial_state];
  registerFormHistory(form);
}

// form can be piepquery or selector
function setFormData(data, form, params = {}) {
  form = $(form);

  form.setting_data = true;

  if (!data) {
    return;
  }

  var find_by = nonull(params.find_by, "name");

  registerForms();

  Object.entries(data).forEach(([name, value]) => {
    if (typeof value === "object") {
      var sub_form = form.find(`[data-form="${name}"]`);
      if (sub_form) {
        // not always found, thats tricky
        return setFormData(value, sub_form, params);
      }
    }

    var selector = `[${find_by}="${name}"]`;
    var e = form.find(selector);
    if (!e) {
      return;
    }

    var parent_named_node = e.findParentByAttribute("name", {
      skip: 1,
    });
    // only direct named children communicate with subform
    if (parent_named_node && parent_named_node.findParentNode(form)) {
      return;
    }

    var value_params = {};
    if (params.data && params.data[name]) {
      value_params = params.data[name];
    }

    if (params.history && e.hasAttribute("data-ignore-history")) {
      return;
    }

    e.setValue(value, value_params);
  });

  delete form.setting_data;

  if (!form.initial_state) {
    setFormInitialState(form);
  }

  resizeCallback();
  lazyLoadImages(false);

  form.setAttribute("data-loaded", true);
}

function getFormData(form, params = {}) {
  if (!form) {
    return;
  }
  form = $(form);
  var data = {};

  var find_by = nonull(params.find_by, "name");

  var excludeHidden = form.hasAttribute("data-exclude-hidden");

  $(form)
    .findAll(`[${find_by}]`)
    .forEach((e) => {
      if (excludeHidden && e.findParentByClassName("hidden")) {
        return;
      }
      var parent_named_node = e.findParentByAttribute("name", {
        skip: 1,
      });
      // only direct named children communicate with subform
      if (parent_named_node && parent_named_node.findParentNode(form)) {
        return;
      }

      var field_name = e.getAttribute(find_by);
      var field_value = getValue(e);

      var parent_sub_form = e;
      var inside = true;

      while (parent_sub_form) {
        if (!parent_sub_form.findParentNode(form, { skip: 1 })) {
          inside = false;
          break;
        }

        var p = parent_sub_form.findParentByAttribute("data-form", {
          skip: 1,
        });
        if (p != form) {
          parent_sub_form = p;
        } else {
          break;
        }
      }
      if (inside && parent_sub_form && parent_sub_form != e) {
        field_name = parent_sub_form.getAttribute("data-form");
        field_value = getFormData(parent_sub_form);
      }

      data[field_name] = field_value;
    });

  return data;
}

var scrollingToInvalid = false;
function scrollToInvalid(field) {
  if (scrollingToInvalid) {
    return;
  }
  scrollingToInvalid = true;
  scrollIntoView(field, {
    callback: () => {
      scrollingToInvalid = false;
      field.focus();
    },
  });
}

domload(() => {
  registerForms();
});

function registerForms(form = null) {
  form = $(form);
  if (form === null) {
    inputs = $(document.body).findAll(
      //"[data-form] [data-validate]:not(.change-registered)"
      `[data-form] [name]:not(.change-registered)`
    );
  } else {
    //inputs = $(form).findAll("[data-validate]:not(.change-registered)");
    inputs = form.findAll(`[name]:not(.change-registered)`);

    form.addEventListener("keydown", (e) => {
      setTimeout(() => {
        if (e.key === "Enter") {
          var submit = $(form).find("[data-submit]");
          if (submit) {
            submit.click();
          }
        }
      });
    });
  }

  window.dispatchEvent(new Event("register-form-components"));

  var unique_forms = [];
  inputs.forEach((field) => {
    const parent_form = field.findParentByAttribute("data-form");

    field.parent_form = parent_form;

    if (unique_forms.indexOf(parent_form) === -1) {
      unique_forms.push(parent_form);
    }

    field.classList.add("change-registered");
    field.addEventListener("change", formFieldOnChangeEvent);

    /*if (field.getAttribute("data-validate").indexOf("backend") === 0) {
        field.setValue();
      }*/

    var obj = field;
    if (field.type == "checkbox") {
      obj = obj.parent();
    }

    if (
      field.classList.contains("field") &&
      !field.classList.contains("warn-triangle") &&
      !field.classList.contains("warn-outline") &&
      !field.classList.contains("no-wrap")
    ) {
      // TODO: what if the user defined the field wrapper already? should be left as it is
      obj.insertAdjacentHTML("afterend", `<div class="field-wrapper"></div>`);
      var field_wrapper = obj.next();
      field_wrapper.appendChild(obj);
      if (field.classList.contains("inline")) {
        field_wrapper.classList.add("inline");
      }
      var dwc = field.getAttribute("data-wrapper-class");
      if (dwc) {
        field_wrapper.classList.add(...dwc.split(" "));
      }

      var dws = field.getAttribute("data-wrapper-style");
      if (dws) {
        field_wrapper.style.cssText = dws;
      }

      if (field.hasAttribute("data-validate")) {
        field_wrapper.insertAdjacentHTML(
          "beforeend",
          `
          <div class="input-elements">
            <div class="input-error-indicator">
              <img class='correct check-icon' src='/src/img/check-green-thick.svg'>
              <img class='wrong cross-icon' src='/src/img/cross-red-thick.svg'>
            </div>
            <div class="validation-error-box expand_y hidden animate_hidden">
             <div class="message"></div>
            </div>
          </div>
        `
        );
      }
    }

    if (field.hasAttribute("data-input-change")) {
      field.addEventListener("input", () => {
        var ddc = field.getAttribute("data-input-change");
        if (ddc) {
          setTimeout(() => {
            field.setValue();
          }, ddc);
        } else {
          field.setValue();
        }
      });
    }
  });

  for (const form of unique_forms) {
    registerFormHistory(form);
  }
}

function formFieldOnChangeEvent(event) {
  const field = event.target;
  formFieldOnChange(field);

  const parent_form = field.parent_form;
  if (parent_form && parent_form.history && !parent_form.setting_data) {
    if (!field.hasAttribute("data-ignore-history")) {
      pushFormHistory(parent_form);
    }
  }
  field.prev_value = field.getValue();
}

function formFieldOnChange(field, options = {}) {
  if (!field.classList.contains("change-registered")) {
    return;
  }
  if (!field.classList.contains("input-registered")) {
    field.classList.add("input-registered");
    field.addEventListener("input", formFieldOnInputEvent);
  }
  return formFieldOnInput(field, options);
}

function formFieldOnInputEvent(event) {
  formFieldOnInput(event.target);
}

function formFieldOnInput(field, options = {}) {
  if (!field.classList.contains("input-registered")) {
    return;
  }
  const errors = fieldErrors(field);

  showFieldErrors(field, errors, options);
  return errors;
}

function togglePasswordFieldType(btn, input, make_visible = null) {
  var make_visible = nonull(make_visible, btn.classList.contains("fa-eye"));
  if (make_visible) {
    btn.classList.replace("fa-eye", "fa-eye-slash");
    btn.setAttribute("data-tooltip", "Ukryj hasło");
    input.type = "text";
  } else {
    btn.classList.replace("fa-eye-slash", "fa-eye");
    btn.setAttribute("data-tooltip", "Pokaż hasło");
    input.type = "password";
  }
}

function rewrite(source, target, options = {}) {
  var val = source.getValue();
  if (options.link) {
    val = escapeUrl(val);
  }
  target.setValue(val);
}
