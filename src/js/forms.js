/* js[global] */

window.addEventListener("load", () => {
  $$("[data-form]").forEach((form) => {
    registerForm(form);
  });
});

function showFieldErrors(field, errors = [], options = {}) {
  if (errors === null) {
    return;
  }

  field = $(field);

  var wrong = Array.isArray(errors) && errors.length > 0;

  // rare
  var error_target = field.getAttribute("data-error-target");
  if (error_target) {
    $(error_target).classList.toggle("field-error-visible", wrong);
  }

  // look inside or above
  var field_title = field.find(".field-title");
  if (!field_title) {
    var previousNode = field.prev();
    if (previousNode && previousNode.classList.contains("field-title")) {
      field_title = previousNode;
    }
  }
  if (!field_title) {
    const field_wrapper = field.findParentByClassName("field-wrapper");
    if (field_wrapper) {
      field_title = field_wrapper.find(".field-title");
    }
  }

  if (field.classList.contains("warn-triangle")) {
    if (field_title) {
      var warning = field_title.find(".fa-exclamation-triangle");
      if (warning) {
        warning.remove();
      }

      if (wrong) {
        field_title.insertAdjacentHTML(
          "beforeend",
          `<i
              class="fas fa-exclamation-triangle"
              style="color: red;transform: scale(1.25);margin-left:4px"
              data-tooltip="${errors.join("<br>")}">
            </i>`
        );
      }
    }
  } else if (field.classList.contains("warn-outline")) {
    field.classList.toggle("warn-outline-active", wrong);
  } else {
    var wrapper = field;
    if (field.type == "checkbox") {
      wrapper = wrapper.parent();
    }

    const inputElements = wrapper.next();
    const validationBox = inputElements
      ? inputElements.find(".validation-error-box")
      : null;
    const correctIndicator = inputElements
      ? inputElements.find(".input-error-indicator .correct")
      : null;
    if (!correctIndicator && field.hasAttribute("data-validate")) {
      console.error(
        field,
        "To validate the form you need to be register it with registerForm(form) or add data-form attribute before content is loaded"
      );
      return;
    }
    const wrongIndicator = inputElements
      ? inputElements.find(".input-error-indicator .wrong")
      : null;
    const toggleErrorIcons = (type) => {
      if (correctIndicator && wrongIndicator) {
        if (type == "correct") {
          wrongIndicator.classList.remove("visible");
          correctIndicator.classList.add("visible");
        } else if (type == "wrong") {
          correctIndicator.classList.remove("visible");
          wrongIndicator.classList.add("visible");
        } else {
          correctIndicator.classList.remove("visible");
          wrongIndicator.classList.remove("visible");
        }
      }
    };

    if (wrong) {
      toggleErrorIcons("wrong");
      validationBox.find(".message").innerHTML = errors.join("<br>");
      expand(validationBox, true, {
        duration: 350,
      });
    } else {
      if (errors === "blank") {
        toggleErrorIcons("blank");
        expand(validationBox, false, {
          duration: 350,
        });
      } else {
        toggleErrorIcons("correct");
        expand(validationBox, false, {
          duration: 350,
        });
      }
    }
  }

  if (wrong) {
    if (options.scroll) {
      scrollToInvalid(field);
    }
  } else {
    if (window.fieldRequiringFilling == field) {
      window.fieldRequiringFilling = null;
    }
  }
}

function validateForm(form, params = {}) {
  // var elem = params.form ? $(params.form) : document;
  form = $(form);

  var fields = form.findAll("[data-validate]");
  for (field of fields) {
    if (params.hiddenClassList) {
      // if any parent has a class like one of these ignore that field
      var found = false;
      if (field.findParentByClassName(params.hiddenClassList)) {
        found = true;
        break;
      }
      if (found) {
        continue;
      }
    }
    if (field.findParentByClassName("hidden")) continue;

    if (
      params.except_backend &&
      field.getAttribute("data-validate").indexOf("backend") === 0
    ) {
      continue;
    }

    var errors = formFieldOnChange(field, { scroll: true });
    if (Array.isArray(errors) && errors.length > 0) {
      return false;
    }
  }

  return true;
}

function getSizeValidationErrors(valLen, condition, message) {
  var lengthInfo = "";
  if (condition.indexOf("+") > 0) {
    var minLen = condition.replace("+", "");
    if (valLen < minLen) {
      lengthInfo = `min. ${minLen}`;
    }
  } else if (condition.indexOf("-") > 0) {
    var maxLen = condition.replace("-", "");
    if (valLen > maxLen) {
      lengthInfo = `max. ${maxLen}`;
    }
  } else if (/\d-\d/.test(condition)) {
    var [from, to] = condition.split("-");
    from = parseInt(from);
    to = parseInt(to);
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
  return false;
}

function fieldErrors(field) {
  field = $(field);

  var field_errors = [];
  var newError = (message) => {
    message = message ? message.trim() : "";
    if (field_errors.indexOf(message)) {
      field_errors.push(message);
    }
  };

  if (!field.hasAttribute("data-validate")) {
    return [];
  }

  var validator = field.getAttribute("data-validate");
  var [validatorType, ...validatorParams] = validator.split("|");

  var val = field.getValue();

  var optional = validator.indexOf("|optional") !== -1;

  if (val === "") {
    // if not empty - validate, clear af
    if (optional) {
      return [];
    }

    // show just one field that requires filling, dont abuse our cute user
    if (window.fieldRequiringFilling && window.fieldRequiringFilling != field) {
      return null;
    }

    window.fieldRequiringFilling = field;
    newError("Uzupełnij to pole");
    return field_errors;
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
              var rowField = listRowWrapper.find(`[name="${fieldName}"]`);

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

  var params = {};
  if (validatorParams !== undefined && validatorParams.length !== 0) {
    validatorParams.forEach((param) => {
      var parts = param.split(":");
      if (parts.length == 0) {
        parts[1] = null;
      }
      params[parts[0]] = parts[1];
    });

    if (params["value"]) {
      var isCorrect = val == params["value"];
      if (!isCorrect) {
        if (params["value"] == 0) {
          newError("Musi być odznaczone");
        } else {
          newError("Pole wymagane");
        }
      }
    }

    if (params["match"]) {
      var target = $(params["match"]);
      if (!target) {
        console.warn("Field missing");
      }
      var isCorrect = val == target.getValue();
      if (!isCorrect) {
        newError("Wartości nie są identyczne");
      }
    }

    if (params["length"]) {
      var errors = getSizeValidationErrors(
        val.length,
        params["length"],
        (info) => {
          return `Wymagana ilość znaków: ${info}`;
        }
      );
      if (errors) {
        newError(errors);
      }
    }

    if (params["custom"]) {
      if (params["delay"]) {
        delay(params["custom"], params["delay"], window, [field]);
        return null;
      } else {
        var errors = window[params["custom"]](field);
        if (errors) {
          newError(errors);
        }
      }
    }

    if (params["blank_on_change"]) {
      return "blank";
    }

    if (isList) {
      var list = window[field.getAttribute("data-list-name")];

      if (params["count"]) {
        var errors = getSizeValidationErrors(
          list.values.length,
          params["count"],
          (info) => {
            return `Wymagana ilość elementów: ${info}`;
          }
        );

        if (errors) {
          newError(errors);
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

      if (!isCorrect) {
        newError("Wymagana długość: 8 znaków");
      }
    }
  } else if (validatorType == "price") {
    if (+val <= 0.001) {
      newError("Wpisz dodatnią wartość");
    }
  } else if (validatorType == "youtube-video") {
    if (!getIdFromYoutubeUrl(val)) {
      newError("Wpisz poprawny link do filmu z Youtube");
    }
  } else if (validatorType == "backend") {
    return null;
  }

  return field_errors;
}

function clearAllErrors(node = null) {
  var fields = node
    ? $(node).findAll(`[data-validate]`)
    : $$(`[data-form] [data-validate]`);
  fields.forEach((field) => {
    var errors = fieldErrors(field);
    if (Array.isArray(errors) && errors.length > 0) {
      showFieldErrors(field, "blank");
      field.removeEventListener("input", formFieldOnInputEvent);
    }
  });
}

const formInitialStates = {};

window.addEventListener("beforeunload", function (e) {
  var form = $("[data-warn-before-leave]");
  if (!form) {
    return;
  }

  const wasState = JSON.stringify(formInitialStates[form.id]);
  const nowState = JSON.stringify(getFormData(form));
  if (wasState !== nowState) {
    e.returnValue = "Czy na pewno chcesz opuścić stronę?";
  }
});

function checkFormCloseWarning(name) {
  var wasState = formInitialStates[name];
  var nowState = getFormData($(`#${name}`));

  if (JSON.stringify(wasState) !== JSON.stringify(nowState)) {
    return confirm(
      "Wprowadzone zmiany zostaną usunięte, czy chcesz je anulować?"
    );
  }
  return true;
}

function setFormInitialState(form) {
  form = $(form);
  if (form.id) {
    formInitialStates[form.id] = getFormData(form);
  }
}

// form can be piepquery or selector
function setFormData(data, form, params = {}) {
  form = $(form);

  if (!data) {
    return;
  }

  var find_by = nonull(params.find_by, "name");

  // just in case
  if (window.registerRangeSliders) {
    registerRangeSliders();
  }
  if (window.registerDatepickers) {
    registerDatepickers();
  }
  if (window.jscolor) {
    jscolor.installByClassName();
  }

  //console.log("DATA", form, JSON.stringify(data));
  var counter = 666;
  Object.entries(data).forEach(([name, value]) => {
    var selector = `[${find_by}="${name}"]`;
    var e = form.find(selector);
    //console.log(counter++, name, e, value, JSON.stringify(data));
    if (!e) {
      return;
    }
    var value_params = {};
    if (params.data && params.data[name]) {
      value_params = params.data[name];
    }

    //console.trace();

    //console.log(value);
    //console.log(e);
    e.setValue(value, value_params);
  });

  if (params.is_load !== false) {
    setFormInitialState(form);
  }
  resizeCallback();
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
      // there is no other component allowed when we read the data, we use its value instead
      if (parent_named_node && parent_named_node.findParentNode(form)) {
        return;
      }
      data[e.getAttribute(find_by)] = getValue(e);
    });
  return data;
}

function addMessageBox(elem, message, params = {}) {
  elem = $(elem);

  var mb = elem.find(".message-box");
  if (mb) {
    toggleMessageBox(elem, false, {
      callback: () => {
        mb.remove();
        addMessageBox(elem, message, params);
      },
    });
    return;
  }

  const type = nonull(params.type, "info");
  const show = nonull(params.show, true);
  const inline = nonull(params.inline, false);

  const types = {
    // default type
    info: {
      className: "",
      icon: "<i class='fas fa-info-circle'></i>",
    },
    warning: {
      className: "warning",
      icon: "<i class='fas fa-exclamation-circle'></i>",
    },
  };

  var dismiss_btn = params.dismissable
    ? `
      <button class="btn transparent" onclick="toggleMessageBox($(this).parent().parent().parent(), false)">
        <img class='cross-icon' src='/src/img/cross.svg'>
      </button>
    `
    : "";

  elem.setContent(`
    <div class="message-box expand_y hidden animate_hidden">
      <div class="message-container ${types[type].className} ${
    inline ? "inline" : ""
  }"
      >
        ${types[type].icon}
        <span style="margin: 0 3px;">
          ${message}
        </span>
        ${dismiss_btn}
      </div>
    </div>
      `);

  if (show) {
    var options = {};
    if (params.instant) {
      options.instant = params.instant;
    }
    toggleMessageBox(elem, true, options);
  }
}

function showMessageModal(message, options) {
  $("#message-modal .modal-message").setContent(message);
  showModal("message-modal", options);
}

function toggleMessageBox(elem, show = null, options = {}) {
  elem = $(elem);
  var duration = options.instant ? 0 : 350;
  expand(elem.find(".message-box"), show, {
    duration: duration,
  });
  if (options.callback) {
    setTimeout(() => {
      options.callback();
    }, duration);
  }
}

var scrollingToInvalid = false;
function scrollToInvalid(field) {
  if (scrollingToInvalid) {
    return;
  }
  scrollingToInvalid = true;
  scrollToView(field, {
    callback: () => {
      scrollingToInvalid = false;
      field.focus();
    },
  });
}

window.addEventListener("DOMContentLoaded", () => {
  registerForm();
});

function registerForm(form = null) {
  if (form === null) {
    inputs = $(document.body).findAll(
      //"[data-form] [data-validate]:not([data-change-registered])"
      `[data-form] .field:not([data-change-registered]),
     [data-form] [data-validate]:not([data-change-registered])`
    );
  } else {
    //inputs = $(form).findAll("[data-validate]:not([data-change-registered])");
    inputs = $(form).findAll(
      `.field:not([data-change-registered]),
      [data-validate]:not([data-change-registered])`
    );

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

  inputs.forEach((field) => {
    field.setAttribute("data-change-registered", "");

    field.addEventListener("change", formFieldOnChangeEvent);

    /*if (field.getAttribute("data-validate").indexOf("backend") === 0) {
      field.setValue();
    }*/

    var obj = field;
    if (field.type == "checkbox") {
      obj = obj.parent();
    }

    if (
      !field.classList.contains("warn-triangle") &&
      !field.classList.contains("warn-outline") &&
      !field.classList.contains("no-wrap")
    ) {
      obj.insertAdjacentHTML("afterend", `<div class="field-wrapper"></div>`);
      var field_wrapper = obj.next();
      field_wrapper.appendChild(obj);
      if (field.classList.contains("inline")) {
        field_wrapper.classList.add("inline");
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

    if (
      field.hasAttribute("data-validate") &&
      field.hasAttribute("data-input-change")
    ) {
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
}

function formFieldOnChangeEvent(event) {
  formFieldOnChange(event.target);
}

function formFieldOnChange(field, options = {}) {
  if (!field.hasAttribute("data-change-registered")) {
    return;
  }
  if (!field.hasAttribute("data-input-registered")) {
    field.setAttribute("data-input-registered", "");
    field.addEventListener("input", formFieldOnInputEvent);
  }
  return formFieldOnInput(field, options);
}

function formFieldOnInputEvent(event) {
  formFieldOnInput(event.target);
}

function formFieldOnInput(field, options = {}) {
  if (!field.hasAttribute("data-input-registered")) {
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

// load saved fields from local storage
window.addEventListener("DOMContentLoaded", () => {
  $$("[data-store]").forEach((e) => {
    e.addEventListener("change", () => {
      var name = e.getAttribute("data-store");
      if (!name) name = e.getAttribute("name");
      localStorage.setItem(name, e.getValue());
    });
  });
});

function loadFormFromLocalStorage() {
  $$("[data-store]").forEach((e) => {
    var name = e.getAttribute("data-store");
    if (!name) name = e.getAttribute("name");

    var value = localStorage.getItem(name);
    if (value) {
      setValue(e, value);
    }
  });
}

function rewrite(source, target, options = {}) {
  var val = source.getValue();
  if (options.link) {
    val = getLink(val);
  }
  target.setValue(val);
}
