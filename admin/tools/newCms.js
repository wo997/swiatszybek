// dependencies
useTool("quillEditor");

class InlineQuillEditor {
  color_list = [
    "rgb(255, 85, 118)",
    "rgb(255,43,0)",
    "#FFD700",
    "var(--primary-clr)", // TODO: primary color comes from admin, not front, weird glitch, might wanna abandon or let the use prepare color list for his needs in other theme tab
    "#3f00b5",
    "rgb(160,65,112)",
    "rgb(65,160,113)",
    "#e60000",
    "#ff9900",
    "#ffff00",
    "#008a00",
    "#0066cc",
    "#9933ff",
    "#ffffff",
    "#facccc",
    "#ffebcc",
    "#ffffcc",
    "#cce8cc",
    "#cce0f5",
    "#ebd6ff",
    "#bbbbbb",
    "#f06666",
    "#ffc266",
    "#ffff66",
    "#66b966",
    "#66a3e0",
    "#c285ff",
    "#888888",
    "#a10000",
    "#b26b00",
    "#b2b200",
    "#006100",
    "#0047b2",
    "#6b24b2",
    "#444444",
    "#5c0000",
    "#663d00",
    "#666600",
    "#003700",
    "#002966",
    "#3d1466",
    "#000000",
  ];

  constructor(newCms, node, wrapper, newCmsContent_scroll_panel) {
    this.node = node;
    this.wrapper = wrapper;
    this.newCms = newCms;

    var Size = Quill.import("attributors/style/size");
    Size.whitelist = [];
    for (let i = 0; i < 10; i++) {
      Size.whitelist.push(Math.round(Math.pow(1.25, i - 2) * 100) / 100 + "em");
    }

    this.quill_editor = new Quill(node, {
      scrollingContainer: newCmsContent_scroll_panel,
      theme: "snow",
      modules: {
        syntax: true,
        toolbar: [
          [
            {
              size: Size.whitelist,
            },
          ],
          ["bold", "italic", "underline", "strike"],
          [
            {
              color: this.color_list,
            },
            {
              background: this.color_list,
            },
          ],
          [
            {
              list: "ordered",
            },
            {
              list: "bullet",
            },
            {
              indent: "-1",
            },
            {
              indent: "+1",
            },
          ],
          [
            {
              header: "1",
            },
            {
              header: "2",
            },
            {
              header: "3",
            },
          ],
          [
            {
              align: [],
            },
          ],
          ["clean"],
        ],
        table: false,
      },
    });

    this.content_node = this.node.find(".ql-editor");

    this.newCms.container.addEventListener(
      IS_MOBILE ? "click" : "mousedown",
      (event) => {
        this.mouseDown(event);
      }
    );
  }

  appendInlineQuillEditor(block) {
    const newCms_block_content = block.find(".newCms_block_content");

    this.newCms.inline_edited_block = block;

    const block_html = newCms_block_content.innerHTML;
    this.content_node.setContent(block_html);

    block.appendChild(this.wrapper);
    this.wrapper.classList.add("visible");

    this.newCms.edit_block.hide();

    block.classList.add("during_inline_edit");
  }

  saveInlineQuillEditor(block) {
    const newCms_block_content = block.find(".newCms_block_content");

    this.newCms.inline_edited_block = null;

    const ql_html = this.content_node.innerHTML;
    newCms_block_content.setContent(ql_html);

    this.newCms.content_scroll_panel.appendChild(this.wrapper);
    this.wrapper.classList.remove("visible");

    this.newCms.edit_block.hide();

    block.classList.remove("during_inline_edit");

    this.newCms.contentChange();
  }

  mouseDown(event) {
    const target = $(event.target);

    const newCms_block = target.findParentByClassName("newCms_block");

    if (
      this.newCms.inline_edited_block &&
      this.newCms.inline_edited_block != newCms_block
    ) {
      this.saveInlineQuillEditor(this.newCms.inline_edited_block);
    }
  }
}

class EditBlockRect {
  constructor(edit_block_node, newCms) {
    this.node = edit_block_node;
    this.newCms = newCms;
    this.init();
  }

  init() {
    this.target = null;
    this.last_target = null;
  }

  hide() {
    this.init();
    this.node.classList.toggle("active", false);
  }

  hideButtons() {
    this.node.classList.add("hide_contents");
  }

  showButtons() {
    this.node.classList.remove("hide_contents");
  }

  mouseMove(event) {
    const target = $(event.target);

    let hovered_block_content = null;
    let hovered_block = null;

    let hovered_container_header = target
      ? target.findParentByClassName("newCms_container_header")
      : null;

    if (hovered_container_header) {
      hovered_block_content = hovered_container_header;
      hovered_block = hovered_block_content.findParentByClassName(
        "newCms_block"
      );
    } else if (target) {
      let x = target.findParentByClassName("newCms_block");
      if (x && !x.classList.contains("newCms_container")) {
        hovered_block_content = x;
        hovered_block = x;
      }
    }

    // let the user do the job ;)
    if (target && target.findParentByClassName("edit_block_node")) {
      return;
    }

    let show_edit_rect = true;
    if (!hovered_block_content) {
      show_edit_rect = false;
    }

    if (hovered_block_content) {
      if (this.target === hovered_block) {
        show_edit_rect = false;
      }

      if (this.newCms.inline_edited_block === hovered_block) {
        show_edit_rect = false;
      }
    }

    this.target = hovered_block;
    this.target_content = hovered_block_content;

    $$(".edit_options_visible").forEach((e) => {
      e.classList.remove("edit_options_visible");
    });

    if (show_edit_rect) {
      // everything below happens just once when the rect is shown

      // won't be lost when we the focus is lost, NEVER USED SO FAR
      this.last_target = hovered_block;

      this.target.classList.add("edit_options_visible");

      // define block buttons html
      let edit_block_html = "";

      edit_block_html += /*html*/ `
          <button class="btn edit_block_btn">
            <i class="fas fa-pencil-alt"></i>
          </button>
        `;
      edit_block_html += /*html*/ `
          <button class="btn relocate_btn">
            <i class="fas fa-arrows-alt"></i>
          </button>
        `;
      edit_block_html += /*html*/ `
          <button class="btn remove_btn">
            <i class="fas fa-times"></i>
          </button>
        `;
      this.node.setContent(edit_block_html);

      // add block actions
      const edit_block_btn = this.node.find(".edit_block_btn");
      if (
        edit_block_btn &&
        this.target.classList.contains("newCms_quill_editor")
      ) {
        edit_block_btn.addEventListener("click", () => {
          this.newCms.inline_quill_editor.appendInlineQuillEditor(
            this.newCms.edit_block.target
          );
        });
      }

      const relocate_btn = this.node.find(".relocate_btn");
      if (relocate_btn) {
        relocate_btn.addEventListener(
          IS_MOBILE ? "touchstart" : "mousedown",
          () => {
            this.newCms.grabBlock(this.target);
          }
        );
      }

      const remove_btn = this.node.find(".remove_btn");
      if (remove_btn) {
        remove_btn.addEventListener("click", () => {
          this.newCms.removeBlock(this.target);
          this.hide();
        });
      }

      const target_content_rect = this.target_content.getBoundingClientRect();

      const scrollable_parent = this.target.findScrollableParent();
      const scrollable_parent_rect = scrollable_parent.getBoundingClientRect();

      // could we set it once? along with icons and so on
      this.node.style.left =
        target_content_rect.left -
        scrollable_parent_rect.left +
        scrollable_parent.scrollLeft +
        "px";

      this.node.style.top =
        target_content_rect.top -
        scrollable_parent_rect.top +
        scrollable_parent.scrollTop +
        "px";

      this.node.style.width = target_content_rect.width + "px";
      this.node.style.height = target_content_rect.height + "px";
    }

    this.node.classList.toggle("active", show_edit_rect);
  }
}

class NewCms {
  constructor(container) {
    this.container = $(container);
    this.content_node = this.container.find(`.newCmsContent`);
    this.content_scroll_panel = this.container.find(
      `.newCmsContent_scroll_panel`
    );

    this.inline_edited_block = null;

    this.initEditBlockRect();
    this.initAddBlockModal();
    this.initQuillEditor();
    this.initListenChange();

    this.mouse_x = 0;
    this.mouse_y = 0;
    this.mouse_dx = 0;
    this.mouse_dy = 0;
    this.scroll_top = 0;

    setFormData(
      {
        edit_mode: 1,
      },
      container
    );

    this.container.addEventListener(
      IS_MOBILE ? "touchstart" : "mousemove",
      (event) => {
        this.mouseMove(event);
      }
    );
    this.container.addEventListener(
      IS_MOBILE ? "click" : "mousedown",
      (event) => {
        this.mouseDown(event);
      }
    );

    this.container.addEventListener(
      IS_MOBILE ? "touchend" : "mouseup",
      (event) => {
        this.mouseUp(event);
      }
    );

    this.content_scroll_panel.addEventListener("scroll", (event) => {
      this.scroll(event);
    });
  }

  initListenChange() {
    this.content_node.addEventListener("change", () => {
      if (this.content_change_triggered) {
        this.contentChange({
          trigger_change: false,
        });
      }
    });
  }

  getCleanOutput(html) {
    var playground = $(document.createElement("DIV"));
    // TODO: is it even necessary?
    //document.body.appendChild(playground);
    playground.insertAdjacentHTML("afterbegin", html);

    playground.findAll(".newCms_add_block_wrapper").forEach((e) => {
      e.remove();
    });

    playground.findAll(".newCms_container_header").forEach((e) => {
      e.remove();
    });

    return playground.innerHTML;
  }

  initEditBlockRect() {
    this.edit_block = new EditBlockRect(
      this.container.find(`.edit_block_node`),
      this
    );
  }

  initQuillEditor() {
    this.inline_quill_editor = new InlineQuillEditor(
      this,
      this.container.find(".quill_editor"),
      this.container.find(".quill_editor_wrapper"),
      this.container.find(".newCmsContent_scroll_panel")
    );
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

    this.edit_block.init();

    setFormData(
      {
        content: this.getCleanOutput(this.targetNode.innerHTML),
      },
      this.container
    );
    this.contentChange();

    setFormInitialState(this.container);

    showModal("newCms", {
      source: this.targetNode,
      lock_during_animation: true,
    });
  }

  save() {
    // remove all unnecessary nodes and so on, keep it as a single function, copy all nodes and remove what u want
    this.targetNode.setValue(
      this.getCleanOutput(getFormData(this.container).content)
    );
  }

  mouseMove(event) {
    const content_scroll_panel_rect = this.content_scroll_panel.getBoundingClientRect();
    const mouse_x = event.clientX - content_scroll_panel_rect.left;
    const mouse_y = event.clientY - content_scroll_panel_rect.top;
    this.mouse_dx = mouse_x - this.mouse_x;
    this.mouse_dy = mouse_y - this.mouse_y;
    this.mouse_x = mouse_x;
    this.mouse_y = mouse_y;

    if (this.grabbed_block) {
      this.grabbedBlockPositionChange();
      return;
    }

    this.edit_block.mouseMove(event);
  }

  mouseDown(event) {
    const target = $(event.target);

    // TODO: remove
    const newCms_add_block_btn = target.findParentByClassName(
      "newCms_add_block_btn"
    );
    if (newCms_add_block_btn) {
      this.insertBlockModal(newCms_add_block_btn.parent());
    }
  }

  mouseUp(event) {
    if (this.grabbed_block) {
      this.releaseBlock($(event.target));
    }
  }

  scroll(event) {
    this.scroll_top = this.content_scroll_panel.scrollTop;
    if (this.grabbed_block) {
      this.grabbedBlockPositionChange();
      return;
    }
  }

  grabbedBlockPositionChange() {
    const dx = this.mouse_x - this.grabbed_mouse_x;
    const dy =
      this.mouse_y -
      this.grabbed_mouse_y +
      this.scroll_top -
      this.grabbed_scroll_top;

    this.grabbed_block.style.transform = `
    translate(
      ${dx.toPrecision(5)}px,
      ${dy.toPrecision(5)}px
    )
  `;
  }

  contentChange(options = {}) {
    this.content_change_triggered = true;

    this.insertMissingAddBlockButtons();
    this.insertMissingContainerHeaders();
    this.insertMissingQlClasses();

    this.removeUnnecessaryAddBlockButtons();
    this.removeUnnecessaryContainerHeaders();

    if (nonull(options.trigger_change, true) === true) {
      this.content_node.setValue();
    }
    this.content_change_triggered = false;
  }

  insertMissingQlClasses() {
    this.content_node
      .findAll(".newCms_quill_editor")
      .forEach((newCms_block) => {
        const newCms_block_content = newCms_block.find(".newCms_block_content");
        newCms_block_content.classList.add("ql-editor");
        newCms_block_content.parent().classList.add("ql-snow");
      });
  }

  insertMissingContainerHeaders() {
    this.content_node.findAll(".newCms_container").forEach((container) => {
      if (!container.find(".newCms_container_header")) {
        container.insertAdjacentHTML(
          "afterbegin",
          /*html*/ `
            <div class="newCms_container_header">
              <i class="fas fa-border-all"></i>
            </div>
          `
        );
      }
    });
  }

  insertMissingAddBlockButtons() {
    // consider empty containers
    [
      this.content_node,
      ...this.content_node.findAll(".newCms_container"),
    ].forEach((con) => {
      // can be anything inside ;)
      var has_add_block_btn = !!con.find(".newCms_add_block_wrapper");
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
    this.content_node.findAll(".newCms_block").forEach((con) => {
      if (
        !con.next() ||
        !con.next().classList.contains("newCms_add_block_wrapper")
      ) {
        this.insertAddBlockButton(con, "afterend");
      }
      if (
        !con.prev() ||
        !con.prev().classList.contains("newCms_add_block_wrapper")
      ) {
        this.insertAddBlockButton(con, "beforebegin");
      }
    });
  }

  removeUnnecessaryAddBlockButtons() {
    // two add blocks next to each other? get outta here
    this.content_node.findAll(".newCms_add_block_wrapper").forEach((btn) => {
      const prev = btn.prev();
      if (prev && prev.classList.contains("newCms_add_block_wrapper")) {
        btn.remove();
      }
    });
  }

  removeUnnecessaryContainerHeaders() {
    // TODO: todo
    // newCms_container_header
  }

  insertAddBlockButton(target, position) {
    target.insertAdjacentHTML(
      position,
      /*html*/ `
        <div class="newCms_add_block_wrapper">
          <button class="btn newCms_add_block_btn">
            <i class="fas fa-plus"></i>
          </button>
        </div>
      `
    );
  }

  insertBlockModal(button) {
    showModal("newCmsBlocks", { source: button });
    this.insert_block_button = button;
  }

  insertBlock(target, position, type, options) {
    let content = "";
    let class_name = "";
    let class_name_content = "";

    if (type === "quill_editor") {
      class_name_content = "ql-editor";
    }

    target.insertAdjacentHTML(
      position,
      /*html*/ `
        <div class="newCms_block newCms_${type} ${class_name}">
            <div class="newCms_block_content newCms_${type}_content ${class_name_content}">${content}</div>
        </div>
      `
    );

    this.contentChange();
  }

  removeBlock(block) {
    block.remove();
    this.contentChange();
  }

  grabBlock(block) {
    this.grabbed_block = block;
    this.grabbed_block.classList.add("grabbed");
    this.grabbed_mouse_x = this.mouse_x;
    this.grabbed_mouse_y = this.mouse_y;
    this.grabbed_scroll_top = this.scroll_top;

    this.content_scroll_panel.classList.add("grabbed_block");

    this.edit_block.hideButtons();

    this.grabAnimation();
  }

  releaseBlock(target_node) {
    const grabbed_block_ref = this.grabbed_block;
    const newCms_add_block_wrapper = target_node.findParentByClassName(
      "newCms_add_block_wrapper"
    );
    if (newCms_add_block_wrapper) {
      newCms_add_block_wrapper
        .parent()
        .insertBefore(this.grabbed_block, newCms_add_block_wrapper);
    }

    this.grabbed_block.style.transform = "";
    this.grabbed_block.classList.remove("grabbed");

    this.grabbed_block = null;

    this.content_scroll_panel.classList.remove("grabbed_block");

    this.contentChange();

    removeUserSelection();

    this.edit_block.showButtons();

    /*setTimeout(() => {
      scrollIntoView(grabbed_block_ref, { margin: 0.05 });
    }, 200);*/
  }

  grabAnimation() {
    let speed_y = 0;

    const scroll_offset = 50;
    if (this.mouse_y < scroll_offset) {
      speed_y = this.mouse_y - scroll_offset;
      if (speed_y < -scroll_offset) {
        speed_y = -scroll_offset;
      }
    }

    if (this.content_scroll_panel.clientHeight - this.mouse_y < scroll_offset) {
      speed_y =
        scroll_offset - this.content_scroll_panel.clientHeight + this.mouse_y;

      if (speed_y > scroll_offset) {
        speed_y = scroll_offset;
      }
    }

    this.content_scroll_panel.scrollBy(0, speed_y * 0.4);

    if (this.grabbed_block) {
      requestAnimationFrame(() => {
        this.grabAnimation();
      });
    }
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

                Tryb edycji <checkbox name="edit_mode" data-ignore-history class="no-wrap" onchange="toggleNewCmsEditMode(this)"></checkbox>
                <div class="history-buttons"></div>
                <button class="btn primary" onclick="window.pasteType='container';showModal('pasteBlock')" data-tooltip="Wklej skopiowany kontener / blok"><i class="fas fa-paste"></i></button>
                <button class="btn primary" onclick="copyCMS()" data-tooltip="Skopiuj całą zawartość do schowka"> <i class="fas fa-clipboard"></i> </button>
                <button class="btn secondary" onclick="hideParentModal(this)">Anuluj <i class="fa fa-times"></i></button>
                <button onclick="showCmsPreview()" class="btn primary preview_btn">Podgląd <i class="fas fa-eye"></i></button>
                <button class="btn primary" onclick="newCms.save();hideParentModal(this);">Zapisz <i class="fa fa-save"></i></button>
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

                <div style="width:100%;overflow:hidden">
                  <div class="scroll-panel scroll-shadow newCmsContent_scroll_panel" style="padding:10px;height: 100%;">
                    <div class="edit_block_node"></div>
                    <div class="quill_editor_wrapper">
                      <div class="quill_editor"></div>
                    </div>
                    <div class="newCmsContent newCms_container_content" data-type="html" name="content"></div>
                  </div>
                </div>
            </div>
        </div>
        <link href="/admin/tools/newCms.css?v=${CSS_RELEASE}" rel="stylesheet">
    </div>
  `,
  (modal) => {
    window.newCms = new NewCms(modal);
  }
);
