// dependencies
useTool("quillEditor");

// notes:
// everything needs to be scoped from cmsWrapper because of the recursive mode

var cmsPreview = null;

function showCmsPreview() {
  if (!cmsPreview) {
    return;
  }

  cmsPrepareOutput();

  var params = nonull(cmsPreview.data, {});
  params[cmsPreview.content_name] = cmsContainer.innerHTML;

  window.preview.open(cmsPreview.url, params);

  cmsUpdate();
}

// cms history start
var cmsHistory = [];

var ignoreHistory = false;
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

  cmsHistory.push(cmsContainer.innerHTML);
  while (cmsHistory.length > 20) cmsHistory.shift();
}
var cmsHistoryStepBack = 0;

function cmsHistoryUndo() {
  hideCMSBlockHeader();
  if (cmsHistoryStepBack < cmsHistory.length - 1) cmsHistoryStepBack++;
  cmsContainer.innerHTML =
    cmsHistory[cmsHistory.length - 1 - cmsHistoryStepBack];

  cmsUpdate();
}

function cmsHistoryRedo() {
  hideCMSBlockHeader();
  if (cmsHistoryStepBack > 0) cmsHistoryStepBack--;
  cmsContainer.innerHTML =
    cmsHistory[cmsHistory.length - 1 - cmsHistoryStepBack];

  cmsUpdate();
}

document.onkeydown = (e) => {
  if (!isModalActive("cms") && !isModalActive("cmsAdditional")) return;

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
      cmsContainer.insertAdjacentHTML("beforeend", getContainer(v));
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

    cmsContainer.insertAdjacentHTML("beforeend", v);

    success = true;
  }
  if (success) {
    input.value = "";
    hideParentModal(input);
  }
}

var cmsContainer;
var cmsWrapper;
var cmsSource;
var cmsTarget;
var cmsInsertContainerBtn;

var cmsParams = {};

var cmsModalLoaded = () => {
  cmsWrapper = $("#actual_cms_wrapper");
  cmsContainer = cmsWrapper.find(".cms");
  cmsObserver.observe(cmsContainer, {
    childList: true,
    subtree: true,
  });

  CMSBlockHeader.options = cmsWrapper.find(".cms-block-options");
  CMSBlockHeader.actions = cmsWrapper.find(".cms-block-actions");

  CMSContainerHeader.options = cmsWrapper.find(".cms-container-options");

  cmsInsertContainerBtn = $(".insert_container_btn");

  loadSideModules();
};

function loadSideModules() {
  var module_blocks_html = "";
  for (module_block_name in app_module_blocks) {
    var module_block = app_module_blocks[module_block_name];
    if (!module_block.icon)
      module_block.icon = '<i class="fas fa-puzzle-piece"></i>';
    module_blocks_html += `
      <div class="cms-block side-module" data-module-block="${module_block_name}" data-module-block-params="" draggable="true">
        <div class="cms-block-content">${module_block.icon} ${module_block.title}</div>
      </div>
    `;
  }

  $(".modules-sidebar .modules").setContent(module_blocks_html);
}

function editModule(block) {
  cmsTarget = block;
  cmsTarget.classList.add("during-module-edit");

  var module_block_name = block.getAttribute("data-module-block");
  var module_block = app_module_blocks[module_block_name];
  var modal_module_block_name = `modal_module_block_${module_block_name}`;
  if (!$(`#${modal_module_block_name}`)) {
    if (module_block.editUrl) {
      if (
        confirm(
          `Czy chcesz otworzyć edycję ${module_block.description} w nowej karcie?`
        )
      ) {
        window.open(module_block.editUrl);
      }
    } else {
      alert("Edycja niedostępna!");
    }
    return;
  }
  showModal(modal_module_block_name, {
    source: cmsTarget,
  });
  let params = {};
  try {
    params = JSON.parse(block.getAttribute("data-module-block-params"));
  } catch {}
  var modal = $(`#${modal_module_block_name}`);

  /*if (module_block.firstOpen) {
    module_block.firstOpen(params, modal, block);
    delete module_block.firstOpen;
  }
  if (!module_block.default_form_values) {
    module_block.default_form_values = getFormData(modal);
  }

  if (module_block.default_form_values) {
    setFormData(module_block.default_form_values, modal);
  }*/
  xhr({
    url: STATIC_URLS["ADMIN"] + "module_block_form",
    type: "html",
    params: {
      module_block_name: module_block_name,
    },
    success: (res) => {
      modal.find(".scroll-panel").setContent(res);
      module_block.formOpen(params, modal, block);
      setFormData(params, modal);
    },
  });
}

function saveModule(button) {
  hideParentModal(button);

  cmsTarget = cmsWrapper.find(".during-module-edit");
  if (!cmsTarget) return;
  removeClasses("during-module-edit");
  var module_block_name = cmsTarget.getAttribute("data-module-block");
  if (!module_block_name) return;
  var module_block = app_module_blocks[module_block_name];
  if (!module_block) return;

  var form_data = getFormData(`#modal_module_block_${module_block_name}`);
  if (module_block.formClose) {
    form_data = module_block.formClose(form_data);
  }

  if (form_data !== null) {
    cmsTarget.setAttribute(
      "data-module-block-params",
      JSON.stringify(form_data)
    );
  }

  var c = cmsTarget.find(".module-content"); // force update
  if (c) c.remove();
}

function editBlock() {
  if (!cmsTarget) return;
  if (cmsTarget.hasAttribute("data-module-block")) {
    editModule(cmsTarget);
    return;
  }
  var block_content = cmsTarget.find(".cms-block-content");
  quillEditor.open(block_content, {
    container: cmsTarget.findParentByClassName("cms-container"),
    block: cmsTarget,
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
      cmsContainer.insertAdjacentHTML("afterbegin", getContainer(content));
    }
  } else if (!cmsTarget || !cmsTarget.findParentByClassName("cms-wrapper")) {
    cmsContainer.insertAdjacentHTML(
      placeAfter ? "beforeend" : "afterbegin",
      getContainer(content)
    );
  } else {
    cmsTarget.insertAdjacentHTML(
      placeAfter ? "afterend" : "beforebegin",
      getContainer(content)
    );
  }
  cmsDelayActions();
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
  cmsDelayActions();
  cmsHistoryPush();
}

function insertModule(module_name) {
  var module = app_module_blocks[module_name];
  if (!module) return;

  awaitingScroll = true;

  cmsContainer.insertAdjacentHTML(
    "beforeend",
    getContainer(`
            <div class="cms-block" data-module-block="${module_name}" data-module-block-params="${module.params}">
                <div class="cms-block-content"></div>
            </div>`)
  );
  hideModalTopMost();
  cmsHistoryPush();
}

var moduleListModalLoaded = () => {
  var moduleList = "";
  for (module_block_name in app_module_blocks) {
    var module_block = app_module_blocks[module_block_name];
    if (!module_block.icon)
      module_block.icon = '<i class="fas fa-puzzle-piece"></i>';
    moduleList += `<div class="btn primary" onclick="insertModule('${module_block_name}')">${module_block.icon} ${module_block.description}</div>`;
    if (link_module_block_form_path[module_block_name]) {
      registerModalContent(`
          <div id="modal_module_block_${module_block_name}" data-expand>
              <div class="modal-body">
                  <div class="custom-toolbar">
                      <span class="title">${module_block.description}</span>
                      <div class="btn secondary" onclick="hideParentModal(this)">Anuluj <i class="fa fa-times"></i></div>
                      <div class="btn primary" onclick="saveModule(this);">Zapisz <i class="fa fa-save"></i></div>
                  </div>
                  <div class="scroll-panel scroll-shadow panel-padding">
                      
                  </div>
              </div>
          </div>
      `);

      module_block.form = $(`#modal_module_block_${module_block_name}`);
    }
  }

  $(".moduleList").innerHTML = moduleList;
};

function copyCMS() {
  copyBlock(cmsContainer);
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
  cmsDelayActions();
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
    if (cmsParams.delete_block_with_parent !== false) {
      cmsTarget = findParentByClassName(cmsTarget, "cms-container");
      deleteContainer(cmsTarget, false);
      return;
    }
  }
  cmsDelayActions();
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

function editCMS(t, params = {}) {
  cmsSource = $(t);
  cmsContainer.setValue(cmsSource.innerHTML);

  // just in case
  cmsContainer.findAll(".cms").forEach((e) => {
    e.outerHTML = e.innerHTML;
  });

  // trigger cache warmup
  cmsContainer.findAll(".cms-block[data-module-block]").forEach((e) => {
    var c = e.find(".module-content");
    if (c) removeNode(c);
  });

  removeClasses("during-module-edit");
  cmsWrapper.classList.remove("show_wireframe");

  cmsHistory = [];
  cmsHistoryPush();

  if (params.show_modal !== false) {
    showModal("cms", { source: cmsSource });
    cmsPreview = params.preview;

    cmsWrapper.find(".preview_btn").classList.toggle("hidden", !cmsPreview);
  } else {
    cmsWrapper.find(".preview_btn").classList.toggle("hidden", true);
  }

  cmsTarget = null;

  cmsParams = params;

  setTimeout(() => {
    cmsUpdate();
  }, 200);

  setTimeout(() => {
    resizeCallback();
  }, 450);
}

// additional start
var backupStateOfCMS = null;
function editCMSAdditional(t, params) {
  $("#cmsAdditional .stretch-vertical").empty();
  $("#cmsAdditional .stretch-vertical").appendChild(cmsWrapper);
  $("#cms .stretch-vertical").appendChild(cmsWrapper.cloneNode(true)); // don't make it disappear

  backupStateOfCMS = {
    content: cmsContainer.innerHTML,
    history: cmsHistory,
    source: cmsSource,
    target: cmsTarget,
    params: cmsParams,
  };

  editCMS(t, { show_modal: false, ...params });

  if (params.type) {
    $("#cmsAdditional").setAttribute("data-type", params.type);
  }

  showModal("cmsAdditional");
}

window.addEventListener("modal-hide", (event) => {
  if (event.detail.node.id != "cmsAdditional") {
    return;
  }
  $("#cms .stretch-vertical").empty();
  $("#cms .stretch-vertical").appendChild(cmsWrapper);

  $("#cmsAdditional .stretch-vertical").appendChild(cmsWrapper.cloneNode(true)); // don't make it disappear

  cmsHistory = backupStateOfCMS.history;
  cmsContainer.setValue(backupStateOfCMS.content);
  cmsSource = backupStateOfCMS.source;
  cmsTarget = backupStateOfCMS.target;
  cmsParams = backupStateOfCMS.params;

  cmsWrapper.find(".preview_btn").classList.toggle("hidden", !cmsPreview);

  $("#cmsAdditional").removeAttribute("data-type");
});
// additional end

function cmsPrepareOutput() {
  cmsWrapper.findAll("[draggable]").forEach((e) => {
    e.removeAttribute("draggable");
    e.style.opacity = "";
  });
  removeClasses("during-module-edit");
}

function closeCms(save) {
  if (save) {
    cmsPrepareOutput();
    var content = cmsContainer.innerHTML;
    cmsSource.setValue(content);
  }
  cmsSource = null;
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

function setNodeBackgroundColorOpacity(node, op, remove_if_transparent = true) {
  if (op == 0 && remove_if_transparent) {
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
    return rgbStringToHex(bi.style.backgroundColor);
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

  toggleDisabled(
    cmsWrapper.find(".cms-undo"),
    cmsHistoryStepBack >= cmsHistory.length - 1
  );
  toggleDisabled(cmsWrapper.find(".cms-redo"), cmsHistoryStepBack == 0);

  $$("[data-module]").forEach((e) => {
    e.setAttribute("data-module-block", e.getAttribute("data-module"));
    e.removeAttribute("data-module");
  });
  $$("[data-module-params]").forEach((e) => {
    e.setAttribute(
      "data-module-block-params",
      e.getAttribute("data-module-params")
    );
    e.removeAttribute("data-module-params");
  });

  cmsWrapper.findAll(".cms-block").forEach((block) => {
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

    if (block.getAttribute("data-module-block") == "custom-html") {
      const content = block.find(".cms-block-content");
      addMissingDirectChildren(
        content,
        (c) => c.classList.contains("html-container"),
        `<div class="html-container"></div>`
      );
    }

    migrateImageBackground(block);
  });

  cmsWrapper.findAll(".cms-container").forEach((container) => {
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

  if (!cmsWrapper.find(".cms-container")) {
    setTimeout(() => {
      if (cmsHistory.length > 0) {
        cmsHistory.pop();
      }
      addContainer();
    }, 100);
  }

  cmsWrapper.findAll(".cms-container").forEach((e) => {
    if (!e.find(".cms-block")) {
      setTimeout(() => {
        addBlock("", e);
      }, 100);
    }
  });

  cmsWrapper.findAll(".cms-block[data-module-block]").forEach((e) => {
    var c = e.find(".cms-block-content");
    if (!c.innerHTML.trim()) {
      var module_block_name = e.getAttribute("data-module-block");
      var module_block = app_module_blocks[module_block_name];

      let params = {};
      try {
        params = JSON.parse(e.getAttribute("data-module-block-params"));
      } catch {}

      if (module_block && module_block.render) {
        e.find(".cms-block-content").setContent(`
            <div class="module-content">
                <div>
                    ${module_block.icon} ${module_block.title}
                    <p style="margin:10px 0;font-size:0.8em">${
                      module_block.render ? module_block.render(params, e) : ""
                    }</p>
                </div>
            </div>`);
      }
    }
  });

  if (cmsParams.onChange) {
    cmsParams.onChange(cmsContainer);
  }
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

      console.log(val);
      if (val === "") {
        targets.removeAttribute(`data-${attribute}`);
      } else {
        targets.setAttribute(`data-${attribute}`, val);
      }
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
  if (!col) col = "ffffff";

  $("#cmsBlockBackground .bckgcolor").setValue(col);

  var op = getNodeBackgroundColorOpacity(target);
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
        if (
          node.classList &&
          (node.classList.contains("cms-block") ||
            node.classList.contains("cms-container"))
        ) {
          node.classList.remove("activeBlock");
          if (awaitingScroll) {
            scrollToElement(node, { parent: cmsContainer.parent() });
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
            scrollToElement(node, cmsContainer.parent());
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

  if (!isModalActive("cms") && !isModalActive("cmsAdditional")) return;

  var wrapper = cmsWrapper.find(".cms-wrapper");

  var targetY = event.clientY;

  var nodeBefore = null;
  var wrapperRect = wrapper.getBoundingClientRect();
  var firstY = wrapperRect.top;
  var secondY = wrapperRect.top + wrapper.scrollHeight;
  cmsContainer.directChildren().forEach((e) => {
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

  if (
    secondY < firstY + 25 &&
    !findParentByClassName(target, "cms-block-actions") &&
    !findParentByClassName(target, "cms-block-options")
  ) {
    cmsInsertContainerBtn.style.display = "flex";
    var h = 20; //(secondY - firstY);
    //if (h > 25) h = 25;
    cmsInsertContainerBtn.style.height = h + "px";
    cmsInsertContainerBtn.style.top =
      firstY - wrapper.getBoundingClientRect().top + wrapper.scrollTop + "px";
  } else {
    cmsInsertContainerBtn.style.display = "none";
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
function cmsDelayActions() {
  actionsDelayed = true;
  delay("enableActions", 420);
}
function enableActions() {
  actionsDelayed = false;
}

var mouseMoveBlock = function (target) {
  if (!cmsSource || actionsDelayed) return;

  if (!isModalActive("cms") && !isModalActive("cmsAdditional")) return;

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

  if (
    CMSBlockHeader.target &&
    CMSBlockHeader.target.classList.contains("side-module")
  ) {
    CMSBlockHeader.target = null;
    CMSBlockHeader.options.style.display = "";
    CMSBlockHeader.actions.style.display = "";
    return;
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
    var parentRect = CMSBlockHeader.options
      .parent()
      .parent()
      .getBoundingClientRect();
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

      if (!event.target.hasAttribute("draggable")) {
        event.preventDefault();
        return;
      }

      if (
        !event.target ||
        !$(event.target).findParentById("actual_cms_wrapper")
      ) {
        return;
      }
    } catch (e) {}

    draggedNode = event.target;

    draggedNode.style.opacity = 0.5;

    cmsWrapper.classList.add("show_wireframe");
  },
  false
);

document.addEventListener(
  "dragend",
  () => {
    if (draggedNode) {
      draggedNode.style.opacity = "";
    }
    draggedNode = null;
    cmsWrapper.classList.remove("show_wireframe");
  },
  false
);

function dragover(event) {
  if (!draggedNode) {
    return;
  }

  var requestClass = "cms-block";
  if (draggedNode.classList.contains("cms-container")) {
    requestClass = "cms-container";
  }
  var newplaceNearNode = findParentByClassName(event.target, requestClass);

  if (newplaceNearNode && newplaceNearNode.classList.contains("side-module")) {
    return;
  }

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

        copiedNode = $(draggedNode.cloneNode(true));

        cmsDelayActions();

        var is_side_module = draggedNode.classList.contains("side-module");

        if (!is_side_module) {
          var isContainer = draggedNode.classList.contains("cms-container");
          if (isContainer) {
            deleteContainer(draggedNode, false);
          } else {
            deleteBlock(draggedNode, false);
          }
        }

        var insertInParent = placeNearNode.parent();
        setTimeout(
          () => {
            insertInParent.insertBefore(copiedNode, placeNearNodeFinal);

            if (is_side_module) {
              copiedNode.classList.remove("side-module");
              copiedNode.find(".cms-block-content").empty();
            }
            removeClasses("add_after");
            removeClasses("add_before");
          },
          isContainer || is_side_module ? 0 : 150
        );

        cmsHistoryPush();
      }
    }
    placeNearNode = null;
  },
  false
);

function moveBlock(direction, deep_scan = false) {
  if (!cmsTarget) return;
  var put_near = null;
  var did_jump = false;
  if (direction === 1) {
    put_near = cmsTarget.next();
    if (deep_scan && !put_near) {
      var nextParent = cmsTarget.parent().parent().next();
      if (nextParent) {
        var nextParentChildren = nextParent
          .find(".cms-container-content")
          .directChildren();
        if (nextParentChildren.length > 0) {
          put_near = nextParentChildren[0];
          did_jump = true;
        }
      }
    }
  } else if (direction === -1) {
    put_near = cmsTarget.prev();
    if (deep_scan && !put_near) {
      var previousParent = cmsTarget.parent().parent().prev();
      if (previousParent) {
        var previousParentChildren = previousParent
          .find(".cms-container-content")
          .directChildren();
        if (previousParentChildren.length > 0) {
          put_near = previousParentChildren[previousParentChildren.length - 1];
          did_jump = true;
        }
      }
    }
  }

  if (!put_near) {
    return;
  }

  awaitingScroll = true;

  cmsDelayActions();

  if (direction === 1) {
    var parent = put_near.parent();
    if (did_jump) {
    } else {
      put_near = put_near.next();
    }
    parent.insertBefore(cmsTarget, put_near);
  } else if (direction === -1) {
    var parent = put_near.parent();
    if (did_jump) {
      put_near = put_near.next();
    } else {
    }
    parent.insertBefore(cmsTarget, put_near);
  }

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
  setNodeBackgroundColorOpacity(
    $(".cmsNodeBackgroundPreview"),
    val / 100,
    false
  );
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

function toggleModuleSidebar() {
  var shown = $(".modules-sidebar").classList.toggle("shown");
  if (shown) {
  }
  var btn = $(".modules-sidebar .toggle-sidebar-btn");
  btn.classList.toggle("subtle", shown);
  btn.classList.toggle("important", !shown);

  btn.setAttribute("data-tooltip", shown ? "Ukryj moduły" : "Wstaw moduły");
}

registerModalContent(
  `
    <div id="cms" data-expand="large">
        <div class="stretch-vertical">
          <div id="actual_cms_wrapper">
            <div class="custom-toolbar">
                <span class="title">
                    Edycja zawartości
                    <button class="btn primary cms-undo" onclick="cmsHistoryUndo()"> <i class="fas fa-undo-alt"></i> </button>
                    <button class="btn primary cms-redo" onclick="cmsHistoryRedo()"> <i class="fas fa-redo-alt"></i> </button>
                    <!--<button class="btn primary add_module_top_btn" onclick="showModal('cmsModules')" data-tooltip="Wstaw moduł"><i class="fas fa-puzzle-piece"></i></button>-->
                    <button class="btn primary" onclick="window.pasteType='container';showModal('pasteBlock')" data-tooltip="Wklej skopiowany kontener / blok"><i class="fas fa-paste"></i></button>
                    <button class="btn primary" onclick="copyCMS()" data-tooltip="Skopiuj całą zawartość do schowka"> <i class="fas fa-clipboard"></i> </button>
                </span>
                
                <button class="btn secondary" onclick="showModal('cms_poradnik')">Poradnik <i class="fas fa-info-circle"></i></button>
                <button class="btn secondary" onclick="closeCms(false);hideParentModal(this)">Anuluj <i class="fa fa-times"></i></button>
                <button onclick="showCmsPreview()" class="btn primary preview_btn">Podgląd <i class="fas fa-eye"></i></button>
                <button class="btn primary" onclick="closeCms(true);hideParentModal(this);">Zapisz <i class="fa fa-save"></i></button>
            </div>

            <div class="mobileRow" style="flex-shrink: 1;overflow-y: hidden;flex-grow: 1;">
                <div class="modules-sidebar shown">
                  <button class="toggle-sidebar-btn btn subtle" onclick="toggleModuleSidebar()" data-tooltip="Ukryj moduły"><i class="fas fa-chevron-left"></i><i class="fas fa-puzzle-piece"></i></button>
                  <span class="field-title modules-sidebar-title" style='margin-bottom:7px'><i class="fas fa-puzzle-piece"></i>
                   Moduły 
                   <i class="fas fa-info-circle" data-tooltip="Przeciągnij w prawo i upuść"></i>
                  </span>
                  <div class="modules"></div>
                </div>

                <div>
                  <div class="scroll-panel scroll-shadow cms-wrapper">
                    <div class="">
                        <div style="position:absolute;display:none;z-index:1000" onclick="addContainer('',placeContainerAfter,true)" class="action_block insert_container_btn" data-tooltip="Wstaw kontener" data-position="center"> <i class="fas fa-plus-square"></i> </div>
                        <div class="cms" data-type="html"></div>

                        <div class="cms-container-options cms-toolbar-shadow">

                            <div class="btn" onclick="editContainerSettings()" data-tooltip="Wymiary / Rozmieszczenie"> <i class="fas fa-crop-alt"></i> <i class="fas fa-arrows-alt"></i> </div>

                            <div class="btn" onclick="editCMSBackground()" data-tooltip="Tło kontenera - zdjęcie / kolor"> <i class="fas fa-image"></i> <i class="fas fa-fill-drip"></i> </div>

                            <div class="btn" onclick="editCMSBorder()" data-tooltip="Obramowanie kontenera"> <i class="fas fa-border-style"></i> </div>

                            <div class="showhover">
                                <div class="btn" data-tooltip="Zmiana kolejności. Możesz też złapać kontener i go upuścić"> <i class="fas fa-sort"></i> </div>
                                <div class="menucontent cms-toolbar-shadow" style="display:flex;flex-direction:column;align-items:stretch">
                                    <div class="btn" onclick="moveBlock(-1)" data-tooltip="Przesuń wyżej"> <i class="fas fa-arrow-up"></i> </div>
                                    <div class="btn" onclick="moveBlock(1)" data-tooltip="Przesuń niżej"> <i class="fas fa-arrow-down"></i> </div>
                                </div>
                            </div>

                            <div class="btn" onclick="copyContainer()" data-tooltip="Skopiuj kontener do schowka"> <i class="fas fa-clipboard"></i> </div>
                            
                            <div class="btn" onclick="duplicateContainer()" data-tooltip="Duplikuj kontener"> <i class="fas fa-clone"></i> </div>

                            <div class="btn" onclick="window.pasteType='block';showModal('pasteBlock')" data-tooltip="Wklej skopiowany blok"><i class="fas fa-paste"></i></div>

                            <div class="btn delete_block_btn" onclick="deleteContainer()" data-tooltip="Usuń kontener"> <i class="fas fa-times"></i> </div>
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
                                <div class="btn" data-tooltip="Zmiana kolejności. Możesz też złapać blok i go upuścić"> <i class="fas fa-sort" style="transform:rotate(90deg)"></i> </div>
                                <div class="menucontent cms-toolbar-shadow" style="display:flex;flex-direction:column;align-items:stretch">
                                    <div class="btn" onclick="moveBlock(-1,true)" data-tooltip="Przesuń wstecz"> <i class="fas fa-arrow-left"></i> </div>
                                    <div class="btn" onclick="moveBlock(1,true)" data-tooltip="Przesuń dalej"> <i class="fas fa-arrow-right"></i> </div>
                                </div>
                            </div>

                            <div class="btn" onclick="duplicateBlock()" data-tooltip="Duplikuj blok"> <i class="fas fa-clone"></i> </div>

                            <div class="btn" onclick="copyBlock()" data-tooltip="Skopiuj blok do schowka"> <i class="fas fa-clipboard"></i> </div>

                            <div class="btn" class="delete_block_btn" onclick="deleteBlock()" data-tooltip="Usuń blok"> <i class="fas fa-times"></i> </div>
                        </div>

                    </div>
                  </div>
                </div>
            </div>
          </div>

        </div>
        <link href="/builds/cms.css?v=${CSS_RELEASE}" rel="stylesheet">
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
                ${hide_complicated_btn}
                <div class="btn secondary" onclick="hideParentModal(this)">Anuluj <i class="fa fa-times"></i></div>
                <div class="btn primary" onclick="saveBlockSettings();hideParentModal(this)">Zapisz <i class="fa fa-save"></i></div>
            </div>

            <div style="padding:10px;margin-top:-15px">
                <div class="desktopRow spaceColumns" style="text-align: center;">
                    <div>
                        <h3 style="text-align:center">Wersja desktopowa <i class='fas fa-desktop'></i></h3>
                        <h4>Minimalna wysokość</h4>
                        <c-select class="inline" style="width:150px">
                            <input type="text" class="field" data-attribute="desktop-min-height" data-default-value="" data-default-unit="px">
                            <c-arrow></c-arrow>
                            <c-options>
                                <c-option>100px</c-option>
                                <c-option>200px</c-option>
                                <c-option>300px</c-option>
                                <c-option>400px</c-option>
                            </c-options>
                        </c-select>

                        <h4>Szerokość bloku</h4>
                        <c-select class="inline" style="width:150px">
                            <input type="text" class="field" data-attribute="desktop-width" data-default-value="100%" data-default-unit="px">
                            <c-arrow></c-arrow>
                            <c-options>
                                <c-option>100%</c-option>
                                <c-option data-value="50%">1/2</c-option>
                                <c-option data-value="33.333%">1/3</c-option>
                                <c-option data-value="25%">1/4</c-option>
                                <c-option data-value="20%">1/5</c-option>
                            </c-options>
                        </c-select>
                    </div>
                    <div>
                        <h3 style="text-align:center">Wersja mobilna <i class='fas fa-mobile-alt'></i></h3>
                        <h4>Minimalna wysokość</h4>
                        <c-select class="inline" style="width:150px">
                            <input type="text" class="field" data-attribute="mobile-min-height" data-default-value="" data-default-unit="px">
                            <c-arrow></c-arrow>
                            <c-options>
                                <c-option>100px</c-option>
                                <c-option>200px</c-option>
                                <c-option>300px</c-option>
                                <c-option>400px</c-option>
                            </c-options>
                        </c-select>

                        <h4>Szerokość bloku</h4>
                        <c-select class="inline" style="width:150px">
                            <input type="text" class="field" data-attribute="mobile-width" data-default-value="100%" data-default-unit="px">
                            <c-arrow></c-arrow>
                            <c-options>
                                <c-option>100%</c-option>
                                <c-option data-value="50%">1/2</c-option>
                                <c-option data-value="33.333%">1/3</c-option>
                                <c-option data-value="25%">1/4</c-option>
                                <c-option data-value="20%">1/5</c-option>
                            </c-options>
                        </c-select>
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

  var is_complicated = ["row nowrap", "row wrap", "column"].indexOf(val) == -1;

  var is_complicated_attr = is_complicated ? "data-complicated" : "";

  var getDiv = (index) => {
    return `<div style='${styles}min-height:15px;background:#fff;filter:brightness(${
      1 - index * 0.1
    });display:flex;justify-content:center;align-items:center'>${index}</div>`;
  };

  flows += `<div ${is_complicated_attr} style='border:1px solid #aaa;margin: 5px;;display:inline-flex;flex-flow:${val};width:75px;' data-option="${val}" onclick='selectInGroup(this)'>
      ${getDiv(1)}${getDiv(2)}${getDiv(3)}`;

  if (isRow) {
    flows += `${getDiv(4)}${getDiv(5)}`;
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
            <c-select style="width:100px">
                <input type="text" class="field" data-attribute="${prefix}_top" data-default-value="${defaults.top}" data-default-unit="px" ${target}>
                <c-arrow></c-arrow>
                <c-options>
                    <c-option>0</c-option>
                    <c-option>12px</c-option>
                    <c-option>24px</c-option>
                    <c-option>36px</c-option>
                    <c-option>2%</c-option>
                    <c-option>4%</c-option>
                    <c-option>6%</c-option>
                </c-options>
            </c-select>
        </div>
        <div style="display:flex;justify-content: space-around;padding: 20px 0;">
            <c-select style="width:100px">
                <input type="text" class="field" data-attribute="${prefix}_left" data-default-value="${defaults.top}" data-default-unit="px" ${target}>
                <c-arrow></c-arrow>
                <c-options>
                    <c-option>0</c-option>
                    <c-option>12px</c-option>
                    <c-option>24px</c-option>
                    <c-option>36px</c-option>
                    <c-option>2%</c-option>
                    <c-option>4%</c-option>
                    <c-option>6%</c-option>
                </c-options>
            </c-select>
            <c-select style="width:100px">
                <input type="text" class="field" data-attribute="${prefix}_right" data-default-value="${defaults.top}" data-default-unit="px" ${target}>
                <c-arrow></c-arrow>
                <c-options>
                    <c-option>0</c-option>
                    <c-option>12px</c-option>
                    <c-option>24px</c-option>
                    <c-option>36px</c-option>
                    <c-option>2%</c-option>
                    <c-option>4%</c-option>
                    <c-option>6%</c-option>
                </c-options>
            </c-select>
        </div>
        <div style="display:flex;justify-content:center">
            <c-select style="width:100px">
                <input type="text" class="field" data-attribute="${prefix}_bottom" data-default-value="${defaults.top}" data-default-unit="px" ${target}>
                <c-arrow></c-arrow>
                <c-options>
                    <c-option>0</c-option>
                    <c-option>12px</c-option>
                    <c-option>24px</c-option>
                    <c-option>36px</c-option>
                    <c-option>2%</c-option>
                    <c-option>4%</c-option>
                    <c-option>6%</c-option>
                </c-options>
            </c-select>
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
                <c-select style="width:100px" class="inline">
                    <input type="text" class="field" data-attribute="border-width" onchange="updateBorderPreview()">
                    <c-arrow></c-arrow>
                    <c-options>
                        <c-option>0</c-option>
                        <c-option>1px</c-option>
                        <c-option>2px</c-option>
                        <c-option>5px</c-option>
                    </c-options>
                </c-select>

                <div class="field-title">Kolor krawędzi</div>
                <div class="glue-children">
                  <input class="jscolor field inline" onclick="this.select()" data-attribute="border-color" onchange="updateBorderPreview()">
                  <button class="btn primary" onclick="$(this).prev().setValue('')">Brak <i class="fa fa-times"></i></button>
                </div>

                <div class="field-title">Zaokrąglenie krawędzi</div>
                <c-select style="width:100px" class="inline">
                    <input type="text" class="field" data-attribute="border-radius" onchange="updateBorderPreview()">
                    <c-arrow></c-arrow>
                    <c-options>
                        <c-option>0</c-option>
                        <c-option>6px</c-option>
                        <c-option>10px</c-option>
                        <c-option>10%</c-option>
                    </c-options>
                </c-select>

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
                ${hide_complicated_btn}
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
                        <c-select class="inline" style="width:150px">
                            <input type="text" class="field" data-attribute="desktop-min-height" data-default-value="" data-default-unit="px">
                            <c-arrow></c-arrow>
                            <c-options>
                                <c-option data-value="">Brak</c-option>
                                <c-option>150px</c-option>
                                <c-option>300px</c-option>
                                <c-option>400px</c-option>
                            </c-options>
                        </c-select>

                        <h4>Kierunek układania się bloków</h4>
                        <div data-select-group="desktop-flex-flow" style="display:flex;flex-wrap:wrap">
                            <input type="hidden" style="width:100px" data-attribute="desktop-flex-flow" data-target=".cms-container-content">
                            ${flows}
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

                        <br>

                        <label class="checkbox-wrapper field-title"><input type="checkbox" data-attribute="desktop-full-width"><div class="checkbox"></div>100% szerokości okna przeglądarki</label>

                        <br><br>
                    </div>
                    <div>
                        <h3 style="text-align:center">Wersja mobilna <i class='fas fa-mobile-alt'></i></h3>
                        <h4>Minimalna wysokość</h4>
                        <c-select class="inline" style="width:150px">
                            <input type="text" class="field" data-attribute="mobile-min-height" data-default-value="" data-default-unit="px">
                            <c-arrow></c-arrow>
                            <c-options>
                                <c-option data-value="">Brak</c-option>
                                <c-option>150px</c-option>
                                <c-option>300px</c-option>
                                <c-option>400px</c-option>
                            </c-options>
                        </c-select>

                        <h4>Kierunek układania się bloków</h4>
                        <div data-select-group="mobile-flex-flow" style="display:flex;flex-wrap:wrap">
                            <input type="hidden" style="width:100px" data-attribute="mobile-flex-flow" data-target=".cms-container-content">
                            ${flows}
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

                  <div class="btn primary" onclick='fileManager.open(null, {callback: setNodeBackgroundImagePreview, source: this, asset_types: ["image"]})'>Wybierz <i class="fas fa-image"></i></div>

                  <div class="btn primary" onclick="setNodeBackgroundImagePreview()">Usuń <i class="fa fa-times"></i></div>
                </div>

                <br>

                <div class="field-title">
                  Kolor tła <i class='fas fa-info-circle' data-tooltip='Wpisz kolor lub kliknij w pole i wybierz'></i>
                </div>

                <div class="glue-children">
                  <input class="bckgcolor jscolor field" onclick="this.select()" onchange="setNodeBackgroundColorPreview(this.value,true)" style="width: 65px;text-align: center;">
                  <button class="btn primary" onclick="$(this).prev().setValue('ffffff');$('#cmsBlockBackground .image-opacity').setValue(0)">Brak <i class="fa fa-times"></i></button>
                </div>

                <div class="field-title">
                  Widoczność koloru
                  <i class='fas fa-info-circle' data-tooltip='Pozwala dostosować kontrast pomiędzy tekstem, a zdjęciem'></i>
                </div>
                <input type="range" class="field" data-class="image-opacity" min="0" max="100" step="1" data-background="linear-gradient(to right, #fff, #000)"; oninput="this.dispatchEvent(new Event('change'))" onchange="setPreviewBackgroundColorOpacity(this.value)">
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

registerModalContent(
  `
    <div id="cmsAdditional" data-expand="idklarge">
      <div class="stretch-vertical">

      </div>
    </div>
  `
);
