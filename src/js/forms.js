/* js[global] */

function markFieldWrong(field, errors = null) {
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
  } else if (validatorType == "youtube-video") {
    if (!getIdFromYoutubeUrl(val)) {
      newError("Wpisz poprawny link do filmu z Youtube");
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
    setValue(e, value);
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
