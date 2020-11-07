// dependencies
useTool("quillEditor");

class newCms {
  constructor(container) {
    this.container = $(container);
    this.contentNode = this.container.find(`.newCmsContent`);

    this.edit_block_data = {
      target_block: null,
      last_target_block: null,
      node: this.container.find(`.editBlockRect`),
    };

    this.initAddBlockModal();

    setFormData(
      {
        edit_mode: 1,
      },
      container
    );

    this.container.addEventListener("mousemove", (event) => {
      this.mouseMove(event);
    });
    this.container.addEventListener("mousedown", (event) => {
      this.mouseDown(event);
    });
  }

  initEditBlock() {
    this.edit_block_data = {
      target_block: null,
      last_target_block: null,
      node: this.container.find(`.editBlockRect`),
    };
  }

  getCleanOutput(html) {
    var playground = $(document.createElement("DIV"));
    // TODO: is it even necessary?
    //document.body.appendChild(playground);
    playground.insertAdjacentHTML("afterbegin", html);

    playground.findAll(".newCms_add_block_btn").forEach((e) => {
      e.remove();
    });

    return playground.innerHTML;
  }

  initAddBlockModal() {
    registerModalContent(
      /*html*/ `
      <div id="newCmsBlocks" data-dismissable>
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

    this.initEditBlock();

    setFormData(
      {
        content: this.getCleanOutput(this.targetNode.innerHTML),
      },
      this.container
    );
    this.contentChange();

    setFormInitialState(this.container);

    showModal("newCms", { source: this.targetNode });
  }

  save() {
    // remove all unnecessary nodes and so on, keep it as a single function, copy all nodes and remove what u want

    this.targetNode.setValue(getFormData(this.container).content);
  }

  mouseMove(event) {
    /*const mx = event.clientX;
    const my = event.clientY;*/
    const target = $(event.target);

    const hovered_block = target
      ? target.findParentByClassName("newCms_block")
      : null;

    const edit_block_node = this.edit_block_data.node;

    // let the user do the job ;)
    if (target && target.findParentByClassName("editBlockRect")) {
      return;
    }

    let edit_block_active = false;
    if (
      hovered_block &&
      !hovered_block.classList.contains("newCms_container") &&
      this.edit_block_data.target_block !== target
    ) {
      // everything below happens just once when the rect is shown

      edit_block_active = true;

      let edit_block_html = /*html*/ `
        <button class="btn transparent">
          <i class="fas fa-pencil-alt"></i>
        </button>
      `;
      edit_block_html += /*html*/ `
        <button class="btn transparent remove_btn">
          <i class="fas fa-times"></i>
        </button>
      `;
      edit_block_node.setContent(edit_block_html);

      const remove_btn = edit_block_node.find(".remove_btn");
      if (remove_btn) {
        remove_btn.addEventListener("click", () => {
          this.removeBlock(hovered_block);
          this.mouseMove({ target: null });
        });
      }

      const hovered_block_rect = hovered_block.getBoundingClientRect();

      const scrollable_parent = hovered_block.findScrollableParent();
      const scrollable_parent_rect = scrollable_parent.getBoundingClientRect();

      // could we set it once? along with icons and so on
      edit_block_node.style.left =
        hovered_block_rect.left - scrollable_parent_rect.left + "px";
      edit_block_node.style.top =
        hovered_block_rect.top - scrollable_parent_rect.top + "px";
      edit_block_node.style.width = hovered_block_rect.width + "px";
      edit_block_node.style.height = hovered_block_rect.height + "px";

      // won't be lost when we the focus is lost
      this.edit_block_data.last_target_block = target;
    }

    edit_block_node.classList.toggle("active", edit_block_active);
    this.edit_block_data.target_block = target;
  }

  mouseDown(event) {
    const newCms_add_block_btn = $(event.target).findParentByClassName(
      "newCms_add_block_btn"
    );
    if (newCms_add_block_btn) {
      this.insertBlockModal(newCms_add_block_btn);
    }

    /*const newCms_quill_editor = $(event.target).findParentByClassName(
      "newCms_quill_editor"
    );
    if (newCms_quill_editor) {
      quillEditor.open(newCms_quill_editor);
    }*/
  }

  contentChange() {
    //this.contentNode.findAll(".newCms_block")

    this.insertMissingAddBlockButtons();
    this.insertMissingContainerHeaders();

    this.removeUnnecessaryAddBlockButtons();
    this.removeUnnecessaryContainerHeaders();

    this.contentNode.setValue();
  }

  insertMissingContainerHeaders() {
    this.contentNode.findAll(".newCms_container").forEach((c) => {
      if (!c.find(".newCms_container_header")) {
        c.insertAdjacentHTML(
          "afterbegin",
          /*html*/ `
          <div class="newCms_container_header">
            <button class="btn subtle">Usuń mnie kurwa cipo</button>
            <button class="btn subtle">chuj</button>
          </div>
        `
        );
      }
    });
  }

  insertMissingAddBlockButtons() {
    // consider empty containers
    [
      this.contentNode,
      ...this.contentNode.findAll(".newCms_container"),
    ].forEach((con) => {
      // can be anything inside ;)
      var has_add_block_btn = !!con.find(".newCms_add_block_btn");
      if (has_add_block_btn) {
        return;
      }
      var has_any_block = !!con.find(".newCms_block");
      if (has_any_block) {
        return;
      }
      const container_content = nonull(
        con.find(".newCms_container_content"),
        con
      );
      this.insertAddBlockButton(container_content, "afterbegin");
    });

    // before and after blocks
    this.contentNode.findAll(".newCms_block").forEach((con) => {
      if (
        !con.next() ||
        !con.next().classList.contains("newCms_add_block_btn")
      ) {
        this.insertAddBlockButton(con, "afterend");
      }
      if (
        !con.prev() ||
        !con.prev().classList.contains("newCms_add_block_btn")
      ) {
        this.insertAddBlockButton(con, "beforebegin");
      }
    });
  }

  removeUnnecessaryAddBlockButtons() {
    // two add blocks next to each other? get outta here
    this.contentNode.findAll(".newCms_add_block_btn").forEach((btn) => {
      const prev = btn.prev();
      if (prev && prev.classList.contains("newCms_add_block_btn")) {
        btn.remove();
      }
    });
  }

  removeUnnecessaryContainerHeaders() {
    //
  }

  insertAddBlockButton(target, position) {
    target.insertAdjacentHTML(
      position,
      /*html*/ `
        <button class="btn newCms_add_block_btn">
          <i class="fas fa-plus"></i>
        </button>
      `
    );
  }

  insertBlockModal(button) {
    showModal("newCmsBlocks", { source: button });
    this.insert_block_button = button;
  }

  insertBlock(target, position, type, options) {
    let content = "";
    let className = "";

    target.insertAdjacentHTML(
      position,
      /*html*/ `
        <div class="newCms_block newCms_${type}${className}">
            <div class="newCms_block_content newCms_${type}_content">${content}</div>
        </div>
      `
    );

    this.contentChange();
  }

  removeBlock(block) {
    block.remove();
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
                <div class="modules-sidebar shown" style="display:none !important">
                  <button class="toggle-sidebar-btn btn subtle" onclick="toggleModuleSidebar()" data-tooltip="Ukryj moduły"><i class="fas fa-chevron-left"></i><i class="fas fa-puzzle-piece"></i></button>
                  <span class="field-title modules-sidebar-title" style='margin-bottom:7px'><i class="fas fa-puzzle-piece"></i>
                   Moduły 
                   <i class="fas fa-info-circle" data-tooltip="Przeciągnij w prawo i upuść"></i>
                  </span>
                  <div class="modules"></div>
                </div>

                <div style="width:100%">
                  <div class="scroll-panel scroll-shadow" style="padding:10px;height: 100%;">
                    <div class="editBlockRect"></div>
                    <div class="newCmsContent newCms_container_content" data-type="html" name="content"></div>
                  </div>
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

/* TODO: temporary, u can get rid of the quill editor modal :) */
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
