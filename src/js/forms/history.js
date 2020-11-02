/* js[global] */

function registerFormHistory(form) {
  form = $(form);
  if (form.hasAttribute("data-history") && !form.history) {
    // do it
  } else {
    return;
  }

  const dhb = form.getAttribute("data-history-buttons");
  const btns = dhb ? $(dhb) : form.find(".history-buttons");

  if (btns && !btns.find(".undo")) {
    form.history_buttons = btns;
    btns.insertAdjacentHTML(
      "afterbegin",
      `
        <button class="btn primary undo" data-tooltip="Cofnij (Ctrl + Z)"> <i class="fas fa-undo-alt"></i> </button>
        <button class="btn primary redo" data-tooltip="Ponów (Ctrl + Y)"> <i class="fas fa-redo-alt"></i> </button>
      `
    );
    btns.find(".btn.undo").addEventListener("click", () => {
      formHistoryUndo(form);
    });
    btns.find(".btn.redo").addEventListener("click", () => {
      formHistoryRedo(form);
    });
  }

  form.history = [getFormData(form)];
  form.history_step_back = 0;
  formHistoryChange(form);
}

function formHistoryUndo(form) {
  form = $(form);
  if (form.history_step_back < form.history.length - 1) {
    form.history_step_back++;
  }
  setFormDataToLastHistory(form);
}

function formHistoryRedo(form) {
  form = $(form);
  if (form.history_step_back > 0) {
    form.history_step_back--;
  }
  setFormDataToLastHistory(form);
}

function setFormDataToLastHistory(form) {
  form = $(form);
  setFormData(
    form.history[form.history.length - 1 - form.history_step_back],
    form
  );
  formHistoryChange(form);
}

function pushFormHistory(form) {
  // dont push more than once per 100 ms
  if (form.push_history_timeout) {
    clearTimeout(form.push_history_timeout);
  }
  form.push_history_timeout = setTimeout(() => {
    form.push_history_timeout = null;

    form = $(form);
    if (form.history_step_back > 0) {
      const from = form.history.length - form.history_step_back;
      const count = form.history_step_back;
      form.history.splice(from, count);
    }
    form.history_step_back = 0;

    const data = getFormData(form);
    if (!isEquivalent(data, form.history.last())) {
      form.history.push(data);
    }

    while (form.history.length > form.history_count) {
      form.history.shift();
    }

    formHistoryChange(form);
  }, 100);
}

document.addEventListener("keydown", (ev) => {
  // TODO:
  // const form = active form?
  /*ev.preventDefault();

  console.log(ev);
  if (ev.key) {
    if (ev.key.toLowerCase() == "z" && ev.ctrlKey) {
      formHistoryRedo(form);
    }
    if (ev.key.toLowerCase() == "y" && ev.ctrlKey) {
      formHistoryUndo(form);
    }
  }*/
});

function formHistoryChange(form) {
  if (form.history_buttons) {
    toggleDisabled(
      form.history_buttons.find(".btn.undo"),
      form.history_step_back >= form.history.length - 1
    );
    toggleDisabled(
      form.history_buttons.find(".btn.redo"),
      form.history_step_back == 0
    );
  }
}
