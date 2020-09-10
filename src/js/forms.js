/* js[global] */

window.addEventListener("load", () => {
  $$("[data-form]").forEach((form) => {
    registerForm(form);
  });
});

function showFieldErrors(field, errors = [], params = {}) {
  field = $(field);
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
  if (!field_title) {
    return;
  }

  if (params.backend_only) {
    field.removeEventListener("change", formFieldChangeEvent);
    field.removeEventListener("input", formFieldInputEvent);
  }

  // just desktop admin
  var warning = field_title.find(".fa-exclamation-triangle");
  if (warning) {
    warning.remove();
  }

  const inputElements = field.next();
  const validationBox = inputElements.find(".validation-error-box");
  const correctIndicator = inputElements.find(
    ".input-error-indicator .correct"
  );
  if (!correctIndicator) {
    console.error(
      "To validate the form you need to be register it with registerForm(form) or add data-form attribute before content is loaded"
    );
    return;
  }
  const wrongIndicator = inputElements.find(".input-error-indicator .wrong");
  const toggleErrorIcons = (isFieldCorrect) => {
    if (isFieldCorrect) {
      wrongIndicator.classList.remove("visible");
      correctIndicator.classList.add("visible");
    } else {
      correctIndicator.classList.remove("visible");
      wrongIndicator.classList.add("visible");
    }
  };

  if (errors.length > 0) {
    var warning = field_title.find(".fa-exclamation-triangle");
    if (warning) {
      warning.remove();
    }

    // adding error boxes instead of icons with tooltip
    // always for non-admin route and mobile
    if (window.IS_MOBILE || !window.location.pathname.includes("admin")) {
      toggleErrorIcons(false);
      validationBox.find(".message").innerHTML = errors.join("<br>");
      expand(validationBox, true, {
        duration: 350,
      });
    } else {
      field_title.insertAdjacentHTML(
        "beforeend",
        `<i
            class="fas fa-exclamation-triangle"
            style="color: red;transform: scale(1.25);margin-left:4px"
            data-tooltip="${errors.join("<br>")}">
          </i>`
      );
    }

    if (!params.noScroll) {
      scrollToInvalid(field);
    }
  } else {
    toggleErrorIcons(true);
    expand(validationBox, false, {
      duration: 350,
    });
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
      if (found) continue;
    }
    if (field.findParentByClassName("hidden")) continue;

    var errors = formFieldChange(field);
    if (errors.length > 0) {
      return false;
    }
  }

  return true;
}

function toggleFieldCorrect(field, correct) {
  field = $(field);
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

function fieldErrors(field) {
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
    return errors;
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
  } else if (validatorType == "youtube-video") {
    if (!getIdFromYoutubeUrl(val)) {
      newError("Wpisz poprawny link do filmu z Youtube");
    }
  }

  return errors;
}

// function checkRemoveRequired() {
//   var valid = fieldErrors(this);
//   showFieldErrors(this, valid);
// }

function clearValidateRequired() {
  removeClasses("required");
}

const formInitialStates = {};

function addMainFormLeavingWarning(form) {
  form = $(form);
  window.addEventListener("beforeunload", function (e) {
    const wasState = JSON.stringify(formInitialStates[form.id]);
    const nowState = JSON.stringify(getFormData(form));
    if (wasState !== nowState) {
      e.returnValue = "Czy na pewno chcesz opuścić stronę?";
    }
  });
}

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
  Object.entries(data).forEach(([name, value]) => {
    var selector = `[name="${name}"]`;
    if (params.type == "simple-list") {
      selector = `[data-list-param="${name}"]`;
    }
    var e = form.find(selector);
    if (!e) {
      return;
    }
    var value_params = {};
    if (params.data && params.data[name]) {
      value_params = params.data[name];
    }

    e.setValue(value, value_params);
  });
  setFormInitialState(form);
  resizeCallback();
}

function getFormData(form) {
  form = $(form);
  var data = {};

  var excludeHidden = form.hasAttribute("data-exclude-hidden");
  $(form)
    .findAll(`[name]`)
    .forEach((e) => {
      if (excludeHidden && e.findParentByClassName("hidden")) return;
      data[e.getAttribute("name")] = getValue(e);
    });
  return data;
}

function addMessageBox(elem, message, params = {}) {
  elem = $(elem);
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

  let selector = "";
  elem.classList.forEach((elem) => {
    selector += "." + elem;
  });

  elem.innerHTML = `
    <div class="message-box expand_y hidden animate_hidden">
      <div class="message-container ${types[type].className} ${
    inline ? "inline" : ""
  }"
      >
        ${types[type].icon}
        <span style="margin: 0 10px;">
          ${message}
        </span>
        <i class="fas fa-times btn" onclick="toggleMessageBox($('${selector}'), false)"></i>  
      </div>
    </div>
      `;

  if (show) {
    toggleMessageBox(elem, true);
  }
}

function toggleMessageBox(elem, show = null, instant = false) {
  elem = $(elem);
  expand(elem.find(".message-box"), show, {
    duration: instant ? 0 : 350,
  });
}

function scrollToInvalid(field) {
  scrollToView(field, {
    callback: () => {
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
      "[data-form] [data-validate]:not([data-change-registered])"
    );
  } else {
    inputs = $(form).findAll("[data-validate]:not([data-change-registered])");
  }

  inputs.forEach((field) => {
    field.setAttribute("data-change-registered", "");

    field.addEventListener("change", formFieldChangeEvent);

    field.insertAdjacentHTML(
      "afterend",
      `
        <div class="input-elements">
          <div class="input-error-indicator">
            <i class="correct fa fa-check"></i>
            <i class="wrong fa fa-times"></i>
          </div>
          <div class="validation-error-box expand_y hidden animate_hidden">
           <div class="message"></div>
          </div>
        </div>
      `
    );
  });
}

function formFieldChangeEvent(event) {
  formFieldChange(event.target);
}

function formFieldChange(field) {
  if (!field.hasAttribute("data-input-registered")) {
    field.setAttribute("data-input-registered", "");
    field.addEventListener("input", formFieldInputEvent);
  }
  return formFieldInput(field);
}

function formFieldInputEvent(event) {
  formFieldInput(event.target);
}

function formFieldInput(field) {
  if (ignoreValueChanges) return;
  const errors = fieldErrors(field);
  showFieldErrors(field, errors);
  return errors;
}
