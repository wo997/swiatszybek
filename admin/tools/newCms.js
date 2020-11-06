// dependencies
useTool("quillEditor");

class newCms {
  constructor(container) {
    this.container = $(container);
    this.contentNode = this.container.find(`.newCmsContent`);
    this.addBlockBtn = this.container.find(`.addBlockBtn`);

    this.initAddBlockModal();

    setFormData(
      {
        edit_mode: 1,
      },
      container
    );
  }

  initAddBlockModal() {
    registerModalContent(
      /*html*/ `
      <div id="newCmsBlocks">
          <div class="modal-body">
              <div class="custom-toolbar">
                  <span class="title">
                      Wstaw blok CMS'owy
                  </span>
                  <button class="btn secondary" onclick="hideParentModal(this)">Anuluj <i class="fa fa-times"></i></button>
              </div>

              <div class="scroll-panel scroll-shadow panel-padding">
                <div class="btn subtle" data-block="quill_editor">Blok tesktowy</div>
                <div class="btn subtle" data-block="container">kontener</div>
              </div>
          </div>
          <link href="/admin/tools/newCms.css?v=${CSS_RELEASE}" rel="stylesheet">
      </div>
    `,
      (modal) => {
        modal.findAll("[data-block]").forEach((e) => {
          e.onclick = () => {
            this.insertBlock(
              this.insert_block_button,
              "beforebegin",
              e.getAttribute("data-block")
            );
            hideModal(modal.id);
          };
        });
      }
    );
  }

  edit(targetNode, options) {
    this.targetNode = $(targetNode);
    this.options = options;

    setFormData(
      {
        content: this.targetNode.innerHTML,
      },
      this.container
    );
    this.contentChange();

    setFormInitialState(this.container);

    showModal("newCms", { source: this.targetNode });

    this.container.addEventListener("mousemove", (event) => {
      this.mouseMove(event);
    });
    this.container.addEventListener("mousedown", (event) => {
      this.mouseDown(event);
    });
  }

  save() {
    // remove all unnecessary nodes and so on, keep it as a single function, copy all nodes and remove what u want

    this.targetNode.setValue(getFormData(this.container).content);
  }

  mouseMove(event) {
    /*const mx = event.clientX;
    const my = event.clientY;
    const target = $(event.target);

    let flow = "column";
    let insert_within = this.contentNode;
    let hovered_block = target.findParentByClassName("newCms_block");
    if (hovered_block) {
      //hovered_block = hovered_block.find("newCms_block-content");
      const container_flow = hovered_block.getAttribute("data-desktop-flow");
      insert_within = container_flow.findParentByClassName("newCms_container");
    }

    let insert_within_rect = insert_within.getBoundingClientRect();

    this.addBlockBtn.style.top = insert_within_rect.top;
    this.addBlockBtn.style.left = insert_within_rect.left;
    this.addBlockBtn.classList.toggle("active", true);

    console.log(this.addBlockBtn, hovered_block, insert_within);*/
  }

  mouseDown(event) {
    const newCms_add_block_btn = event.target.findParentByClassName(
      "newCms_add_block_btn"
    );
    console.log(newCms_add_block_btn);
    if (newCms_add_block_btn) {
      this.insertBlockModal(newCms_add_block_btn);
    }

    const newCms_quill_editor = event.target.findParentByClassName(
      "newCms_quill_editor"
    );
    console.log(newCms_quill_editor);
    if (newCms_quill_editor) {
      quillEditor.open(newCms_quill_editor);
    }
  }

  contentChange() {
    //this.contentNode.findAll(".newCms_block")

    this.insertMissingAddBlockButtons();
    this.insertMissingContainerHeaders();

    this.contentNode.setValue();
  }

  insertMissingContainerHeaders() {
    this.contentNode.findAll(".newCms_container").forEach((c) => {
      // TODO insert container headers, these might require a wrapper
      console.log(c);
    });
  }

  insertMissingAddBlockButtons() {
    // consider empty containers
    [
      this.contentNode,
      ...this.contentNode.findAll(".newCms_container"),
    ].forEach((c) => {
      // can be anything inside ;)
      var has_add_block_btn = !!c.find(".newCms_add_block_btn");
      if (has_add_block_btn) {
        return;
      }
      var has_any_block = !!c.find(".newCms_block");
      if (has_any_block) {
        return;
      }
      this.insertAddBlockButton(c, "afterbegin");
    });

    // before and after blocks
    this.contentNode.findAll(".newCms_block").forEach((c) => {
      if (!c.next() || !c.next().classList.contains("newCms_add_block_btn")) {
        this.insertAddBlockButton(c, "afterend");
      }
      if (!c.prev() || !c.prev().classList.contains("newCms_add_block_btn")) {
        this.insertAddBlockButton(c, "beforebegin");
      }
    });
  }

  insertAddBlockButton(target, position) {
    target.insertAdjacentHTML(
      position,
      /*html*/ `
        <button class="btn newCms_add_block_btn subtle">
          <i class="fas fa-plus"></i>
        </button>
      `
    );
  }

  insertBlockModal(button) {
    showModal("newCmsBlocks");
    this.insert_block_button = button;
  }

  insertBlock(target, position, type, options) {
    let content = "";
    let className = "";

    target.insertAdjacentHTML(
      position,
      /*html*/ `
        <div class="newCms_block newCms_${type}${className}">
            <div class="newCms_block_content">${content}</div>
        </div>
      `
    );

    this.contentChange();
  }
}

function toggleNewCmsEditMode(edit_mode_input) {
  edit_mode_input
    .findParentByAttribute("data-form")
    .classList.toggle("newCms_edit_mode", edit_mode_input.getValue());
}

registerModalContent(
  /*html*/ `
    <div id="newCms" class="newCms" data-expand="large" data-form data-history>
        <div class="modal-body">
            <div class="custom-toolbar">
                <span class="title">
                    Edycja zawartości    
                </span>

                Tryb edycji <checkbox name="edit_mode" data-ignore-historyx class="no-wrap" onchange="toggleNewCmsEditMode(this)"></checkbox>
                <div class="history-buttons"></div>
                <button class="btn primary" onclick="window.pasteType='container';showModal('pasteBlock')" data-tooltip="Wklej skopiowany kontener / blok"><i class="fas fa-paste"></i></button>
                <button class="btn primary" onclick="copyCMS()" data-tooltip="Skopiuj całą zawartość do schowka"> <i class="fas fa-clipboard"></i> </button>
                <button class="btn secondary" onclick="hideParentModal(this)">Anuluj <i class="fa fa-times"></i></button>
                <button onclick="showCmsPreview()" class="btn primary preview_btn">Podgląd <i class="fas fa-eye"></i></button>
                <button class="btn primary" onclick="_newCms.save();hideParentModal(this);">Zapisz <i class="fa fa-save"></i></button>
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

                <div style="width:100%">
                  <div class="scroll-panel scroll-shadow" style="height: 100%;">
                    <div class="addBlockBtn">+</div>
                    <div class="newCmsContent newCms_container" data-type="html" name="content"></div>
                </div>
            </div>
        </div>
        <link href="/admin/tools/newCms.css?v=${CSS_RELEASE}" rel="stylesheet">
    </div>
  `,
  (modal) => {
    window._newCms = new newCms(modal);
  }
);

/* TODO: temporary */
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
