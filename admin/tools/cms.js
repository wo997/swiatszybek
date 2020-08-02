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
          .querySelector(".cms-container-content")
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
  module.formOpen(block);
}

function saveModule(button) {
  if (!cmsTarget) return;
  var moduleName = cmsTarget.getAttribute("data-module");
  if (!moduleName) return;
  var module = modules[moduleName];
  if (!module) return;
  module.formClose();
  hideParentModal(button);

  var c = cmsTarget.querySelector(".module-content"); // force update
  if (c) removeNode(c);
}

function editBlock() {
  if (!cmsTarget) return;
  if (cmsTarget.hasAttribute("data-module")) {
    editModule(cmsTarget);
    return;
  }
  var block_content = cmsTarget.querySelector(".cms-block-content");
  quillEditor.open(block_content, {
    wrapper: cmsTarget,
    colorNode: cmsTarget.querySelector(".background-color"),
    callback: () => {
      postSaveCmsBlock();
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
  } else if (!cmsTarget || !cmsTarget.parentNode) {
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
      .querySelector(".cms-container-content")
      .insertAdjacentHTML(
        placeAfter ? "beforeend" : "afterbegin",
        getBlock(content)
      );
  } else if (cmsTarget && cmsTarget.parentNode) {
    /* if (!cmsTarget || !cmsTarget.parentNode) {
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
            <div class="default-form">
                <label style='margin-top:0'>
                    <span>Liczba produktów</span>
                    <input type='number' id='productListCount'>
                </label>
                <label>
                    <span>Sortuj wg</span>
                    <select>
                        <option value='new'>Najnowsze</option>
                        <option value='sale'>Bestsellery</option>
                        <option value='cheap'>Najtańsze</option>
                        <option value='random'>Losowo</option>
                    </select>
                </label>
                <label>
                    <span>Kategorie</span>
                </label>
                <input type="hidden" name="categories" data-category-picker data-category-picker-source="product_categories">
            </div>

            `,
    formOpen: (block) => {
      var productListCount = 0;
      try {
        var params = JSON.parse(block.getAttribute("data-module-params"));
        productListCount = params["productListCount"];
      } catch {}
      document.getElementById("productListCount").value = productListCount;

      loadCategoryPicker("product_categories", { skip: 2 });
    },
    formClose: () => {
      var params = {};
      params["productListCount"] = document.getElementById(
        "productListCount"
      ).value;
      cmsTarget.setAttribute("data-module-params", JSON.stringify(params));
    },
    render: (block) => {
      var productListCount = 0;
      try {
        var params = JSON.parse(block.getAttribute("data-module-params"));
        productListCount = params["productListCount"];
      } catch {
        return "";
      }
      return `Liczba produktów: ${productListCount}`;
    },
  },
  "newsletter-form": {
    params: "",
    description: "Formularz do newslettera",
    icon: '<i class="far fa-newspaper"></i>',
  },
  slider: {
    params: "",
    description: "Slider zdjęć",
    icon: '<i class="far fa-images"></i>',
    editUrl: "/admin/slider",
  },
  "contact-form": {
    params: "",
    description: "Formularz kontaktowy",
    icon: '<i class="far fa-address-card"></i>',
    editUrl: "/admin/konfiguracja",
  },
  "custom-html": {
    params: "",
    description: "Moduł HTML",
    icon: '<i class="fas fa-code"></i>',
    form: `
            <div class="default-form" style="width:600px; max-width:90vw;">
              <div class="field-title">HTML</div>
                <textarea class="field html" style="width:100%; height:400px"></textarea>
              <div class="field-title">CSS</div>
                <textarea class="field css" style="width:100%; height:400px"></textarea>
              <div class="field-title">JS</div>
                <textarea class="field js" style="width:100%; height:400px"></textarea>
            </div>
            `,
    formOpen: (block) => {
      var content = block.querySelector(".cms-block-content");

      $("#custom-html .html").value = content.querySelector(
        ".html-container"
      ).innerHTML;
      $("#custom-html .css").value = block.getAttribute("data-css");
      $("#custom-html .js").value = content.querySelector("script").innerHTML;
    },
    formClose: () => {
      // TODO: consider cloning module

      // checks whether it is new container or not
      var id = cmsTarget.getAttribute("data-custom-html-id");
      if (!id) {
        id = Math.floor(Math.random() * 99999 + 1);
        while (true) {
          if (!$(`.cms-block[data-custom-html-id="${id}"]`)) break;
          id++;
        }
      }

      var blockContent = cmsTarget.querySelector(`.cms-block-content`);
      blockContent.querySelector(`.html-container`).innerHTML = $(
        "#custom-html .html"
      ).value;

      blockContent.querySelector(`script`).innerHTML = $(
        "#custom-html .js"
      ).value;

      cmsTarget.setAttribute("data-css", $("#custom-html .css").value);

      removeNode(blockContent.querySelector(`style`));

      // // scope css
      // if (css) {
      //   css = css
      //     .split("}")
      //     .map((elem) => ` .cms-block[data-custom-html-id="${id}"] ${elem}`)
      //     .join("}");
      // }
      // var id = block.getAttribute("data-custom-html-id");
      // var re = `div\\[data-custom-html-id="${id}"\\]`;
      // var regex = new RegExp(`div\\[data-custom-html-id="${id}"\\]`, "g");

      //  BUG: it doesn't show up changes when removing styles involving things that were previously saved as page content
      // (because the elements already have styles applied, they don't read it from style tag)
      //  possible solution 1: maybe instead of adding <style> tags, i should change elements style directly
      //  possible solution 2: try to re render cms-block-content
      //  possible solution 3: https://css-tricks.com/almanac/properties/a/all/ on children
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
  let node = nodeToDelete ? nodeToDelete : cmsTarget;
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
    removeNode(node);
  }, 400);

  if (pushHistory) {
    cmsHistoryPush();
  }
}

function deleteBlock(nodeToDelete = null, pushHistory = true) {
  if (!cmsTarget) return;
  if (!cmsTarget.nextElementSibling && !cmsTarget.previousElementSibling) {
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

  /*var prevRect = node.previousElementSibling ? node.previousElementSibling.getBoundingClientRect() : null;
    var nextRect = node.nextElementSibling ? node.nextElementSibling.getBoundingClientRect() : null;
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
    removeNode(node);
  }, 400);

  if (pushHistory) {
    cmsHistoryPush();
  }
}

function editCMS(t) {
  // TODO: include parameter for preview?
  cmsSource = t;
  removeContent(cms);
  cms.insertAdjacentHTML("afterbegin", cmsSource.innerHTML);

  cms.querySelectorAll(".cms").forEach((e) => {
    e.outerHTML = e.innerHTML;
  });
  // we should be checking the structure on dom load, including migrations

  $$("#cms .cms-block[data-module]").forEach((e) => {
    var c = e.querySelector(".module-content");
    if (c) removeNode(c);
  });

  cmsHistory = [];
  cmsHistoryPush();

  showModal("cms");

  cmsUpdate();

  // cleaning up global css and js
  cmsSource.querySelectorAll(`style`).forEach((elem) => {
    elem.outerHTML = elem.outerHTML
      .replace(`<style>`, "<styleDisabled>")
      .replace(`</style>`, "</styleDisabled>");
  });

  cmsSource.querySelectorAll(`script`).forEach((elem) => {
    elem.outerHTML = elem.outerHTML
      .replace(`<script>`, "<scriptDisabled>")
      .replace(`</script>`, "</scriptDisabled>");
  });
}

function cmsUpdate() {
  resizeCallback();

  if (cmsHistoryStepBack >= cmsHistory.length - 1)
    $(".cms-undo").setAttribute("disabled", "true");
  else $(".cms-undo").removeAttribute("disabled");

  if (cmsHistoryStepBack == 0) $(".cms-redo").setAttribute("disabled", "true");
  else $(".cms-redo").removeAttribute("disabled");

  $$("#cms .cms-block").forEach((block) => {
    block.setAttribute("draggable", true);

    addMissingDirectChildren(
      block,
      (c) => c.classList.contains("background-color"),
      `<div class="background-color"></div>`,
      "afterbegin"
    );

    addMissingDirectChildren(
      block,
      (c) => c.classList.contains("cms-block-content"),
      `<div class="cms-block-content"></div>`
    );

    [...block.children].forEach((x) => {
      if (
        !x.classList.contains("background-color") &&
        !x.classList.contains("cms-block-content")
      ) {
        console.error("Unknown element removed", x.innerHTML);
        removeNode(x);
      }
    });

    if (block.getAttribute("data-module") == "custom-html") {
      const content = block.querySelector(".cms-block-content");
      addMissingDirectChildren(
        content,
        (c) => c.classList.contains("html-container"),
        `<div class="html-container"></div>`
      );
      addMissingDirectChildren(
        content,
        (c) => c.tagName == "STYLE",
        `<style>${nonull(block.getAttribute("data-css"))}</style>`
      );
      addMissingDirectChildren(
        content,
        (c) => c.tagName == "SCRIPT",
        `<script></script>`
      );
    }
  });

  $$("#cms .cms-container").forEach((container) => {
    container.setAttribute("draggable", true);
    if (
      ![...container.children].find((c) =>
        c.classList.contains("background-color")
      )
    ) {
      container.insertAdjacentHTML(
        "afterbegin",
        `<div class="background-color"></div>`
      );
    }

    [...container.children].forEach((x) => {
      if (
        !x.classList.contains("background-color") &&
        !x.classList.contains("cms-container-content")
      ) {
        console.error("Unknown element removed", x.innerHTML);
        removeNode(x);
      }
    });
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
    if (!e.querySelector(".cms-block")) {
      setTimeout(() => {
        addBlock("", e);
      }, 100);
    }
  });

  $$("#cms .cms-block[data-module]").forEach((e) => {
    var c = e.querySelector(".module-content");
    if (!c) {
      var moduleName = e.getAttribute("data-module");
      var module = modules[moduleName];

      if (module && module.render) {
        e.querySelector(".cms-block-content").innerHTML = `
                        <div class="module-content">
                            <div>
                                ${module.icon} ${module.description}
                                <p style="margin:10px 0;font-size:0.8em">${
                                  module.render ? module.render(e) : ""
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

  document
    .querySelectorAll(`#cmsContainerSettings [data-attribute]`)
    .forEach((e) => {
      var targets = cmsTarget;
      var attribute = e.getAttribute("data-attribute");
      var selectChild = e.getAttribute("data-target");
      if (selectChild) {
        targets = targets.querySelector(selectChild);
      }
      if (e.type == "checkbox") {
        e.checked = targets.hasAttribute(`data-${attribute}`);
      } else {
        e.value = targets.getAttribute(`data-${attribute}`);

        var group = findParentByAttribute(e, "data-select-group");
        if (group) {
          var option = group.querySelector(`[data-option="${e.value}"]`);
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

  var input = group.querySelector("input");
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

  document
    .querySelectorAll(`#cmsBlockSettings [data-attribute]`)
    .forEach((e) => {
      var attribute = e.getAttribute("data-attribute");
      var targets = cmsTarget;
      var selectChild = e.getAttribute("data-target");
      if (selectChild) {
        targets = targets.querySelector(selectChild);
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

  postSaveCmsBlock();
}

function saveBlockAttributes(parent) {
  $$(`${parent} [data-attribute]`).forEach((e) => {
    var attribute = e.getAttribute("data-attribute");

    var targets = cmsTarget;
    var selectChild = e.getAttribute("data-target");
    if (selectChild) {
      targets = targets.querySelector(selectChild);
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

  document
    .querySelectorAll(`#cmsBlockSettings .classList:checked`)
    .forEach((e) => {
      if (e.value) {
        cmsTarget.classList.add(e.value);
      }
    });

  saveBlockAttributes("#cmsBlockSettings");

  postSaveCmsBlock();
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

  document
    .querySelectorAll(`#cmsBlockAnimation .classList:checked`)
    .forEach((e) => {
      cmsTarget.setAttribute("data-animation", e.value);
    });
  postSaveCmsBlock();
}

function editCMSBorder() {
  var target = cmsTarget;
  if (!target) return;

  setValue(
    $(`#cmsBorder [data-attribute="border-width"]`),
    target.style.borderWidth
  );
  setValue(
    $(`#cmsBorder [data-attribute="border-color"]`),
    rgbStringToHex(target.style.borderColor)
  );
  setValue(
    $(`#cmsBorder [data-attribute="border-radius"]`),
    target.style.borderRadius
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

  var target = cmsTarget.querySelector(".cms-container-content");
  if (!target) {
    target = cmsTarget; //.querySelector(".cms-block-content");
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

  var background = $(".cmsBlockBackgroundPreview");
  var color = $(".cmsBlockBackgroundPreview .background-color");
  var cmstargetColor = target.querySelector(".background-color");
  background.style.backgroundImage = target.style.backgroundImage;

  var col = color.style.backgroundColor;
  if (!col) col = "#fff";

  color.style.backgroundColor = col;

  var rgb = cmstargetColor.style.backgroundColor;

  var hex = rgb
    ? "#" +
      rgb
        .match(/\d+/g)
        .map(function (x) {
          x = parseInt(x).toString(16);
          return x.length == 1 ? "0" + x : x;
        })
        .join("")
    : "#fff";

  setValue($(".bckgcolor"), hex.substring(1));

  var op = cmstargetColor.style.opacity;
  if (op == "") op = 1;
  color.style.opacity = op;
  setRangeSliderValue($("#cmsBlockBackground .image-opacity"), op * 100);

  setBlockBackgroundColor($(".bckgcolor").value);

  showModal("cmsBlockBackground", {
    source: target,
  });
}

function saveCMSBackground() {
  if (!cmsTarget) return;

  var preview = $(".cmsBlockBackgroundPreview");
  cmsTarget.style.backgroundColor = preview.style.backgroundColor;
  cmsTarget.style.backgroundImage = preview.style.backgroundImage;

  var background = $(".cmsBlockBackgroundPreview");
  var color = $(".cmsBlockBackgroundPreview .background-color");
  var cmstargetColor = cmsTarget.querySelector(".background-color");
  cmsTarget.style.backgroundImage = background.style.backgroundImage;
  cmstargetColor.style.backgroundColor = color.style.backgroundColor;
  cmstargetColor.style.opacity = color.style.opacity;

  postSaveCmsBlock();
}

function postSaveCmsBlock() {
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
            scrollToElement(node, cms.parentNode);
            var rect = node.getBoundingClientRect();
            var h = rect.height;
            var w = rect.width;

            /*var prevRect = node.previousElementSibling ? node.previousElementSibling.getBoundingClientRect() : null;
                        var nextRect = node.nextElementSibling ? node.nextElementSibling.getBoundingClientRect() : null;
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
            scrollToElement(node, cms.parentNode);
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
    var parentRect = CMSContainerHeader.options.parentNode.getBoundingClientRect();
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
    var parentRect = CMSBlockHeader.options.parentNode.getBoundingClientRect();
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
        placeNearNodeFinal = placeNearNode.nextSibling;
      }

      if (
        draggedNode &&
        draggedNode != placeNearNodeFinal &&
        (draggedNode.nextElementSibling != placeNearNodeFinal ||
          !draggedNode.nextElementSibling)
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

        var insertInParent = placeNearNode.parentNode;
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
    isPlaceBeforeFinal = isPlaceBeforeFinal.nextElementSibling;
    if (!isPlaceBeforeFinal) return; // already bottom
    isPlaceBeforeFinal = isPlaceBeforeFinal.nextElementSibling;
  } else if (direction === -1) {
    isPlaceBeforeFinal = isPlaceBeforeFinal.previousElementSibling;
    if (!isPlaceBeforeFinal) return; // already top
  }
  awaitingScroll = true;

  delayActions();
  isPlaceBefore.parentNode.insertBefore(cmsTarget, isPlaceBeforeFinal);
  cmsHistoryPush();
}

var awaitingScroll = false;

// drag end

// quill start
window.cmsBlockBackgroundImageCallback = (src) => {
  setBlockBackgroundImage(src);

  if ($("#cmsBlockBackground .image-opacity").value > 50) {
    setRangeSliderValue($("#cmsBlockBackground .image-opacity"), 50);
  }
};

function setBlockBackgroundImage(val = "") {
  var background = $(".cmsBlockBackgroundPreview");
  background.style.backgroundImage = val ? `url("/uploads/lg/${val}")` : "";
}

function setBlockBackgroundColorOpacity(val = 1) {
  var color = $(".cmsBlockBackgroundPreview .background-color");
  color.style.opacity = val / 100;
  setValue($("#cmsBlockBackground .image-opacity"), val);
}

function setBlockBackgroundColor(val = "FFFFFF") {
  var color = $(".cmsBlockBackgroundPreview .background-color");
  color.style.backgroundColor = "#" + val;

  setValue($(".bckgcolor"), val);

  $(
    "#cmsBlockBackground .image-opacity-wrapper .range-rect"
  ).style.background = `linear-gradient(to right, #fff, #${val})`;

  if ($("#cmsBlockBackground .image-opacity").value < 30) {
    setRangeSliderValue($("#cmsBlockBackground .image-opacity"), 30);
  }
}

function rewriteURL() {
  $(`[name="link"]`).value = getLink($(`[name="title"]`).value);
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
                            <input type="text" style="width:150px" data-attribute="desktop-min-height" data-default-value="" data-default-unit="px">
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
                            <input type="text" style="width:150px" data-attribute="desktop-width" data-default-value="100%" data-default-unit="px">
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
                            <input type="text" style="width:150px" data-attribute="mobile-min-height" data-default-value="" data-default-unit="px">
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
                            <input type="text" style="width:150px" data-attribute="mobile-width" data-default-value="100%" data-default-unit="px">
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
                    <div class="default-form">
                        <h4>W pionie <i class="fas fa-arrows-alt-v"></i> <i class='fas fa-info-circle' data-tooltip='Gdy w danym wierszu są przynajmniej 2 bloki'></i></h4>
                        <label>
                            <input type='radio' class='classList' name='align-vertical' value=''>
                            <i class="far fa-square"></i> Brak
                        </label>
                        <label>
                            <input type='radio' class='classList' name='align-vertical' value='align-vertical-top'>
                            <i class="far fa-caret-square-up"></i> Góra
                        </label>
                        <label>
                            <input type='radio' class='classList' name='align-vertical' value='align-vertical-center'>
                            <i class="far fa-minus-square"></i> Środek
                        </label>
                        <label>
                            <input type='radio' class='classList' name='align-vertical' value='align-vertical-bottom'>
                            <i class="far fa-caret-square-down"></i> Dół
                        </label>
                    </div>
                    <div class="default-form">
                        <h4>W poziomie <i class="fas fa-arrows-alt-h"></i> <i class='fas fa-info-circle' data-tooltip='Gdy zawartość nie zajmuje całej dostępnej szerokości'></i></h4>
                        <label>
                            <input type='radio' class='classList' name='align-horizontal' value=''>
                            <i class="far fa-square"></i> Brak
                        </label>
                        <label>
                            <input type='radio' class='classList' name='align-horizontal' value='align-horizontal-left'>
                            <i class="far fa-caret-square-left"></i> Lewo
                        </label>
                        <label>
                            <input type='radio' class='classList' name='align-horizontal' value='align-horizontal-center'>
                            <i class="far fa-minus-square" style="transform:rotate(90deg)"></i> Środek
                        </label>
                        <label>
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
                    <div data-option="0">0</div>
                    <div data-option="12px">12px</div>
                    <div data-option="24px">24px</div>
                    <div data-option="36px">36px</div>
                    <div data-option="2%">2%</div>
                    <div data-option="4%">4%</div>
                    <div data-option="6%">6%</div>
                </div>
            </div>
        </div>
        <div style="display:flex;justify-content: space-around;padding: 20px 0;">
            <div class="selectbox">
                <input type="text" style="width:100px" data-attribute="${prefix}_left" data-default-value="${defaults.left}" data-default-unit="px" class="field" ${target}>
                <div class="menucontent cms-toolbar-shadow" style="display:flex;flex-direction:column;align-items:stretch">
                    <div data-option="0">0</div>
                    <div data-option="12px">12px</div>
                    <div data-option="24px">24px</div>
                    <div data-option="36px">36px</div>
                    <div data-option="2%">2%</div>
                    <div data-option="4%">4%</div>
                    <div data-option="6%">6%</div>
                </div>
            </div>
            <div class="selectbox">
                <input type="text" style="width:100px" data-attribute="${prefix}_right" data-default-value="${defaults.right}" data-default-unit="px" class="field" ${target}>
                <div class="menucontent cms-toolbar-shadow" style="display:flex;flex-direction:column;align-items:stretch">
                    <div data-option="0">0</div>
                    <div data-option="12px">12px</div>
                    <div data-option="24px">24px</div>
                    <div data-option="36px">36px</div>
                    <div data-option="2%">2%</div>
                    <div data-option="4%">4%</div>
                    <div data-option="6%">6%</div>
                </div>
            </div>
        </div>
        <div style="display:flex;justify-content:center">
            <div class="selectbox">
                <input type="text" style="width:100px" data-attribute="${prefix}_bottom" data-default-value="${defaults.bottom}" data-default-unit="px" class="field" ${target}>
                <div class="menucontent cms-toolbar-shadow" style="display:flex;flex-direction:column;align-items:stretch">
                    <div data-option="0">0</div>
                    <div data-option="12px">12px</div>
                    <div data-option="24px">24px</div>
                    <div data-option="36px">36px</div>
                    <div data-option="2%">2%</div>
                    <div data-option="4%">4%</div>
                    <div data-option="6%">6%</div>
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
                        <div data-option="0">0</div>
                        <div data-option="1px">1px</div>
                        <div data-option="2px">2px</div>
                        <div data-option="5px">5px</div>
                    </div>
                </div>

                <div class="field-title">Kolor krawędzi</div>
                <input class="jscolor" onclick="this.select()" data-attribute="border-color" onchange="updateBorderPreview()">
                <div class="btn primary" onclick="setValue(this.previousElementSibling,'')">Brak <i class="fa fa-times"></i></div>

                <div class="field-title">Zaokrąglenie krawędzi</div>
                <div class="selectbox">
                    <input type="text" style="width:100px" class="field" data-attribute="border-radius" onchange="updateBorderPreview()">
                    <div class="menucontent cms-toolbar-shadow" style="display:flex;flex-direction:column;align-items:stretch">
                        <div data-option="0">0</div>
                        <div data-option="6px">6px</div>
                        <div data-option="10px">10px</div>
                        <div data-option="50%">50%</div>
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
                            <input type="text" style="width:150px" data-attribute="desktop-min-height" data-default-value="" data-default-unit="px">
                            <div class="menucontent cms-toolbar-shadow" style="display:flex;flex-direction:column;align-items:stretch">
                                <div data-option="">Brak</div>
                                <div data-option="100px">100px</div>
                                <div data-option="200px">200px</div>
                                <div data-option="300px">300px</div>
                                <div data-option="400px">400px</div>
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
                            <input type="text" style="width:150px" data-attribute="mobile-min-height" data-default-value="" data-default-unit="px">
                            <div class="menucontent cms-toolbar-shadow" style="display:flex;flex-direction:column;align-items:stretch">
                                <div data-option="">Brak</div>
                                <div data-option="100px">100px</div>
                                <div data-option="200px">200px</div>
                                <div data-option="300px">300px</div>
                                <div data-option="400px">400px</div>
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

                <div class="mobileRow default-form row-padding" style="justify-content:space-evenly">
                    <div>
                        <h4>Animacje przy pierwszym wyświetleniu</h4>
                        <label>
                            <input type='radio' class='classList' name='animation' value=''>
                            Brak <i class="fa fa-times"></i>
                        </label>
                        <label>
                            <input type='radio' class='classList' name='animation' value='opacity'>
                            Przezroczystość <i class="opacity-icon"></i>
                        </label>
                        <label>
                            <input type='radio' class='classList' name='animation' value='opacity-m_left'>
                            Przezroczystość <i class="opacity-icon"></i> + Ruch <i class="fas fa-angle-double-left"></i>
                        </label>
                        <label>
                            <input type='radio' class='classList' name='animation' value='opacity-m_right'>
                            Przezroczystość <i class="opacity-icon"></i> + Ruch <i class="fas fa-angle-double-right"></i>
                        </label>
                        <label>
                            <input type='radio' class='classList' name='animation' value='opacity-m_up'>
                            Przezroczystość <i class="opacity-icon"></i> + Ruch <i class="fas fa-angle-double-up"></i>
                        </label>
                        <label>
                            <input type='radio' class='classList' name='animation' value='opacity-s_expand'>
                            Przezroczystość <i class="opacity-icon"></i> + Powiększanie <i class="fas fa-expand-arrows-alt"></i>
                        </label>
                        <label>
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

            <div style="padding:10px 0;" class="mobileRow default-form">
                <div style="padding: 20px;">

                    <h4> Zdjęcie </h4>

                    <div class="btn primary" onclick="imagePicker.open(null,cmsBlockBackgroundImageCallback)">Wybierz <i class="fas fa-image"></i></div>

                    <div class="btn primary" onclick="setBlockBackgroundImage()">Usuń <i class="fa fa-times"></i></div>

                    <br>

                    <h4> Kolor <i class='fas fa-info-circle' data-tooltip='Wpisz kolor lub kliknij w pole i wybierz'></i> </h4>

                    <input class="bckgcolor jscolor" onclick="this.select()" onchange="setBlockBackgroundColor(this.value)" style="width: 65px;text-align: center;">
                    <div class="btn primary" onclick="setBlockBackgroundColor();setBlockBackgroundColorOpacity(0)">Brak <i class="fa fa-times"></i></div>

                    <div style="padding-right:10px">
                        <label style="margin: 0.7em 0 0;">Widoczność koloru <i class='fas fa-info-circle' data-tooltip='Aby zmienić kontrast pomiędzy tekstem, a zdjęciem'></i></label>

                        <input type="range" data-class="image-opacity" min="0" max="100" step="1" data-background="linear-gradient(to right, #fff, #000)" ; oninput="setBlockBackgroundColorOpacity(this.value)">
                    </div>
                </div>

                <div style="padding: 20px;flex-grow: 1;">
                    <div class="cmsBlockBackgroundPreview" style="border: 1px solid #ccc;position:relative;height: 200px;">
                        <div class="background-color"></div>
                    </div>
                </div>

            </div>
        </div>
    </div>
`,
  () => {
    registerRangeSliders();
    jscolor.installByClassName("jscolor");
  }
);
