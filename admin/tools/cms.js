// dependencies
useTool("quillEditor");

// cms start

// cms history start
var cmsHistory = [];

function cmsHistoryPush(hide = true) {
  if (hide) {
    hideCMSBlockHeader();
    hideCMSContainerHeader();
  }

  if (cmsHistoryStepBack > 0) {
    var from = cmsHistory.length - cmsHistoryStepBack;
    var count = cmsHistoryStepBack;
    cmsHistory.splice(from, count);
  }
  cmsHistoryStepBack = 0;

  cmsHistory.push(cms.innerHTML);
  while (cmsHistory.length > 20) cmsHistory.shift();
}
var cmsHistoryStepBack = 0;

function cmsHistoryUndo() {
  hideCMSBlockHeader();
  if (cmsHistoryStepBack < cmsHistory.length - 1) cmsHistoryStepBack++;
  cms.innerHTML = cmsHistory[cmsHistory.length - 1 - cmsHistoryStepBack];

  cmsUpdate();
}

function cmsHistoryRedo() {
  hideCMSBlockHeader();
  if (cmsHistoryStepBack > 0) cmsHistoryStepBack--;
  cms.innerHTML = cmsHistory[cmsHistory.length - 1 - cmsHistoryStepBack];

  cmsUpdate();
}

document.onkeydown = (e) => {
  if (!isModalActive("cms")) return;

  var evtobj = window.event ? event : e;
  if (evtobj.key) {
    if (evtobj.key.toLowerCase() == "z" && evtobj.ctrlKey) {
      cmsHistoryUndo();
    }
    if (evtobj.key.toLowerCase() == "y" && evtobj.ctrlKey) {
      cmsHistoryRedo();
    }
  }
};
// cms history end

function pasteBlock(input) {
  var v = input.value;

  var success = false;
  if (/<wo997-block>.*<\/wo997-block>/s.test(v)) {
    var v = v.replace(/.*<wo997-block>/, "").replace(/<\/wo997-block>.*/, "");
    awaitingScroll = true;
    if (pasteType == "container") {
      cms.insertAdjacentHTML("beforeend", getContainer(v));
    } else {
      if (cmsTarget) {
        cmsTarget
          .find(".cms-container-content")
          .insertAdjacentHTML("beforeend", v);
      }
    }

    success = true;
  }
  if (/<wo997-container>.*<\/wo997-container>/s.test(v)) {
    var v = v
      .replace(/.*<wo997-container>/, "")
      .replace(/<\/wo997-container>.*/, "");
    awaitingScroll = true;

    cms.insertAdjacentHTML("beforeend", v);

    success = true;
  }
  if (success) {
    input.value = "";
    hideParentModal(input);
  }
}

var cms;
var cmsSource;
var cmsTarget;

var cmsModalLoaded = () => {
  cms = $("#cms .cms");
  cmsObserver.observe(cms, {
    childList: true,
    subtree: true,
  });

  CMSBlockHeader.options = $("#cms .cms-block-options");
  CMSBlockHeader.actions = $("#cms .cms-block-actions");

  CMSContainerHeader.options = $("#cms .cms-container-options");
};

function editModule(block) {
  cmsTarget = block;
  var moduleName = block.getAttribute("data-module");
  var module = modules[moduleName];
  if (!document.getElementById(moduleName)) {
    if (module.editUrl) {
      if (
        confirm(
          `Czy chcesz otworzyć edycję ${module.description} w nowej karcie?`
        )
      ) {
        window.open(module.editUrl);
      }
    } else {
      alert("Edycja niedostępna!");
    }
    return;
  }
  showModal(moduleName, {
    source: cmsTarget,
  });
  let params = {};
  try {
    params = JSON.parse(block.getAttribute("data-module-params"));
  } catch {}
  setFormData(params, $(`#${moduleName}`));
  module.formOpen(params, block, moduleName);
}

function saveModule(button) {
  if (!cmsTarget) return;
  var moduleName = cmsTarget.getAttribute("data-module");
  if (!moduleName) return;
  var module = modules[moduleName];
  if (!module) return;
  module.formClose();
  hideParentModal(button);

  var c = cmsTarget.find(".module-content"); // force update
  if (c) c.remove();
}

function editBlock() {
  if (!cmsTarget) return;
  if (cmsTarget.hasAttribute("data-module")) {
    editModule(cmsTarget);
    return;
  }
  var block_content = cmsTarget.find(".cms-block-content");
  quillEditor.open(block_content, {
    wrapper: cmsTarget,
    callback: () => {
      postSaveCmsNode();
    },
  });
}

function getContainer(content = "") {
  return `
        <div class="cms-container">
            <div class="cms-container-content">${content}</div>
        </div>`;
}

function getBlock(content = "") {
  return `
        <div class="cms-block col-lg-12 col-sm-12">
            <div class="cms-block-content ql-editor">${content}</div>
        </div>`;
}

function addContainer(
  content = "",
  previousContainer = false,
  placeAfter = true
) {
  if (content === "") {
    content = getBlock(content);
  }
  awaitingScroll = true;
  if (previousContainer !== false) {
    if (previousContainer) {
      previousContainer.insertAdjacentHTML(
        placeAfter ? "afterend" : "beforebegin",
        getContainer(content)
      );
    } else {
      cms.insertAdjacentHTML("afterbegin", getContainer(content));
    }
  } else if (!cmsTarget || !cmsTarget.parent()) {
    cms.insertAdjacentHTML(
      placeAfter ? "beforeend" : "afterbegin",
      getContainer(content)
    );
  } else {
    cmsTarget.insertAdjacentHTML(
      placeAfter ? "afterend" : "beforebegin",
      getContainer(content)
    );
  }
  delayActions();
  cmsHistoryPush();
}

function addBlock(content = "", container = null, placeAfter = true) {
  awaitingScroll = true;
  if (container) {
    container
      .find(".cms-container-content")
      .insertAdjacentHTML(
        placeAfter ? "beforeend" : "afterbegin",
        getBlock(content)
      );
  } else if (cmsTarget && cmsTarget.parent()) {
    /* if (!cmsTarget || !cmsTarget.parent()) {
        if (!container) {
            container = cmsTarget;
        }
        if (!container) {
            return;
        }
        container.insertAdjacentHTML(placeAfter ? "beforeend" : "afterbegin", getBlock(content));
    } */
    cmsTarget.insertAdjacentHTML(
      placeAfter ? "afterend" : "beforebegin",
      getBlock(content)
    );
  }
  delayActions();
  cmsHistoryPush();
}

var modules = {
  "product-list": {
    params: "",
    description: "Lista produktów",
    icon: '<i class="fas fa-cube"></i>',
    form: `
            <span class="field-title" style='margin-top:0'>Liczba produktów</span>
            <input type='number' name="product_list_count" class="field">
        
            <span class="field-title">Sortuj wg</span>
            <select name='order_by' class="field">
                <option value='new'>Najnowsze</option>
                <option value='sale'>Bestsellery</option>
                <option value='cheap'>Najtańsze</option>
                <option value='random'>Losowo</option>
            </select>
               
            <span class="field-title">Kategorie</span>               
            <input type="hidden" name="category_ids" data-category-picker data-category-picker-source="product_categories" class="field">
            `,
    formOpen: (params, block, moduleName) => {
      loadCategoryPicker("product_categories", { skip: 2 }, () => {
        $(`#${moduleName} [name="category_ids"]`).setValue(
          params["category_ids"]
        );
      });
    },
    formClose: () => {
      const params = getFormData("#product-list");
      cmsTarget.setAttribute("data-module-params", JSON.stringify(params));
    },
    render: (params) => {
      const productListCount = params["product_list_count"];
      return productListCount ? `Liczba produktów: ${productListCount}` : "";
    },
  },
  "newsletter-form": {
    params: "",
    description: "Formularz do newslettera",
    icon: '<i class="far fa-newspaper"></i>',
    render: (params) => {
      return "";
    },
  },
  slider: {
    params: "",
    description: "Slider zdjęć",
    icon: '<i class="far fa-images"></i>',
    editUrl: "/admin/slider",
    render: (params) => {
      return "";
    },
  },
  "contact-form": {
    params: "",
    description: "Formularz kontaktowy",
    icon: '<i class="far fa-address-card"></i>',
    editUrl: "/admin/konfiguracja",
    render: (params) => {
      return "";
    },
  },
  "custom-html": {
    params: "",
    description: "Moduł HTML",
    icon: '<i class="fas fa-code"></i>',
    form: `
            <div style="width:600px; max-width:90vw;">
              <div class="field-title">HTML</div>
              <textarea class="field html" style="height:400px"></textarea>
            </div>
            `,
    formOpen: (params, block) => {
      $("#custom-html .html").getValue() = block.querySelector(
        ".cms-block-content"
      ).innerHTML;
    },
    formClose: () => {
      cmsTarget.querySelector(`.cms-block-content`).innerHTML = $(
        "#custom-html .html"
      ).getValue();
    },
  },
};

function insertModule(moduleName) {
  awaitingScroll = true;

  var module = modules[moduleName];
  if (!module) return;

  cms.insertAdjacentHTML(
    "beforeend",
    getContainer(`
            <div class="cms-block" data-module="${moduleName}" data-module-params="${module.params}">
                <div class="cms-block-content"></div>
            </div>`)
  );
  hideModalTopMost();
}

var moduleList = "";
for (moduleName in modules) {
  var module = modules[moduleName];
  if (!module.icon) module.icon = '<i class="fas fa-puzzle-piece"></i>';
  moduleList += `<div class="btn primary" onclick="insertModule('${moduleName}')">${module.icon} ${module.description}</div>`;
  if (module.form) {
    registerModalContent(`
            <div id="${moduleName}">
                <div>
                    <div class="custom-toolbar">
                        <span class="title">${module.description}</span>
                        <div class="btn secondary" onclick="hideParentModal(this)">Anuluj <i class="fa fa-times"></i></div>
                        <div class="btn primary" onclick="saveModule(this);">Zapisz <i class="fa fa-save"></i></div>
                    </div>
                    <div style="padding:10px">
                        ${module.form}
                    </div>
                </div>
            </div>
        `);
  }
}

var moduleListModalLoaded = () => {
  $(".moduleList").innerHTML = moduleList;
};

function copyCMS() {
  copyBlock($("#cms .cms"));
}

function copyBlock(block) {
  if (!block) {
    block = cmsTarget;
  }
  if (!block) {
    return;
  }
  copyTextToClipboard("<wo997-block>" + block.outerHTML + "</wo997-block>");
  alert("Skopiowano blok do schowka");
}

function copyContainer(container) {
  if (!container) {
    container = cmsTarget;
  }
  if (!container) {
    return;
  }
  copyTextToClipboard(
    "<wo997-container>" + container.outerHTML + "</wo997-container>"
  );
  alert("Skopiowano kontener do schowka");
}

function duplicateBlock() {
  if (!cmsTarget) return;
  awaitingScroll = true;
  cmsTarget.insertAdjacentHTML("afterend", cmsTarget.outerHTML);
  cmsHistoryPush(false);
}

function duplicateContainer() {
  if (!cmsTarget) return;
  awaitingScroll = true;
  cmsTarget.insertAdjacentHTML("afterend", cmsTarget.outerHTML);
  cmsHistoryPush(false);
}

function blockWidth(width) {
  if (!cmsTarget) return;
  removeClassesWithPrefix(cmsTarget, "col-");
  cmsTarget.setAttribute("data-desktop-width", width);
  cmsTarget.setAttribute("data-mobile-width", "100%");

  cmsHistoryPush();

  cmsUpdate();
}

function deleteContainer(nodeToDelete = null, pushHistory = true) {
  if (!cmsTarget) return;
  delayActions();
  hideCMSContainerHeader();
  let node = $(nodeToDelete ? nodeToDelete : cmsTarget);
  var h = node.getBoundingClientRect().height;
  node.style.transform = "scale(0)";
  node.style.opacity = 0;
  node.style.borderWidth = "0px";
  node.style.background = "#f22";
  node.style.marginTop = -h / 2 + "px";
  node.style.marginBottom = -h / 2 + "px";
  node.style.pointerEvents = "none";
  node.classList.add("removing");
  setTimeout(() => {
    node.remove();
  }, 400);

  if (pushHistory) {
    cmsHistoryPush();
  }
}

function deleteBlock(nodeToDelete = null, pushHistory = true) {
  if (!cmsTarget) return;
  if (!cmsTarget.next() && !cmsTarget.prev()) {
    cmsTarget = findParentByClassName(cmsTarget, "cms-container");
    deleteContainer(cmsTarget, false);
    return;
  }
  delayActions();
  hideCMSBlockHeader();
  let node = nodeToDelete ? nodeToDelete : cmsTarget;

  var rect = node.getBoundingClientRect();
  var h = rect.height;
  var w = rect.width;

  /*var prevRect = node.prev() ? node.prev().getBoundingClientRect() : null;
    var nextRect = node.next() ? node.next().getBoundingClientRect() : null;
    var leftDistance = prevRect ? (rect.x - (prevRect.x+prevRect.width)) : 0;
    if (leftDistance < 0) leftDistance = 0;
    var rightDistance = nextRect ? (rect.x+rect.width - nextRect.x) : 0;
    if (rightDistance < 0) rightDistance = 0;*/

  node.style.transform = "scale(0)";
  node.style.opacity = 0;
  node.style.background = "#f22";
  node.style.marginTop = -h / 2 + "px";
  node.style.marginBottom = -h / 2 + "px";
  /*node.style.marginLeft = -w * 0.5 - leftDistance * 0.5 + "px";
    node.style.marginRight = -w * 0.5 - rightDistance * 0.5 + "px";*/
  node.style.marginLeft = -w * 0.5 + "px";
  node.style.marginRight = -w * 0.5 + "px";
  node.style.pointerEvents = "none";
  node.classList.add("removing");
  setTimeout(() => {
    node.remove();
  }, 400);

  if (pushHistory) {
    cmsHistoryPush();
  }
}

function editCMS(t) {
  cmsSource = $(t);
  removeContent(cms);
  cms.insertAdjacentHTML("afterbegin", cmsSource.innerHTML);

  cms.findAll(".cms").forEach((e) => {
    e.outerHTML = e.innerHTML;
  });

  $$("#cms .cms-block[data-module]").forEach((e) => {
    var c = e.find(".module-content");
    if (c) removeNode(c);
  });

  cmsHistory = [];
  cmsHistoryPush();

  showModal("cms", { source: cmsSource });

  cmsUpdate();
}

function setNodeImageBackground(node, src = "") {
  if (src === "") {
    var bi = node.directChildren().find((e) => {
      return e.classList.contains("background-image");
    });
    if (bi) {
      bi.remove();
    }
    return;
  }
  addMissingDirectChildren(
    node,
    (c) => c.classList.contains("background-image"),
    `<img class="background-image">`,
    "afterbegin"
  );
  var bi = node.find(".background-image");
  if (bi) {
    bi.setAttribute("src", src);
  }
}

function setNodeBackgroundColor(node, backgroundColor = "") {
  if (backgroundColor.indexOf("rgb") == -1) {
    backgroundColor = "#" + backgroundColor.replace("#", "");
  }
  if (backgroundColor === "") {
    removeNodeColorBackground(node);
    return;
  }
  addMissingDirectChildren(
    node,
    (c) => c.classList.contains("background-color"),
    `<div class="background-color"></div>`,
    "afterbegin"
  );
  var bi = node.find(".background-color");
  if (bi) {
    bi.style.backgroundColor = backgroundColor;
  }
}

function setNodeBackgroundColorOpacity(node, op) {
  if (op == 0) {
    removeNodeColorBackground(node);
    return;
  }
  addMissingDirectChildren(
    node,
    (c) => c.classList.contains("background-color"),
    `<div class="background-color"></div>`,
    "afterbegin"
  );
  var bi = node.find(".background-color");
  if (bi) {
    bi.style.opacity = op;
  }
}

function getNodeImageBackground(node) {
  var bi = node.find(".background-image");
  if (bi) {
    return bi.getAttribute("src");
  }
  return "";
}

function getNodeBackgroundColor(node) {
  var bi = node.find(".background-color");
  if (bi) {
    return bi.style.backgroundColor;
  }
  return "";
}

function getNodeBackgroundColorOpacity(node) {
  var bi = node.find(".background-color");
  if (bi) {
    return bi.style.opacity;
  }
  return 0;
}

function migrateImageBackground(node) {
  var src = window.getComputedStyle(node).backgroundImage;
  var urls = src.match(/url\(".*"\)/);
  if (urls && urls.length > 0) {
    setNodeImageBackground(
      node,
      urls[0]
        .replace(window.location.origin, "")
        .replace(`url("`, "")
        .replace(`")`, "")
    );
    node.style.backgroundImage = "";
  }
}

function cmsUpdate() {
  resizeCallback();

  toggleDisabled($(".cms-undo"), cmsHistoryStepBack >= cmsHistory.length - 1);
  toggleDisabled($(".cms-redo"), cmsHistoryStepBack == 0);

  $$("#cms .cms-block").forEach((block) => {
    block.setAttribute("draggable", true);

    addMissingDirectChildren(
      block,
      (c) => c.classList.contains("cms-block-content"),
      `<div class="cms-block-content"></div>`
    );

    block.directChildren().forEach((x) => {
      if (
        !x.classList.contains("background-image") &&
        !x.classList.contains("background-color") &&
        !x.classList.contains("cms-block-content")
      ) {
        console.error("Unknown element removed", x.innerHTML);
        x.remove();
      }
    });

    if (block.getAttribute("data-module") == "custom-html") {
      const content = block.find(".cms-block-content");
      addMissingDirectChildren(
        content,
        (c) => c.classList.contains("html-container"),
        `<div class="html-container"></div>`
      );
    }

    migrateImageBackground(block);
  });

  $$("#cms .cms-container").forEach((container) => {
    container.setAttribute("draggable", true);

    addMissingDirectChildren(
      container,
      (c) => c.classList.contains("background-color"),
      `<div class="background-color"></div>`,
      "afterbegin"
    );

    container.directChildren().forEach((x) => {
      if (
        !x.classList.contains("background-image") &&
        !x.classList.contains("background-color") &&
        !x.classList.contains("cms-container-content")
      ) {
        console.error("Unknown element removed", x.innerHTML);
        x.remove();
      }
    });

    migrateImageBackground(container);
  });

  /*if (!$("#cms .cms-block")) {
        setTimeout(() => {
            
            addBlock();
        }, 100);
    }*/

  if (!$("#cms .cms-container")) {
    setTimeout(() => {
      addContainer();
    }, 100);
  }

  $$("#cms .cms-container").forEach((e) => {
    if (!e.find(".cms-block")) {
      setTimeout(() => {
        addBlock("", e);
      }, 100);
    }
  });

  $$("#cms .cms-block[data-module]").forEach((e) => {
    var c = e.find(".module-content");
    if (!c) {
      var moduleName = e.getAttribute("data-module");
      var module = modules[moduleName];

      let params = {};
      try {
        params = JSON.parse(e.getAttribute("data-module-params"));
      } catch {}

      if (module && module.render) {
        e.find(".cms-block-content").innerHTML = `
                        <div class="module-content">
                            <div>
                                ${module.icon} ${module.description}
                                <p style="margin:10px 0;font-size:0.8em">${
                                  module.render ? module.render(params, e) : ""
                                }</p>
                            </div>
                        </div>`;
      }
    }
  });
}

function closeCms(save) {
  if (save) {
    $$("#cms [draggable]").forEach((e) => {
      e.removeAttribute("draggable");
      e.style.opacity = "";
    });
    var content = $("#cms .cms").innerHTML;
    cmsSource.innerHTML = content;
    var src = document.getElementById(cmsSource.id + "-src");
    if (src) src.value = content;
  }
  cmsSource = null;
}

function editContainerSettings() {
  if (!cmsTarget) return;

  $$(`#cmsContainerSettings [data-attribute]`).forEach((e) => {
    var targets = cmsTarget;
    var attribute = e.getAttribute("data-attribute");
    var selectChild = e.getAttribute("data-target");
    if (selectChild) {
      targets = targets.find(selectChild);
    }
    if (e.type == "checkbox") {
      e.checked = targets.hasAttribute(`data-${attribute}`);
    } else {
      e.value = targets.getAttribute(`data-${attribute}`);

      var group = findParentByAttribute(e, "data-select-group");
      if (group) {
        var option = group.find(`[data-option="${e.value}"]`);
        if (option) {
          option.click();
        }
      }
    }
  });

  showModal("cmsContainerSettings", {
    source: cmsTarget,
  });
}

function selectInGroup(option) {
  var group = findParentByAttribute(option, "data-select-group");

  var input = group.find("input");
  if (!input) return;
  input.value = option.getAttribute("data-option");

  var scope = `[data-select-group="${group.getAttribute(
    "data-select-group"
  )}"] .selectedOption`;
  removeClasses("selectedOption", scope);

  option.classList.add("selectedOption");
}

function editBlockSettings() {
  if (!cmsTarget) return;

  $$("#cmsBlockSettings .classList").forEach((e) => {
    e.checked = false;
  });

  $$(`#cmsBlockSettings [data-attribute]`).forEach((e) => {
    var attribute = e.getAttribute("data-attribute");
    var targets = cmsTarget;
    var selectChild = e.getAttribute("data-target");
    if (selectChild) {
      targets = targets.find(selectChild);
    }
    var defaultValue = e.getAttribute("data-default-value");
    var value = targets.getAttribute(`data-${attribute}`);
    e.value = !value && value !== 0 && defaultValue ? defaultValue : value;
  });

  cmsTarget.classList.forEach((e) => {
    if (
      e.indexOf("col-") == 0 ||
      e.indexOf("align-") == 0 ||
      e.indexOf("block-padding-") == 0
    ) {
      var s = $(`.classList[value='${e}']`);
      if (s) s.checked = true;
    }
  });

  showModal("cmsBlockSettings", {
    source: cmsTarget,
  });
}

function saveContainerSettings() {
  if (!cmsTarget) return;

  saveBlockAttributes("#cmsContainerSettings");

  postSaveCmsNode();
}

function saveBlockAttributes(parent) {
  $$(`${parent} [data-attribute]`).forEach((e) => {
    var attribute = e.getAttribute("data-attribute");

    var targets = cmsTarget;
    var selectChild = e.getAttribute("data-target");
    if (selectChild) {
      targets = targets.find(selectChild);
    }

    if (e.type == "checkbox") {
      if (e.checked) {
        targets.setAttribute(`data-${attribute}`, 1);
      } else {
        targets.removeAttribute(`data-${attribute}`, 1);
      }
    } else {
      var defaultValue = e.getAttribute("data-default-value");
      var defaultUnit = e.getAttribute("data-default-unit");

      var val = e.value;
      if (!val && defaultValue) val = defaultValue;
      else if (val && !val.match(/\D/)) val += defaultUnit;
      targets.setAttribute(`data-${attribute}`, val);
    }

    Object.entries(targets.attributes).forEach((e) => {
      if (e.value === "") {
        e.removeAttribute(e.name);
      }
    });
  });
}

function saveBlockSettings() {
  if (!cmsTarget) return;
  removeClassesWithPrefix(cmsTarget, "col-");
  removeClassesWithPrefix(cmsTarget, "align-");
  removeClassesWithPrefix(cmsTarget, "block-padding-");

  $$(`#cmsBlockSettings .classList:checked`).forEach((e) => {
    if (e.value) {
      cmsTarget.classList.add(e.value);
    }
  });

  saveBlockAttributes("#cmsBlockSettings");

  postSaveCmsNode();
}

function editBlockAnimation() {
  if (!cmsTarget) return;

  $$("#cmsBlockAnimation .classList").forEach((e) => {
    e.checked = false;
  });

  var animation = cmsTarget.getAttribute("data-animation");
  if (!animation) animation = "none";

  var s = $(`.classList[value='${animation}']`);
  if (s) s.checked = true;

  showModal("cmsBlockAnimation", {
    source: cmsTarget,
  });
}

function saveBlockAnimation() {
  if (!cmsTarget) return;

  $$(`#cmsBlockAnimation .classList:checked`).forEach((e) => {
    cmsTarget.setAttribute("data-animation", e.value);
  });
  postSaveCmsNode();
}

function editCMSBorder() {
  var target = cmsTarget.find(".cms-container-content");
  if (!target) {
    target = cmsTarget; //.find(".cms-block-content");
  }
  if (!target) return;

  if (
    target.style.border ||
    target.style.borderWidth ||
    target.style.borderColor
  ) {
    var styles = window.getComputedStyle(target);
  } else {
    var styles = {};
  }

  setValue(
    $(`#cmsBorder [data-attribute="border-width"]`),
    nonull(styles["border-width"])
  );
  setValue(
    $(`#cmsBorder [data-attribute="border-color"]`),
    nonull(styles["border-color"])
  );
  setValue(
    $(`#cmsBorder [data-attribute="border-radius"]`),
    nonull(styles["border-radius"])
  );

  showModal("cmsBorder", {
    source: target,
  });
}

function updateBorderPreview() {
  var borderPreview = $(`#cmsBorder .borderPreview`);

  borderPreview.style.border = `${
    $(`#cmsBorder [data-attribute="border-width"]`).value
  } solid #${$(`#cmsBorder [data-attribute="border-color"]`).value}`;
  borderPreview.style.borderRadius = $(
    `#cmsBorder [data-attribute="border-radius"]`
  ).value;
}

function saveCMSBorder() {
  var preview = $("#cmsBorder .borderPreview");

  var target = cmsTarget.find(".cms-container-content");
  if (!target) {
    target = cmsTarget; //.find(".cms-block-content");
  }
  if (!target) {
    return false;
  }

  target.style.border = preview.style.border;
  target.style.borderRadius = preview.style.borderRadius;
}

function updateBorderPreview() {
  var borderPreview = $(`#cmsBorder .borderPreview`);

  borderPreview.style.border = `${
    $(`#cmsBorder [data-attribute="border-width"]`).value
  } solid #${$(`#cmsBorder [data-attribute="border-color"]`).value}`;
  borderPreview.style.borderRadius = $(
    `#cmsBorder [data-attribute="border-radius"]`
  ).value;
}

function editCMSBackground() {
  var target = cmsTarget;
  if (!target) return;

  var background = $(".cmsNodeBackgroundPreview");

  setNodeImageBackground(background, getNodeImageBackground(target));

  var col = getNodeBackgroundColor(target);
  console.log(col);
  if (!col) col = "ffffff";

  console.log(col);

  $("#cmsBlockBackground .bckgcolor").setValue(col);

  var op = getNodeBackgroundColorOpacity(target);
  if (!op) {
    op = 0.5;
  }
  setRangeSliderValue($("#cmsBlockBackground .image-opacity"), op * 100);

  showModal("cmsBlockBackground", {
    source: target,
  });
}

function saveCMSBackground() {
  if (!cmsTarget) return;

  var preview = $(".cmsNodeBackgroundPreview");

  setNodeImageBackground(cmsTarget, getNodeImageBackground(preview));

  var color = getNodeBackgroundColor(preview);
  var opacity = getNodeBackgroundColorOpacity(preview);
  if (opacity > 0) {
    setNodeBackgroundColor(cmsTarget, color);
    setNodeBackgroundColorOpacity(cmsTarget, opacity);
  } else {
    removeNodeColorBackground(cmsTarget);
  }

  postSaveCmsNode();
}

function removeNodeColorBackground(node) {
  var bi = node.directChildren().find((e) => {
    return e.classList.contains("background-color");
  });
  if (bi) {
    bi.remove();
  }
}

function postSaveCmsNode() {
  cmsHistoryPush();
  cmsTarget = null;
  cmsUpdate();
}

var cmsObserver = new MutationObserver((mutations) => {
  for (let mutation of mutations) {
    if (mutation.addedNodes) {
      for (let node of mutation.addedNodes) {
        if (node.classList && node.classList.contains("cms-block")) {
          node.classList.remove("activeBlock");
          if (awaitingScroll) {
            scrollToElement(node, cms.parent());
            var rect = node.getBoundingClientRect();
            var h = rect.height;
            var w = rect.width;

            /*var prevRect = node.prev() ? node.prev().getBoundingClientRect() : null;
                        var nextRect = node.next() ? node.next().getBoundingClientRect() : null;
                        var leftDistance = prevRect ? (rect.x - (prevRect.x+prevRect.width)) : 0;
                        if (leftDistance < 0) leftDistance = 0;
                        var rightDistance = nextRect ? (rect.x+rect.width - nextRect.x) : 0;
                        if (rightDistance < 0) rightDistance = 0;*/
            node.style.transition = "0s";
            node.style.transform = "scale(0)";
            node.style.opacity = 0;
            var animateBackground =
              !node.style.backgroundColor && !node.style.backgroundImage;
            if (animateBackground) {
              node.style.background = "#37f";
            }
            node.style.marginTop = -h / 2 + "px";
            node.style.marginBottom = -h / 2 + "px";
            node.style.marginLeft = -w * 0.5;
            node.style.marginRight = -w * 0.5;
            //node.style.marginLeft = -w * 0.5 - leftDistance * 0.5 + "px";
            //node.style.marginRight = -w * 0.5 - rightDistance * 0.5 + "px";
            setTimeout(() => {
              node.style.opacity = 1;
              node.style.transition = "";
              node.style.transform = "";
              if (animateBackground) {
                node.style.background = "";
              }
              node.style.marginTop = "";
              node.style.marginBottom = "";
              node.style.marginLeft = "";
              node.style.marginRight = "";
            }, 0);
            awaitingScroll = false;
          }
        }
        if (node.classList && node.classList.contains("cms-container")) {
          node.classList.remove("activeContainer");
          if (awaitingScroll) {
            scrollToElement(node, cms.parent());
            var rect = node.getBoundingClientRect();
            var h = rect.height;
            node.style.transition = "0s";
            node.style.transform = "scale(0)";
            node.style.opacity = 0;
            var animateBackground =
              !node.style.backgroundColor && !node.style.backgroundImage;
            if (animateBackground) {
              node.style.background = "#37f";
            }
            node.style.marginTop = -h / 2 + "px";
            node.style.marginBottom = -h / 2 + "px";
            node.style.marginLeft = -w / 2 + "px";
            node.style.marginRight = -w / 2 + "px";
            node.style.borderWidth = "0px";
            setTimeout(() => {
              node.style.opacity = 1;
              node.style.transition = "";
              node.style.transform = "";
              if (animateBackground) {
                node.style.background = "";
              }
              node.style.marginTop = "";
              node.style.marginBottom = "";
              node.style.marginLeft = "";
              node.style.marginRight = "";
              node.style.borderWidth = "";
            }, 0);
            awaitingScroll = false;
          }
        }
      }
    }
  }
  cmsUpdate();
});

// cms end

// cms container header start

var CMSContainerHeader = {};

function hideCMSContainerHeader() {
  CMSContainerHeader.visible = false;
  CMSContainerHeader.options.style.display = "";

  removeClasses("activeContainer");
  $$(".cms-container").forEach((e) => {
    e.style.opacity = "";
  });
}

var placeContainerAfter = null;
var mouseMoveContainer = function (event) {
  var target = event.target;
  if (!cmsSource || actionsDelayed) return;

  if (!isModalActive("cms")) return;

  var wrapper = $(".cms-wrapper");

  var targetY = event.clientY;

  var nodeBefore = null;
  var firstY = wrapper.getBoundingClientRect().top;
  var secondY = wrapper.getBoundingClientRect().top + wrapper.scrollHeight;
  [...cms.children].forEach((e) => {
    var rect = e.getBoundingClientRect();
    if (rect.top + rect.height < targetY) {
      if (rect.top + rect.height > firstY) {
        firstY = rect.top + rect.height;
        nodeBefore = e;
      }
    }
    if (
      targetY < rect.top + rect.height + 20 &&
      rect.top + rect.height + 20 < secondY
    ) {
      secondY = rect.top + rect.height + 20;
    }
    if (targetY < rect.top) {
      if (rect.top < secondY) {
        secondY = rect.top;
      }
    }
  });

  placeContainerAfter = nodeBefore;

  var insert_container_btn = $(".insert_container_btn");

  if (
    secondY < firstY + 25 &&
    !findParentByClassName(target, "cms-block-actions") &&
    !findParentByClassName(target, "cms-block-options")
  ) {
    insert_container_btn.style.display = "flex";
    var h = 20; //(secondY - firstY);
    //if (h > 25) h = 25;
    insert_container_btn.style.height = h + "px";
    insert_container_btn.style.top =
      firstY - wrapper.getBoundingClientRect().top + wrapper.scrollTop + "px";
  } else {
    insert_container_btn.style.display = "none";
  }

  if (findParentByClassName(target, ["cms-block"])) {
    hideCMSContainerHeader();
    return;
  }

  if (!findParentByClassName(target, ["cms-container-options"])) {
    var t = findParentByClassName(target, ["cms-container"]);

    CMSContainerHeader.target = null;
    if (t) {
      if (parseFloat(getComputedStyle(t).opacity) > 0.99) {
        CMSContainerHeader.target = t;
      }
    }
  }

  var a = $(".activeContainer");
  if (a && a != CMSContainerHeader.target) {
    a.classList.remove("activeContainer");
  }

  if (CMSContainerHeader.target) {
    if (!draggedNode) {
      cmsTarget = CMSContainerHeader.target;
    }

    CMSContainerHeader.target.classList.add("activeContainer");

    if (!CMSContainerHeader.visible) {
      CMSContainerHeader.visible = true;
      CMSContainerHeader.options.style.display = "flex";
    }
  } else {
    if (CMSContainerHeader.visible) {
      hideCMSContainerHeader();
    }
  }
};

document.addEventListener(
  "mousemove",
  function (event) {
    mouseMoveContainer(event);
  },
  false
);
document.addEventListener(
  "touchstart",
  function (event) {
    mouseMoveContainer(event);
  },
  false
);

cmsContainerHeaderAnimation();

function cmsContainerHeaderAnimation() {
  if (CMSContainerHeader.target) {
    var parentRect = CMSContainerHeader.options
      .parent()
      .getBoundingClientRect();
    var optionsRect = CMSContainerHeader.options.getBoundingClientRect();
    var blockRect = CMSContainerHeader.target.getBoundingClientRect();
    var blockPos = position(CMSContainerHeader.target);

    var left =
      blockPos.left -
      parentRect.left +
      (blockRect.width - optionsRect.width) / 2;
    var top = blockPos.top - parentRect.top;

    var width = optionsRect.width;

    var maxLeft = parentRect.width - width - 20;
    if (left > maxLeft) {
      left = maxLeft;
    }
    if (left < 0) {
      left = 0;
    }

    CMSContainerHeader.options.style.left = left + "px";
    CMSContainerHeader.options.style.top = top + 2 + "px";
  }

  requestAnimationFrame(cmsContainerHeaderAnimation);
}

// cms container header end

// cms block header start

var CMSBlockHeader = {};

function hideCMSBlockHeader() {
  CMSBlockHeader.visible = false;
  CMSBlockHeader.options.style.display = "";
  CMSBlockHeader.actions.style.display = "";

  removeClasses("activeBlock");
  $$(".cms-block").forEach((e) => {
    e.style.opacity = "";
  });
}

var actionsDelayed = false;
function delayActions() {
  actionsDelayed = true;
  delay("enableActions", 420);
}
function enableActions() {
  actionsDelayed = false;
}

var mouseMoveBlock = function (target) {
  if (!cmsSource || actionsDelayed) return;

  if (!isModalActive("cms")) return;

  if (
    !findParentByClassName(target, ["cms-block-options", "cms-block-actions"])
  ) {
    var t = findParentByClassName(target, ["cms-block"]);

    CMSBlockHeader.target = null;
    if (t) {
      if (parseFloat(getComputedStyle(t).opacity) > 0.99) {
        CMSBlockHeader.target = t;
      }
    }
  }

  var a = $(".activeBlock");
  if (a && a != CMSBlockHeader.target) {
    a.classList.remove("activeBlock");
  }

  if (CMSBlockHeader.target) {
    if (!draggedNode) {
      cmsTarget = CMSBlockHeader.target;
    }

    CMSBlockHeader.target.classList.add("activeBlock");

    if (!CMSBlockHeader.visible) {
      CMSBlockHeader.visible = true;
      CMSBlockHeader.options.style.display = "flex";
      CMSBlockHeader.actions.style.display = "block";
    }
  } else {
    if (CMSBlockHeader.visible) {
      hideCMSBlockHeader();
    }
  }
};

document.addEventListener(
  "mousemove",
  function (event) {
    mouseMoveBlock(event.target);
  },
  false
);
document.addEventListener(
  "touchstart",
  function (event) {
    mouseMoveBlock(event.target);
  },
  false
);

cmsBlockHeaderAnimation();

function cmsBlockHeaderAnimation() {
  if (CMSBlockHeader.target) {
    var parentRect = CMSBlockHeader.options.parent().getBoundingClientRect();
    var optionsRect = CMSBlockHeader.options.getBoundingClientRect();
    var actionsRect = CMSBlockHeader.actions.getBoundingClientRect();
    var blockRect = CMSBlockHeader.target.getBoundingClientRect();
    var blockPos = position(CMSBlockHeader.target);

    var left = blockPos.left - parentRect.left;
    var top = blockPos.top - parentRect.top;

    CMSBlockHeader.actions.style.left = left + blockRect.width / 2 + 6 + "px";
    CMSBlockHeader.actions.style.top = top + 29 + "px";

    CMSBlockHeader.actions.style.width = 0 + "px";
    CMSBlockHeader.actions.style.height = blockRect.height + "px";

    var left =
      blockPos.left -
      parentRect.left +
      (blockRect.width - optionsRect.width) / 2;
    var top = blockPos.top - parentRect.top;

    var width = optionsRect.width;

    var maxLeft = parentRect.width - width - 20;
    if (left > maxLeft) {
      left = maxLeft;
    }
    if (left < 0) {
      left = 0;
    }

    CMSBlockHeader.options.style.left = left + 6 + "px";
    CMSBlockHeader.options.style.top = top + 29 + "px";
  }

  requestAnimationFrame(cmsBlockHeaderAnimation);
}

// cms block header end

// drag start

var draggedNode;
var placeNearNode;
var isPlaceBefore;
var allowAddition;

document.addEventListener(
  "dragstart",
  function (event) {
    event.target = cmsTarget;
    try {
      //if ((!event.target || !event.target.hasAttribute("draggable")) || !cmsSource) {
      if (!event.target || !event.target.hasAttribute("draggable")) {
        event.preventDefault();
        return;
      }
    } catch (e) {}

    draggedNode = event.target;

    draggedNode.style.opacity = 0.5;
  },
  false
);

document.addEventListener(
  "dragend",
  function (event) {
    if (draggedNode) {
      draggedNode.style.opacity = "";
    }
    draggedNode = null;
  },
  false
);

function dragover(event) {
  var requestClass = "cms-block";
  if (draggedNode.classList.contains("cms-container")) {
    requestClass = "cms-container";
  }
  var newplaceNearNode = findParentByClassName(event.target, requestClass);
  if (placeNearNode && newplaceNearNode != placeNearNode) {
    placeNearNode.classList.toggle("add_after", false);
    placeNearNode.classList.toggle("add_before", false);
  }
  if (newplaceNearNode || requestClass == "cms-block") {
    placeNearNode = newplaceNearNode;
  }
  if (!placeNearNode) return;
  var rect = placeNearNode.getBoundingClientRect();
  //isPlaceBefore = event.x < rect.x + rect.width / 2;
  isPlaceBefore = event.y < rect.y + rect.height / 2;
  //allowAddition = (event.x < rect.x + 50 || event.x > rect.x + rect.width - 50) && event.y >= rect.y + 28;
  //allowAddition = (event.y < rect.y + 50 || event.x > rect.x + rect.width - 50) && event.y >= rect.y + 28;
  if (newplaceNearNode != cmsTarget) {
    placeNearNode.classList.toggle("add_after", !isPlaceBefore);
    placeNearNode.classList.toggle("add_before", isPlaceBefore);
  }
}

document.addEventListener(
  "dragover",
  function (event) {
    event.preventDefault();
    dragover(event);
  },
  false
);

document.addEventListener(
  "drop",
  function (event) {
    event.preventDefault();

    removeClasses("add_after");
    removeClasses("add_before");

    if (placeNearNode) {
      var placeNearNodeFinal = placeNearNode;

      if (!isPlaceBefore) {
        placeNearNodeFinal = placeNearNode.next();
      }

      if (
        draggedNode &&
        draggedNode != placeNearNodeFinal &&
        (draggedNode.next() != placeNearNodeFinal || !draggedNode.next())
      ) {
        awaitingScroll = true;

        copiedNode = draggedNode.cloneNode(true);

        delayActions();

        var isContainer = draggedNode.classList.contains("cms-container");
        if (isContainer) {
          deleteContainer(draggedNode, false);
        } else {
          deleteBlock(draggedNode, false);
        }

        var insertInParent = placeNearNode.parent();
        setTimeout(
          () => {
            insertInParent.insertBefore(copiedNode, placeNearNodeFinal);
          },
          isContainer ? 0 : 150
        );

        cmsHistoryPush();
      }
    }
    placeNearNode = null;
  },
  false
);

function moveBlock(direction) {
  if (!cmsTarget) return;
  var isPlaceBefore = cmsTarget;
  var isPlaceBeforeFinal = isPlaceBefore;
  if (direction === 1) {
    isPlaceBeforeFinal = isPlaceBeforeFinal.next();
    if (!isPlaceBeforeFinal) return; // already bottom
    isPlaceBeforeFinal = isPlaceBeforeFinal.next();
  } else if (direction === -1) {
    isPlaceBeforeFinal = isPlaceBeforeFinal.prev();
    if (!isPlaceBeforeFinal) return; // already top
  }
  awaitingScroll = true;

  delayActions();
  isPlaceBefore.parent().insertBefore(cmsTarget, isPlaceBeforeFinal);
  cmsHistoryPush();
}

var awaitingScroll = false;

// drag end

function setNodeBackgroundImagePreview(src = "") {
  if (src.length > 0 && src.charAt(0) !== "/") {
    src = "/uploads/df/" + src;
  }
  setNodeImageBackground($(".cmsNodeBackgroundPreview"), src);

  var io = $("#cmsBlockBackground .image-opacity");
  if (io.value > 75) {
    setRangeSliderValue(io, 75);
  }
}

function setPreviewBackgroundColorOpacity(val = 1) {
  setNodeBackgroundColorOpacity($(".cmsNodeBackgroundPreview"), val / 100);
}

function setNodeBackgroundColorPreview(val = "FFFFFF", makeVisible = false) {
  var node = $(".cmsNodeBackgroundPreview");
  setNodeBackgroundColor(node, val);

  $(
    "#cmsBlockBackground .image-opacity-wrapper .range-rect"
  ).style.background = `linear-gradient(to right, #fff, #${val})`;

  if (makeVisible) {
    var io = $("#cmsBlockBackground .image-opacity");
    if (io.value < 25) {
      setRangeSliderValue(io, 25);
    }
  }
}

registerModalContent(
  `
    <div id="cms" data-expand>
        <div class="stretch-vertical">

            <div class="custom-toolbar">
                <span class="title">
                    Edycja zawartości
                    <div class="btn primary cms-undo" onclick="cmsHistoryUndo()"> <i class="fas fa-undo-alt"></i> </div>
                    <div class="btn primary cms-redo" onclick="cmsHistoryRedo()"> <i class="fas fa-redo-alt"></i> </div>
                    <div class="btn primary" onclick="showModal('cmsModules')" data-tooltip="Wstaw moduł"><i class="fas fa-puzzle-piece"></i></div>
                    <div class="btn primary" onclick="window.pasteType='container';showModal('pasteBlock')" data-tooltip="Wklej skopiowany kontener / blok"><i class="fas fa-paste"></i></div>
                    <div class="btn primary" onclick="copyCMS()" data-tooltip="Skopiuj całą zawartość do schowka"> <i class="fas fa-clipboard"></i> </div>
                </span>
                <div class="btn secondary" onclick="closeCms(false);hideParentModal(this)">Anuluj <i class="fa fa-times"></i></div>
                <div class="btn primary" onclick="closeCms(true);hideParentModal(this);">Zapisz <i class="fa fa-save"></i></div>
            </div>

            <div class="cms-wrapper">
                <div style="position:absolute;display:none;z-index:1000" onclick="addContainer('',placeContainerAfter,true)" class="action_block insert_container_btn" data-tooltip="Wstaw kontener" data-position="center"> <i class="fas fa-plus-square"></i> </div>
                <div class="cms"></div>

                <div class="cms-container-options cms-toolbar-shadow">

                    <div class="btn" onclick="editContainerSettings()" data-tooltip="Wymiary / Rozmieszczenie"> <i class="fas fa-crop-alt"></i> <i class="fas fa-arrows-alt"></i> </div>

                    <div class="btn" onclick="editCMSBackground()" data-tooltip="Tło kontenera - zdjęcie / kolor"> <i class="fas fa-image"></i> <i class="fas fa-fill-drip"></i> </div>

                    <div class="btn" onclick="editCMSBorder()" data-tooltip="Obramowanie kontenera"> <i class="fas fa-border-style"></i> </div>

                    <div class="btn" onclick="copyContainer()" data-tooltip="Skopiuj kontener do schowka"> <i class="fas fa-clipboard"></i> </div>
                    
                    <div class="btn" onclick="duplicateContainer()" data-tooltip="Duplikuj kontener"> <i class="fas fa-clone"></i> </div>

                    <div class="btn" onclick="window.pasteType='block';showModal('pasteBlock')" data-tooltip="Wklej skopiowany blok"><i class="fas fa-paste"></i></div>

                    <div class="btn" class="delete_block_btn" onclick="deleteContainer()" data-tooltip="Usuń kontener"> <i class="fas fa-times"></i> </div>
                </div>

                <div class="cms-block-actions">
                    <div onclick="addBlock('',null,false)" data-tooltip="Wstaw blok" class="action_block add_before_btn"> <i class="fas fa-plus-square"></i> </div>
                    <div onclick="addBlock('',null,true)" data-tooltip="Wstaw blok" class="action_block add_after_btn"> <i class="fas fa-plus-square"></i> </div>
                </div>

                <div class="cms-block-options cms-toolbar-shadow">

                    <div class="btn" onclick="editBlock()" data-tooltip="Edytuj zawartość"> <i class="fas fa-edit"></i> </div>

                    <div class="btn" onclick="editBlockSettings()" data-tooltip="Wymiary / Ułożenie"> <i class="fas fa-crop-alt"></i> <i class="fas fa-arrows-alt"></i> </div>
                    
                    <div class="btn" onclick="editCMSBackground()" data-tooltip="Tło bloku - zdjęcie / kolor"> <i class="fas fa-image"></i> <i class="fas fa-fill-drip"></i> </div>

                    <div class="btn" onclick="editCMSBorder()" data-tooltip="Obramowanie bloku"> <i class="fas fa-border-style"></i> </div>

                    <div class="btn" onclick="editBlockAnimation()" data-tooltip="Animacje"> <i class="fas fa-step-forward"></i> </div>

                    <div class="showhover">
                        <div class="btn" data-tooltip="Szerokość"> <i class="fas fa-arrows-alt-h"></i> </div>
                        <div class="menucontent cms-toolbar-shadow" style="display:flex;flex-direction:column;align-items:stretch">
                            <div class="btn" onclick="blockWidth('100%')" data-tooltip="100% szerokości strony"> 100% </div>
                            <div class="btn" onclick="blockWidth('50%')" data-tooltip="50% szerokości strony"> 1/2 </div>
                            <div class="btn" onclick="blockWidth('33.333%')" data-tooltip="33.3% szerokości strony"> 1/3 </div>
                            <div class="btn" onclick="editBlockSettings()" data-tooltip="Więcej"><i class="fas fa-ellipsis-h"></i></div>

                        </div>
                    </div>

                    <div class="showhover">
                        <div class="btn" data-tooltip="Zmiana kolejności. Możesz też złapać blok i go upuścić"> <i class="fas fa-sort"></i> </div>
                        <div class="menucontent cms-toolbar-shadow" style="display:flex;flex-direction:column;align-items:stretch">
                            <div class="btn" onclick="moveBlock(-1)" data-tooltip="Przesuń wstecz"> <i class="fas fa-arrow-up"></i> </div>
                            <div class="btn" onclick="moveBlock(1)" data-tooltip="Przesuń dalej"> <i class="fas fa-arrow-down"></i> </div>
                        </div>
                    </div>

                    <div class="btn" onclick="duplicateBlock()" data-tooltip="Duplikuj blok"> <i class="fas fa-clone"></i> </div>

                    <div class="btn" onclick="copyBlock()" data-tooltip="Skopiuj blok do schowka"> <i class="fas fa-clipboard"></i> </div>

                    <div class="btn" class="delete_block_btn" onclick="deleteBlock()" data-tooltip="Usuń blok"> <i class="fas fa-times"></i> </div>
                </div>

            </div>

        </div>
        <!--<link href="/admin/tools/cms.css?v=${RELEASE}" rel="stylesheet"> NOW GLOBAL-->
    </div>
`,
  () => {
    cmsModalLoaded();
  }
);

registerModalContent(`
    <div id="cmsBlockSettings">
        <div style="width: 100%;max-width: 500px">

            <div class="custom-toolbar">
                <span class="title">Wymiary / Położenie</span>
                <div class="btn secondary" onclick="hideParentModal(this)">Anuluj <i class="fa fa-times"></i></div>
                <div class="btn primary" onclick="saveBlockSettings();hideParentModal(this)">Zapisz <i class="fa fa-save"></i></div>
            </div>

            <div style="padding:10px;margin-top:-15px">
                <div class="desktopRow spaceColumns" style="text-align: center;">
                    <div>
                        <h3 style="text-align:center">Wersja desktopowa <i class='fas fa-desktop'></i></h3>
                        <h4>Minimalna wysokość</h4>
                        <div class="selectbox">
                            <input class="field" type="text" style="width:150px" data-attribute="desktop-min-height" data-default-value="" data-default-unit="px">
                            <div class="menucontent cms-toolbar-shadow" style="display:flex;flex-direction:column;align-items:stretch">
                                <button data-option="">Brak</button>
                                <button data-option="100px">100px</button>
                                <button data-option="200px">200px</button>
                                <button data-option="300px">300px</button>
                                <button data-option="400px">400px</button>
                            </div>
                        </div>
                        <h4>Szerokość bloku</h4>
                        <div class="selectbox">
                            <input class="field" type="text" style="width:150px" data-attribute="desktop-width" data-default-value="100%" data-default-unit="px">
                            <div class="menucontent cms-toolbar-shadow" style="display:flex;flex-direction:column;align-items:stretch">
                                <button data-option="100%">100%</button>
                                <button data-option="50%">1/2</button>
                                <button data-option="33.333%">1/3</button>
                                <button data-option="25%">1/4</button>
                                <button data-option="20%">1/5</button>
                            </div>
                        </div>
                    </div>
                    <div>
                        <h3 style="text-align:center">Wersja mobilna <i class='fas fa-mobile-alt'></i></h3>
                        <h4>Minimalna wysokość</h4>
                        <div class="selectbox">
                            <input class="field" type="text" style="width:150px" data-attribute="mobile-min-height" data-default-value="" data-default-unit="px">
                            <div class="menucontent cms-toolbar-shadow" style="display:flex;flex-direction:column;align-items:stretch">
                                <button data-option="">Brak</button>
                                <button data-option="100px">100px</button>
                                <button data-option="200px">200px</button>
                                <button data-option="300px">300px</button>
                                <button data-option="400px">400px</button>
                            </div>
                        </div>
                        <h4>Szerokość bloku</h4>
                        <div class="selectbox">
                            <input class="field" type="text" style="width:150px" data-attribute="mobile-width" data-default-value="100%" data-default-unit="px">
                            <div class="menucontent cms-toolbar-shadow" style="display:flex;flex-direction:column;align-items:stretch">
                                <button data-option="100%">100%</button>
                                <button data-option="50%">1/2</button>
                                <button data-option="33.333%">1/3</button>
                                <button data-option="25%">1/4</button>
                                <button data-option="20%">1/5</button>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="desktopRow spaceColumns">
                    <div>
                        <h4 style="text-align:center;margin-bottom:5px">Margines zewnętrzny</h4>
                        ${getMarginControl("margin")}
                    </div>
                    <div>
                        <h4 style="text-align:center;margin-bottom:5px">Margines wewnętrzny</h4>
                        ${getMarginControl("padding", ".cms-block-content", {
                          all: "12px",
                        })}
                    </div>
                </div>
                <h4>Wyrównaj zawartość</h4>
                <div class="desktopRow spacecolumns" style="justify-content:space-evenly">
                    <div>
                        <h4>W pionie <i class="fas fa-arrows-alt-v"></i> <i class='fas fa-info-circle' data-tooltip='Gdy w danym wierszu są przynajmniej 2 bloki'></i></h4>
                        <label style="display:block">
                            <input type='radio' class='classList' name='align-vertical' value=''>
                            <i class="far fa-square"></i> Brak
                        </label>
                        <label style="display:block">
                            <input type='radio' class='classList' name='align-vertical' value='align-vertical-top'>
                            <i class="far fa-caret-square-up"></i> Góra
                        </label>
                        <label style="display:block">
                            <input type='radio' class='classList' name='align-vertical' value='align-vertical-center'>
                            <i class="far fa-minus-square"></i> Środek
                        </label>
                        <label style="display:block">
                            <input type='radio' class='classList' name='align-vertical' value='align-vertical-bottom'>
                            <i class="far fa-caret-square-down"></i> Dół
                        </label>
                    </div>
                    <div>
                        <h4>W poziomie <i class="fas fa-arrows-alt-h"></i> <i class='fas fa-info-circle' data-tooltip='Gdy zawartość nie zajmuje całej dostępnej szerokości'></i></h4>
                        <label style="display:block">
                            <input type='radio' class='classList' name='align-horizontal' value=''>
                            <i class="far fa-square"></i> Brak
                        </label>
                        <label style="display:block">
                            <input type='radio' class='classList' name='align-horizontal' value='align-horizontal-left'>
                            <i class="far fa-caret-square-left"></i> Lewo
                        </label>
                        <label style="display:block">
                            <input type='radio' class='classList' name='align-horizontal' value='align-horizontal-center'>
                            <i class="far fa-minus-square" style="transform:rotate(90deg)"></i> Środek
                        </label>
                        <label style="display:block">
                            <input type='radio' class='classList' name='align-horizontal' value='align-horizontal-right'>
                            <i class="far fa-caret-square-right"></i> Prawo
                        </label>
                    </div>
                </div>
            </div>
        </div>
    </div>
`);

var justifies = "";
var justifyOptions = [
  "flex-start",
  "center",
  "flex-end",
  "space-between",
  "space-around",
  "space-evenly",
];
for (val of justifyOptions) {
  justifies += `<div style='border:1px solid #aaa;width:54px;margin: 5px;display:inline-flex;justify-content:${val}' data-option="${val}" onclick='selectInGroup(this)'>
        <div style='width:10px;height:15px;background:#55c;'></div>
        <div style='width:10px;height:15px;background:#c55;'></div>
        <div style='width:10px;height:15px;background:#5c5;'></div>
    </div>`;
}

var aligns = "";
var alignOptions = ["stretch", "flex-start", "center", "flex-end"];
for (val of alignOptions) {
  aligns += `<div style='border:1px solid #aaa;margin: 5px;height:30px;display:inline-flex;align-items:${val}' data-option="${val}" onclick='selectInGroup(this)'>
        <div style='width:10px;min-height:15px;background:#55c;'></div>
        <div style='width:10px;min-height:25px;background:#c55;'></div>
        <div style='width:10px;min-height:20px;background:#5c5;'></div>
    </div>`;
}

var flows = "";
var flowOptions = [
  "row nowrap",
  "row-reverse nowrap",
  false,
  "row wrap",
  "row-reverse wrap",
  false,
  "column",
  "column-reverse",
];
for (val of flowOptions) {
  if (val === false) {
    flows += "<div style='width:100%'></div>";
    continue;
  }

  var isRow = val.indexOf("row") !== -1;

  var styles = isRow ? "width:30px;" : "";

  flows += `<div style='border:1px solid #aaa;margin: 5px;;display:inline-flex;flex-flow:${val};width:75px;' data-option="${val}" onclick='selectInGroup(this)'>
        <div style='${styles}min-height:15px;background:#c55;display:flex;justify-content:center;align-items:center'>1</div>
        <div style='${styles}min-height:15px;background:#cc5;display:flex;justify-content:center;align-items:center'>2</div>
        <div style='${styles}min-height:15px;background:#5c5;display:flex;justify-content:center;align-items:center'>3</div>`;

  if (isRow) {
    flows += `<div style='width:30px;min-height:15px;background:#5cc;display:flex;justify-content:center;align-items:center'>4</div>
            <div style='width:30px;min-height:15px;background:#55c;display:flex;justify-content:center;align-items:center'>5</div>`;
  }
  flows += `</div>`;
}

var margins = "";

function getMarginControl(prefix = "margin", target = "", defaults = {}) {
  if (target) target = `data-target="${target}"`;
  for (var direction of ["top", "left", "right", "bottom"]) {
    defaults[direction] = defaults.all ? defaults.all : "";
  }
  return `
    <div style="max-width:400px">
        <div style="display:flex;justify-content:center">
            <div class="selectbox">
                <input type="text" style="width:100px" data-attribute="${prefix}_top" data-default-value="${defaults.top}" data-default-unit="px" class="field" ${target}>
                <div class="menucontent cms-toolbar-shadow" style="display:flex;flex-direction:column;align-items:stretch">
                    <button data-option="0">0</button>
                    <button data-option="12px">12px</button>
                    <button data-option="24px">24px</button>
                    <button data-option="36px">36px</button>
                    <button data-option="2%">2%</button>
                    <button data-option="4%">4%</button>
                    <button data-option="6%">6%</button>
                </div>
            </div>
        </div>
        <div style="display:flex;justify-content: space-around;padding: 20px 0;">
            <div class="selectbox">
                <input type="text" style="width:100px" data-attribute="${prefix}_left" data-default-value="${defaults.left}" data-default-unit="px" class="field" ${target}>
                <div class="menucontent cms-toolbar-shadow" style="display:flex;flex-direction:column;align-items:stretch">
                    <button data-option="0">0</button>
                    <button data-option="12px">12px</button>
                    <button data-option="24px">24px</button>
                    <button data-option="36px">36px</button>
                    <button data-option="2%">2%</button>
                    <button data-option="4%">4%</button>
                    <button data-option="6%">6%</button>
                </div>
            </div>
            <div class="selectbox">
                <input type="text" style="width:100px" data-attribute="${prefix}_right" data-default-value="${defaults.right}" data-default-unit="px" class="field" ${target}>
                <div class="menucontent cms-toolbar-shadow" style="display:flex;flex-direction:column;align-items:stretch">
                    <button data-option="0">0</button>
                    <button data-option="12px">12px</button>
                    <button data-option="24px">24px</button>
                    <button data-option="36px">36px</button>
                    <button data-option="2%">2%</button>
                    <button data-option="4%">4%</button>
                    <button data-option="6%">6%</button>
                </div>
            </div>
        </div>
        <div style="display:flex;justify-content:center">
            <div class="selectbox">
                <input type="text" style="width:100px" data-attribute="${prefix}_bottom" data-default-value="${defaults.bottom}" data-default-unit="px" class="field" ${target}>
                <div class="menucontent cms-toolbar-shadow" style="display:flex;flex-direction:column;align-items:stretch">
                    <button data-option="0">0</button>
                    <button data-option="12px">12px</button>
                    <button data-option="24px">24px</button>
                    <button data-option="36px">36px</button>
                    <button data-option="2%">2%</button>
                    <button data-option="4%">4%</button>
                    <button data-option="6%">6%</button>
                </div>
            </div>
        </div>
    </div>`;
}

registerModalContent(`
    <div id="cmsBorder">
        <div style="width: 100%;max-width: 500px;height:100%;max-height:500px">

            <div class="custom-toolbar">
                <span class="title">Obramowanie</span>
                <div class="btn secondary" onclick="hideParentModal(this)">Anuluj <i class="fa fa-times"></i></div>
                <div class="btn primary" onclick="saveCMSBorder();hideParentModal(this)">Zapisz <i class="fa fa-save"></i></div>
            </div>

            <div style="padding:10px;margin-top:-15px">
                <div class="field-title">Grubość krawędzi</div>
                <div class="selectbox">
                    <input type="text" style="width:100px" class="field border-width" data-attribute="border-width" onchange="updateBorderPreview()">
                    <div class="menucontent cms-toolbar-shadow" style="display:flex;flex-direction:column;align-items:stretch">
                        <button data-option="0">0</button>
                        <button data-option="1px">1px</button>
                        <button data-option="2px">2px</button>
                        <button data-option="5px">5px</button>
                    </div>
                </div>

                <div class="field-title">Kolor krawędzi</div>
                <input class="jscolor" onclick="this.select()" data-attribute="border-color" onchange="updateBorderPreview()">
                <div class="btn primary" onclick="setValue(this.prev(),'')">Brak <i class="fa fa-times"></i></div>

                <div class="field-title">Zaokrąglenie krawędzi</div>
                <div class="selectbox">
                    <input type="text" style="width:100px" class="field" data-attribute="border-radius" onchange="updateBorderPreview()">
                    <div class="menucontent cms-toolbar-shadow" style="display:flex;flex-direction:column;align-items:stretch">
                        <button data-option="0">0</button>
                        <button data-option="6px">6px</button>
                        <button data-option="10px">10px</button>
                        <button data-option="50%">50%</button>
                    </div>
                </div>

                <div class="field-title">Podgląd</div>
                <div class="borderPreview"></div>
            </div>
        </div>
    </div>
`);

registerModalContent(`
    <div id="cmsContainerSettings">
        <div style="width: 100%;max-width: 900px">

            <div class="custom-toolbar">
                <span class="title">Wymiary / Położenie</span>
                <div class="btn secondary" onclick="hideParentModal(this)">Anuluj <i class="fa fa-times"></i></div>
                <div class="btn primary" onclick="saveContainerSettings();hideParentModal(this)">Zapisz <i class="fa fa-save"></i></div>
            </div>

            <div style="padding:10px;margin-top:-15px">
                <div class="desktopRow spaceColumns">
                    <div>
                        <h4 style="text-align:center;margin-bottom:5px">Margines zewnętrzny</h4>
                        ${getMarginControl("margin")}
                    </div>
                    <div>
                        <h4 style="text-align:center;margin-bottom:5px">Margines wewnętrzny</h4>
                        ${getMarginControl("padding")}
                    </div>
                </div>
                <div class="desktopRow spaceColumns">
                    <div>
                        <h3 style="text-align:center">Wersja desktopowa <i class='fas fa-desktop'></i></h3>
                        <h4>Minimalna wysokość</h4>
                        <div class="selectbox">
                            <input class="field" type="text" style="width:150px" data-attribute="desktop-min-height" data-default-value="" data-default-unit="px">
                            <div class="menucontent cms-toolbar-shadow" style="display:flex;flex-direction:column;align-items:stretch">
                                <button data-option="">Brak</button>
                                <button data-option="100px">100px</button>
                                <button data-option="200px">200px</button>
                                <button data-option="300px">300px</button>
                                <button data-option="400px">400px</button>
                            </div>
                        </div>
                        <h4>Wyrównaj zawartość w poziomie</h4>
                        <div data-select-group="desktop-justify-content">
                            <input type="hidden" style="width:100px" data-attribute="desktop-justify-content" data-default-value="center" data-target=".cms-container-content">
                            ${justifies}
                        </div>
                        <h4>Wyrównaj zawartość w pionie</h4>
                        <div data-select-group="desktop-align-items" style="display:flex">
                            <input type="hidden" style="width:100px" data-attribute="desktop-align-items" data-default-value="stretch" data-target=".cms-container-content">
                            ${aligns}
                        </div>
                        <h4>Kierunek układania się bloków</h4>
                        <div data-select-group="desktop-flex-flow" style="display:flex;flex-wrap:wrap">
                            <input type="hidden" style="width:100px" data-attribute="desktop-flex-flow" data-target=".cms-container-content">
                            ${flows}
                        </div>

                        <br>

                        <label><input type="checkbox" data-attribute="desktop-full-width"><div class="checkbox"></div>100% szerokości okna przeglądarki</label>

                        <br><br>
                    </div>
                    <div>
                        <h3 style="text-align:center">Wersja mobilna <i class='fas fa-mobile-alt'></i></h3>
                        <h4>Minimalna wysokość</h4>
                        <div class="selectbox">
                            <input class="field" type="text" style="width:150px" data-attribute="mobile-min-height" data-default-value="" data-default-unit="px">
                            <div class="menucontent cms-toolbar-shadow" style="display:flex;flex-direction:column;align-items:stretch">
                                <button data-option="">Brak</button>
                                <button data-option="100px">100px</button>
                                <button data-option="200px">200px</button>
                                <button data-option="300px">300px</button>
                                <button data-option="400px">400px</button>
                            </div>
                        </div>
                        <h4>Wyrównaj zawartość w poziomie</h4>
                        <div data-select-group="mobile-justify-content">
                            <input type="hidden" style="width:100px" data-attribute="mobile-justify-content" data-default-value="center" data-target=".cms-container-content">
                            ${justifies}
                        </div>
                        <h4>Wyrównaj zawartość w pionie</h4>
                        <div data-select-group="mobile-align-items" style="display:flex">
                            <input type="hidden" style="width:100px" data-attribute="mobile-align-items" data-default-value="stretch" data-target=".cms-container-content">
                            ${aligns}
                        </div>
                        <h4>Kierunek układania się bloków</h4>
                        <div data-select-group="mobile-flex-flow" style="display:flex;flex-wrap:wrap">
                            <input type="hidden" style="width:100px" data-attribute="mobile-flex-flow" data-target=".cms-container-content">
                            ${flows}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
`);

registerModalContent(`
    <div id="cmsBlockAnimation">
        <div>
            <div class="custom-toolbar">
                <span class="title">Animacje</span>
                <div class="btn secondary" onclick="hideParentModal(this)">Anuluj <i class="fa fa-times"></i></div>
                <div class="btn primary" onclick="saveBlockAnimation();hideParentModal(this)">Zapisz <i class="fa fa-save"></i></div>
            </div>

            <div style="padding:10px;margin-top:-15px">

                <div class="mobileRow row-padding" style="justify-content:space-evenly">
                    <div>
                        <h4>Animacje przy pierwszym wyświetleniu</h4>
                        <label style="display:block">
                            <input type='radio' class='classList' name='animation' value=''>
                            Brak <i class="fa fa-times"></i>
                        </label>
                        <label style="display:block">
                            <input type='radio' class='classList' name='animation' value='opacity'>
                            Przezroczystość <i class="opacity-icon"></i>
                        </label>
                        <label style="display:block">
                            <input type='radio' class='classList' name='animation' value='opacity-m_left'>
                            Przezroczystość <i class="opacity-icon"></i> + Ruch <i class="fas fa-angle-double-left"></i>
                        </label>
                        <label style="display:block">
                            <input type='radio' class='classList' name='animation' value='opacity-m_right'>
                            Przezroczystość <i class="opacity-icon"></i> + Ruch <i class="fas fa-angle-double-right"></i>
                        </label>
                        <label style="display:block">
                            <input type='radio' class='classList' name='animation' value='opacity-m_up'>
                            Przezroczystość <i class="opacity-icon"></i> + Ruch <i class="fas fa-angle-double-up"></i>
                        </label>
                        <label style="display:block">
                            <input type='radio' class='classList' name='animation' value='opacity-s_expand'>
                            Przezroczystość <i class="opacity-icon"></i> + Powiększanie <i class="fas fa-expand-arrows-alt"></i>
                        </label>
                        <label style="display:block">
                            <input type='radio' class='classList' name='animation' value='opacity-s_compress'>
                            Przezroczystość <i class="opacity-icon"></i> + Pomniejszanie <i class="fas fa-compress-arrows-alt"></i>
                        </label>
                    </div>
                </div>
            </div>
        </div>
    </div>
`);

registerModalContent(`
    <div id="pasteBlock">
        <div>
            <div class="custom-toolbar">
                <span class="title">Wstawianie skopiowanego bloku</span>
                <div class="btn secondary" onclick="hideParentModal(this)">Anuluj <i class="fa fa-times"></i></div>
            </div>
            <div style="padding:10px;">
                <div class="field-title">Wklej kod w pole poniżej (Kliknij -> CTRL+V)</div>
                <textarea class="field" style="resize:none" oninput="pasteBlock(this)"></textarea>
            </div>
        </div>
    </div>
`);

registerModalContent(
  `
    <div id="cmsModules">
        <div>
            <div class="custom-toolbar">
                <span class="title">Wstawianie modułu</span>
                <div class="btn secondary" onclick="hideParentModal(this)">Anuluj <i class="fa fa-times"></i></div>
            </div>
            <div style="padding:10px;" class="moduleList">

            </div>
        </div>
    </div>
`,
  () => {
    moduleListModalLoaded();
  }
);

registerModalContent(
  `
    <div id="cmsBlockBackground">
        <div style="width:100%;max-width:650px">
            <div class="custom-toolbar">
                <span class="title">Tło</span>
                <div class="btn secondary" onclick="hideParentModal(this)">Anuluj <i class="fa fa-times"></i></div>
                <div class="btn primary" onclick="saveCMSBackground();hideParentModal(this)">Zapisz <i class="fa fa-save"></i></div>
            </div>

            <div style="padding:10px 0;" class="mobileRow">
              <div style="padding: 20px;">

                <div class="field-title">
                  <span> Zdjęcie </span>

                  <div class="btn primary" onclick="fileManager.open(null, {callback: setNodeBackgroundImagePreview, source: this})">Wybierz <i class="fas fa-image"></i></div>

                  <div class="btn primary" onclick="setNodeBackgroundImagePreview()">Usuń <i class="fa fa-times"></i></div>
                </div>

                <br>

                <div class="field-title">
                  Kolor <i class='fas fa-info-circle' data-tooltip='Wpisz kolor lub kliknij w pole i wybierz'></i>
                </div>

                <div style="display:flex">
                  <input class="bckgcolor jscolor field" onclick="this.select()" onchange="setNodeBackgroundColorPreview(this.value,true)" style="width: 65px;text-align: center;">
                  <button class="btn primary" onclick="$(this).prev().setValue('ffffff');$('#cmsBlockBackground .image-opacity').setValue(0)">Brak <i class="fa fa-times"></i></button>
                </div>

                <div style="padding-right:10px">
                    <label style="margin: 0.7em 0 0;">Widoczność koloru <i class='fas fa-info-circle' data-tooltip='Aby zmienić kontrast pomiędzy tekstem, a zdjęciem'></i></label>
                    <input type="range" class="field" data-class="image-opacity" min="0" max="100" step="1" data-background="linear-gradient(to right, #fff, #000)"; oninput="this.dispatchEvent(new Event('change'))" onchange="setPreviewBackgroundColorOpacity(this.value)">
                </div>
              </div>

              <div style="padding: 20px;flex-grow: 1;">
                  <div class="cmsNodeBackgroundPreview" style="border: 1px solid #ccc;position:relative;height: 200px;"></div>
              </div>

            </div>
        </div>
    </div>
`,
  () => {
    registerRangeSliders();
    jscolor.installByClassName();
  }
);
