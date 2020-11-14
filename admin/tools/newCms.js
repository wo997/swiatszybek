// dependencies
useTool("quillEditor");

class FloatingRearrangeControls {
  constructor(newCms) {
    this.newCms = newCms;
    this.node = newCms.container.find(`.rearrange_controls`);
    this.rearrange_insert_rect_node = newCms.container.find(
      `.rearrange_insert_rect`
    );
    this.rearrange_grabbed_rect_node = newCms.container.find(
      `.rearrange_grabbed_rect`
    );
    this.init();
  }

  init() {
    this.rearranged_block = null;
    this.rearranged_position = "";
    this.removeRearrangement();
    this.node.classList.remove("visible");
    this.rearrange_insert_rect_node.classList.remove("visible");
    this.rearrange_grabbed_rect_node.classList.remove("visible");
  }

  removeRearrangement(options = {}) {
    this.newCms.container.findAll(".rearrange_active").forEach((e) => {
      if (options.except && options.except.indexOf(e) !== -1) {
        return;
      }
      e.classList.remove("rearrange_active");
    });

    this.newCms.content_node.classList.remove("rearrange_possible");
  }

  mouseMove(event) {
    const target = $(event.target);

    let rearranged_block = null;

    if (!target.findParentNode(this.rearrange_grabbed_rect_node)) {
      const rearrange_control = target
        ? target.findParentByClassName("rearrange_control")
        : null;

      if (rearrange_control) {
        rearranged_block = rearrange_control.rearrange_block;
      }

      if (!rearranged_block) {
        rearranged_block = target
          ? target.findParentByClassName("newCms_block")
          : null;
      }
    }

    let rearranged_position = "before";

    let rearranged_control_node = null;
    let parent_container = null;
    let is_parent_row = false;
    let is_before = true;
    let rearrange_block_rect = null;

    if (rearranged_block) {
      parent_container = rearranged_block.findParentByClassName(
        "newCms_container",
        { skip: 1 }
      );

      if (!parent_container) {
        parent_container = this.newCms.content_node;
      }

      is_parent_row = parent_container
        ? parent_container.classList.contains("container_row")
        : false;

      rearrange_block_rect = rearranged_block.getBoundingClientRect();
      if (is_parent_row) {
        is_before =
          event.clientX <
          rearrange_block_rect.left + rearrange_block_rect.width * 0.5;
      } else {
        is_before =
          event.clientY <
          rearrange_block_rect.top + rearrange_block_rect.height * 0.5;
      }

      rearranged_position = is_before ? "before" : "after";

      if (this.rearranged_position == "before") {
        if (rearranged_block.rearrange_control_before) {
          rearranged_control_node = rearranged_block.rearrange_control_before;
        } else {
          var prev_block = rearranged_block.prev();

          if (prev_block && prev_block.rearrange_control_after) {
            rearranged_control_node = prev_block.rearrange_control_after;
          }
        }
      } else if (rearranged_block.rearrange_control_after) {
        rearranged_control_node = rearranged_block.rearrange_control_after;
      }
    }

    if (
      this.rearranged_block != rearranged_block ||
      this.rearranged_position != rearranged_position
    ) {
      this.rearranged_block = rearranged_block;
      this.rearranged_position = rearranged_position;
      this.rearranged_control_node = rearranged_control_node;
    }

    this.removeRearrangement({ except: [rearranged_control_node] });

    if (rearranged_control_node) {
      if (!rearranged_control_node.classList.contains("rearrange_active")) {
        const min_size = 20;

        let width = min_size;
        let height = min_size;

        const rearranged_block_rect_data = positionAgainstScrollableParent(
          rearranged_block
        );
        if (is_parent_row) {
          height = rearranged_block_rect_data.node_rect.height;
        } else {
          width = rearranged_block_rect_data.node_rect.width;
        }

        let x = rearranged_block_rect_data.relative_pos.left;
        let y = rearranged_block_rect_data.relative_pos.top;
        if (!is_before) {
          if (is_parent_row) {
            x += rearranged_block_rect_data.node_rect.width;
          } else {
            y += rearranged_block_rect_data.node_rect.height;
          }
        }

        if (is_parent_row) {
          x -= min_size * 0.5;
        } else {
          y -= min_size * 0.5;
        }

        if (rearranged_control_node.classList.contains("insert_end")) {
          if (is_parent_row) {
            x += min_size * (is_before ? 0.5 : -0.5);
          } else {
            y += min_size * (is_before ? 0.5 : -0.5);
          }
        }
        /*classList.push("insert_between");
        classList.push("insert_end");
        classList.push("insert_empty");*/

        this.rearrange_insert_rect_node.style.left = x + "px";
        this.rearrange_insert_rect_node.style.top = y + "px";
        this.rearrange_insert_rect_node.style.width = width + "px";
        this.rearrange_insert_rect_node.style.height = height + "px";
      }
      rearranged_control_node.classList.add("rearrange_active");

      if (parent_container) {
        parent_container.classList.add("rearrange_active");
      }
    }

    this.rearrange_insert_rect_node.classList.toggle(
      "visible",
      !!rearranged_control_node
    );

    this.newCms.container.classList.toggle(
      "rearrange_possible",
      !!rearranged_control_node
    );
  }

  mouseDown(event) {
    if (this.rearranged_block && this.newCms.grabbed_block) {
      this.newCms.releaseBlock();
    }
  }

  addFloatingRearrangeControls(block) {
    // just a rect u grab from
    const block_rect_data = positionAgainstScrollableParent(block);
    const rearrange_grabbed_rect_node = this.rearrange_grabbed_rect_node;
    rearrange_grabbed_rect_node.style.left =
      block_rect_data.relative_pos.left + "px";
    rearrange_grabbed_rect_node.style.top =
      block_rect_data.relative_pos.top + "px";
    rearrange_grabbed_rect_node.style.width =
      block_rect_data.node_rect.width + "px";
    rearrange_grabbed_rect_node.style.height =
      block_rect_data.node_rect.height + "px";
    rearrange_grabbed_rect_node.classList.add("visible");

    // them floating controls
    const rearrange_control_width =
      parseInt(
        getComputedStyle(document.documentElement).getPropertyValue(
          "--rearrange_control_width"
        )
      ) - 1;
    const rearrange_control_height =
      parseInt(
        getComputedStyle(document.documentElement).getPropertyValue(
          "--rearrange_control_height"
        )
      ) - 1;

    let blocks_data = [];
    const addControls = (position) => {
      this.newCms.container.findAll(".newCms_block").forEach((block) => {
        if (block.findParentByClassName("select_active")) {
          // we don't wanna rearrange to it's own child or itself, no incest or masturbation allowed here!
          return;
        }

        const parent_container = block.findParentByClassName(
          "newCms_container",
          { skip: 1 }
        );

        if (
          position === "after" &&
          this.newCms.grabbed_block &&
          block.next() == this.newCms.grabbed_block
        ) {
          return;
        }

        const is_parent_row = parent_container
          ? parent_container.classList.contains("container_row")
          : false;

        const block_rect_data = positionAgainstScrollableParent(block);

        const prev_node = block.prev();

        if (
          position === "before" &&
          prev_node &&
          prev_node.classList.contains("newCms_block")
        ) {
          // no kissing ugh
          if (is_parent_row) {
            if (
              prev_node.getBoundingClientRect().left <=
              block_rect_data.node_rect.left
            ) {
              // row wrap case not spotted, skip :)
              return;
            }
          } else {
            // no need to put stuff on top
            return;
          }
        }

        let parent_count = 0;
        let parent = block;
        while (parent != this.content_node) {
          parent_count++;
          parent = parent.parent();
        }

        if (is_parent_row) {
          block_rect_data.relative_pos.left -= rearrange_control_width * 0.5;
          block_rect_data.relative_pos.top +=
            (block_rect_data.node_rect.height - rearrange_control_height) * 0.5;

          if (position === "after") {
            block_rect_data.relative_pos.left +=
              block_rect_data.node_rect.width;
          }
        } else {
          block_rect_data.relative_pos.left +=
            (block_rect_data.node_rect.width - rearrange_control_width) * 0.5;
          block_rect_data.relative_pos.top -= rearrange_control_width * 0.5;

          if (position === "after") {
            block_rect_data.relative_pos.top +=
              block_rect_data.node_rect.height;
          }
        }

        const index = block_rect_data.relative_pos.top + parent_count;
        blocks_data.push({
          index: index,
          block: block,
          rect_data: block_rect_data,
          is_parent_row: is_parent_row,
          position: position,
        });
      });
    };

    this.node.empty();

    this.newCms.container.findAll(".newCms_block").forEach((block) => {
      block.rearrange_control_before = null;
      block.rearrange_control_after = null;
    });

    addControls("before");
    addControls("after");

    const sorted_blocks_data = blocks_data.sort((a, b) => {
      return Math.sign(a.index - b.index);
    });

    const sorted_blocks_data_length = sorted_blocks_data.length;
    let upper_bound = 0;

    for (let i = 0; i < sorted_blocks_data_length; i++) {
      const block_data = sorted_blocks_data[i];
      const block = block_data.block;

      let left = block_data.rect_data.relative_pos.left;
      let top = block_data.rect_data.relative_pos.top;

      let moving = true;
      while (moving) {
        moving = false;
        for (let u = i - 1; u >= upper_bound; u--) {
          const prev_block_data = sorted_blocks_data[u];

          const prev_y2 =
            prev_block_data.rect_data.relative_pos.top +
            rearrange_control_height;

          if (top >= prev_y2) {
            // optimization
            upper_bound = u + 1;
            break;
          }

          if (
            prev_block_data.rect_data.relative_pos.left <
              left + rearrange_control_width &&
            prev_block_data.rect_data.relative_pos.left +
              rearrange_control_width >
              left
          ) {
            if (block_data.position === "after") {
              // go left
              left =
                prev_block_data.rect_data.relative_pos.left -
                rearrange_control_width;
            } else {
              // go right
              left =
                prev_block_data.rect_data.relative_pos.left +
                rearrange_control_width;
            }
            moving = true;
          }
        }
      }

      block_data.rect_data.relative_pos.left = left;
      block_data.rect_data.relative_pos.top = top;

      const rearrange_control = document.createElement("DIV");
      rearrange_control.style.left = left + "px";
      rearrange_control.style.top = top + "px";

      const has_prev = block_data.position == "after" ? true : !!block.prev();
      const has_next = block_data.position == "before" ? true : !!block.next();

      let rearrange_control_html = "";

      let rotation = 0;
      if (block_data.is_parent_row) {
        rotation += 90;
      }

      let classList = [];
      if (has_next && has_prev) {
        rearrange_control_html = `<img style='width:1em' src="/src/img/arrows_insert_between.svg">`;
        classList.push("insert_between");
      } else if (has_prev || has_next) {
        rearrange_control_html = `<img style='width:1em' src="/src/img/arrows_insert_after.svg">`;
        if (has_next) {
          rotation += 180;
        }
        classList.push("insert_end");
      } else {
        rearrange_control_html = `<img style='width:0.7em' src="/src/img/insert_plus.svg">`;
        classList.push("insert_empty");
      }

      rearrange_control.innerHTML = rearrange_control_html;

      classList.push("rearrange_control");

      rearrange_control.classList.add(...classList);

      rearrange_control.style.transform = `rotate(${rotation}deg)`;

      block[`rearrange_control_${block_data.position}`] = rearrange_control;
      rearrange_control.rearrange_block = block;

      this.node.appendChild(rearrange_control);
    }
  }
}

class FloatingSelectControls {
  constructor(newCms) {
    this.newCms = newCms;
    this.node = newCms.container.find(`.select_controls`);
    this.init();
  }

  init() {
    this.selected_block = null;
    this.removeSelection();
    this.node.classList.add("visible");
  }

  removeSelection() {
    this.newCms.container.findAll(".select_active").forEach((e) => {
      e.classList.remove("select_active");
    });
  }

  mouseMove(event) {
    const target = $(event.target);

    let hovered_block = null;

    const select_control = target
      ? target.findParentByClassName("select_control")
      : null;

    if (select_control) {
      hovered_block = select_control.select_block;
    }

    if (!hovered_block) {
      hovered_block = target
        ? target.findParentByClassName("newCms_block")
        : null;
    }

    if (this.selected_block != hovered_block) {
      this.selected_block = hovered_block;

      this.removeSelection();

      const selected_block = this.selected_block;

      if (selected_block) {
        selected_block.classList.add("select_active");
        selected_block.select_control.classList.add("select_active");
      }
    }
  }

  mouseDown(event) {
    if (
      event.buttons === 1 &&
      this.selected_block &&
      !this.newCms.grabbed_block
    ) {
      this.newCms.grabBlock(this.selected_block);
    }
  }

  addFloatingSelectControls() {
    let blocks_data = [];
    this.newCms.container.findAll(".newCms_block").forEach((block) => {
      const block_rect_data = positionAgainstScrollableParent(block);

      let parent_count = 0;
      let parent = block;
      while (parent != this.content_node) {
        parent_count++;
        parent = parent.parent();
      }

      const index = block_rect_data.relative_pos.top + parent_count;
      blocks_data.push({
        index: index,
        block: block,
        rect_data: block_rect_data,
      });
    });
    const sorted_blocks_data = blocks_data.sort((a, b) => {
      return Math.sign(a.index - b.index);
    });

    const select_control_width =
      parseInt(
        getComputedStyle(document.documentElement).getPropertyValue(
          "--select_control_width"
        )
      ) - 1;
    const select_control_height =
      parseInt(
        getComputedStyle(document.documentElement).getPropertyValue(
          "--select_control_height"
        )
      ) - 1;

    const sorted_blocks_data_length = sorted_blocks_data.length;
    let upper_bound = 0;

    this.node.empty();

    for (let i = 0; i < sorted_blocks_data_length; i++) {
      const block_data = sorted_blocks_data[i];
      const block = block_data.block;

      let left = block_data.rect_data.relative_pos.left;
      let top = block_data.rect_data.relative_pos.top;

      let moving = true;
      while (moving) {
        moving = false;
        for (let u = i - 1; u >= upper_bound; u--) {
          const prev_block_data = sorted_blocks_data[u];

          const prev_y2 =
            prev_block_data.rect_data.relative_pos.top + select_control_height;

          if (top >= prev_y2) {
            // optimization
            upper_bound = u + 1;
            break;
          }

          if (
            prev_block_data.rect_data.relative_pos.left <
              left + select_control_width &&
            prev_block_data.rect_data.relative_pos.left + select_control_width >
              left
          ) {
            left =
              prev_block_data.rect_data.relative_pos.left +
              select_control_width;
            moving = true;
          }
        }
      }

      block_data.rect_data.relative_pos.left = left;
      block_data.rect_data.relative_pos.top = top;

      const select_control = document.createElement("DIV");
      select_control.classList.add("select_control");
      select_control.style.left = left + "px";
      select_control.style.top = top + "px";

      let select_control_html = "";
      if (block.classList.contains("newCms_container")) {
        select_control_html = `<i class="fas fa-columns"></i>`;
      } else {
        select_control_html = `<i class="far fa-square"></i>`;
      }
      select_control.innerHTML = select_control_html;

      block.select_control = select_control;
      select_control.select_block = block;

      this.node.appendChild(select_control);
    }

    this.node.classList.add("visible");
  }
}

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

    //this.newCms.edit_block.hide();

    block.classList.add("during_inline_edit");
  }

  saveInlineQuillEditor(block) {
    const newCms_block_content = block.find(".newCms_block_content");

    this.newCms.inline_edited_block = null;

    const ql_html = this.content_node.innerHTML;
    newCms_block_content.setContent(ql_html);

    this.newCms.content_scroll_panel.appendChild(this.wrapper);
    this.wrapper.classList.remove("visible");

    //this.newCms.edit_block.hide();

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

class NewCms {
  constructor(container) {
    this.container = $(container);
    this.content_node = this.container.find(`.newCmsContent`);
    this.content_scroll_panel = this.container.find(
      `.newCmsContent_scroll_panel`
    );

    this.inline_edited_block = null;

    //this.initEditBlockRect();
    this.initAddBlockModal();
    this.initQuillEditor();
    this.initFloatingSelectControls();
    this.initFloatingRearrangeControls();
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
    // TODO: use as a formatter? so the history doesnt have those classes inside and so on, tricky but might be worth it :*
    var playground = $(document.createElement("DIV"));
    // TODO: is it even necessary?
    //document.body.appendChild(playground);
    playground.insertAdjacentHTML("afterbegin", html);

    return playground.innerHTML;
  }

  /*initEditBlockRect() {
    this.edit_block = new EditBlockRect(
      this.container.find(`.edit_block_node`),
      this
    );
  }*/

  initQuillEditor() {
    this.inline_quill_editor = new InlineQuillEditor(
      this,
      this.container.find(".quill_editor"),
      this.container.find(".quill_editor_wrapper"),
      this.container.find(".newCmsContent_scroll_panel")
    );
  }

  initFloatingSelectControls() {
    this.select_controls = new FloatingSelectControls(this);
  }

  initFloatingRearrangeControls() {
    this.rearrange_controls = new FloatingRearrangeControls(this);
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

    //this.edit_block.init();
    this.rearrange_controls.init();
    this.select_controls.init();

    setFormData(
      {
        content: this.getCleanOutput(this.targetNode.innerHTML),
      },
      this.container
    );
    this.contentChange();

    setFormInitialState(this.container);

    this.lockInput();

    showModal("newCms", {
      source: this.targetNode,
      lock_during_animation: true,
      callback: () => {
        this.contentChange();
        this.unlockInput();
      },
    });
  }

  save() {
    this.targetNode.setValue(
      this.getCleanOutput(getFormData(this.container).content)
    );
  }

  lockInput(delay) {
    this.container.classList.add("locked_input");

    if (this.lock_timeout) {
      clearTimeout(this.lock_timeout);
    }

    if (delay) {
      this.lock_timeout = setTimeout(() => {
        this.unlockInput();
      }, delay);
    }
  }

  unlockInput() {
    this.container.classList.remove("locked_input");
    this.select_controls.addFloatingSelectControls();
  }

  mouseMove(event) {
    //positionAgainstScrollableParent() such a pitty I cant use it cause mouse aint a node
    const content_scroll_panel_rect = this.content_scroll_panel.getBoundingClientRect();
    const mouse_x = event.clientX - content_scroll_panel_rect.left;
    const mouse_y = event.clientY - content_scroll_panel_rect.top;
    this.mouse_dx = mouse_x - this.mouse_x;
    this.mouse_dy = mouse_y - this.mouse_y;
    this.mouse_x = mouse_x;
    this.mouse_y = mouse_y;

    if (this.grabbed_block) {
      this.grabbedBlockPositionChange();
      this.rearrange_controls.mouseMove(event);
      return;
    }

    //this.edit_block.mouseMove(event);
    this.select_controls.mouseMove(event);
  }

  mouseDown(event) {
    this.select_controls.mouseDown(event);
    //const target = $(event.target);

    // TODO: remove
    /*const newCms_add_block_btn = target.findParentByClassName(
      "newCms_add_block_btn"
    );
    if (newCms_add_block_btn) {
      this.insertBlockModal(newCms_add_block_btn.parent());
    }*/
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

    const grabbed_block = this.grabbed_block;

    grabbed_block.style.transform = `
      translate(
        ${dx.toPrecision(5)}px,
        ${dy.toPrecision(5)}px
      )
    `;
  }

  contentChange(options = {}) {
    this.content_change_triggered = true;
    this.insertMissingQlClasses();

    this.select_controls.addFloatingSelectControls();

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
    zoomNode(block, "out", {
      duration: 500,
      callback: () => {
        node.remove();
        this.contentChange();
      },
    });
  }

  grabBlock(block) {
    this.grabbed_block = $(block);
    this.grabbed_block.classList.add("grabbed");
    this.grabbed_mouse_x = this.mouse_x;
    this.grabbed_mouse_y = this.mouse_y;
    this.grabbed_scroll_top = this.scroll_top;

    this.container.classList.add("grabbed_block");

    this.rearrange_controls.node.classList.add("visible");
    this.select_controls.node.classList.remove("visible");

    this.rearrange_controls.addFloatingRearrangeControls(this.grabbed_block);

    //this.edit_block.hideButtons();

    this.grabAnimation();
  }

  releaseBlock() {
    const grabbed_block = this.grabbed_block;

    this.grabbed_block.style.transform = "";
    grabbed_block.classList.remove("grabbed");
    this.container.classList.remove("grabbed_block");

    this.grabbed_block = null;

    const end = () => {
      // not needed cause we set it to user-select none bro
      removeUserSelection();
      grabbed_block.classList.remove("grabbed");
      this.container.classList.remove("grabbed_block");

      this.rearrange_controls.removeRearrangement();
      this.select_controls.node.classList.add("visible");

      this.contentChange();
    };

    this.rearrange_controls.node.classList.remove("visible");
    this.rearrange_controls.rearrange_grabbed_rect_node.classList.remove(
      "visible"
    );

    //this.edit_block.showButtons();

    if (this.rearrange_controls.rearranged_block) {
      let before_node = this.rearrange_controls.rearranged_block;
      if (this.rearrange_controls.rearranged_position == "after") {
        before_node = before_node.next();
      }

      const duration = 350;

      this.content_node.findAll(".newCms_block").forEach((block) => {
        const block_rect = block.getBoundingClientRect();
        block.last_rect = block_rect;
      });

      this.rearrange_controls.rearranged_block
        .parent()
        .insertBefore(grabbed_block, before_node);

      this.content_node.findAll(".newCms_block").forEach((block) => {
        const block_rect = block.getBoundingClientRect();
        block.new_rect = block_rect;

        block.animation_data = { x: 0, y: 0 };
      });

      this.content_node.findAll(".newCms_block").forEach((block) => {
        const dx = block.last_rect.left - block.new_rect.left;
        const dy = block.last_rect.top - block.new_rect.top;

        block.animation_data.x += dx;
        block.animation_data.y += dy;

        block
          .find(".newCms_block_content")
          .directChildren()
          .forEach((sub_block) => {
            if (sub_block.animation_data) {
              sub_block.animation_data.x -= dx;
              sub_block.animation_data.y -= dy;
            }
          });
      });

      this.content_node.findAll(".newCms_block").forEach((block) => {
        const dx = block.animation_data.x;
        const dy = block.animation_data.y;

        const styles = {};
        Object.assign(styles, window.getComputedStyle(block));

        /*let mx = block.new_rect.width - block.last_rect.width;
        let my = block.new_rect.height - block.last_rect.height;*/

        let mx = 0; //0.5 * (block.new_rect.width - block.last_rect.width);
        let my = 0; //0.5 * (block.new_rect.height - block.last_rect.height);

        let parent_container = block.findParentByClassName("newCms_container", {
          skip: 1,
        });

        if (!parent_container) {
          parent_container = this.content_node;
        }

        const is_parent_row = parent_container
          ? parent_container.classList.contains("container_row")
          : false;

        if (is_parent_row) {
          //mx = block.new_rect.width - block.last_rect.width;
          mx = 0.5 * (block.new_rect.width - block.last_rect.width);
        }

        block.style.flexGrow = 0;

        animate(
          block,
          `
              0% {
                transform: translate(
                  ${dx}px,
                  ${dy}px
                );
                width: ${block.last_rect.width}px;
                height: ${block.last_rect.height}px;
                margin: ${my}px ${mx}px;
              }
              100% {
                transform: translate(
                  0px,
                  0px
                );
                width: ${block.new_rect.width}px;
                height: ${block.new_rect.height}px;
                margin: 0px 0px;
              }
            `,
          duration,
          () => {
            block.style.flexGrow = styles.flexGrow;

            setTimeout(() => {
              end();
            }, 50);
          }
        );
      });

      this.lockInput(duration);
    } else {
      end();
    }
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

// TODO: move to animator?
function zoomNode(node, direction, options = {}) {
  const styles = window.getComputedStyle(node);

  const w = parseInt(styles.width);
  const h = parseInt(styles.height);

  const mr_l = parseInt(styles.marginLeft);
  const mr_r = parseInt(styles.marginRight);

  const mr_t = parseInt(styles.marginTop);
  const mr_b = parseInt(styles.marginBottom);

  const step_in = `
    transform: scale(1,1);
    margin: ${mr_t}px ${mr_r}px ${mr_b}px ${mr_l}px;
   `;
  const step_out = `
    transform: scale(0,0);
    margin: ${-h * 0.5}px ${-w * 0.5}px;
  `;

  let keyframes = "";

  if (direction == "out") {
    keyframes = `0% {${step_in}opacity: 1;} 100% {${step_out}opacity: 0;}`;
  } else {
    keyframes = `0% {${step_out}opacity: 0;} 100% {${step_in}opacity: 1;}`;
  }

  animate(node, keyframes, nonull(options.duration, 200), () => {
    if (options.callback) {
      options.callback();
    }
  });
}

registerModalContent(
  /*html*/ `
    <div id="newCms" class="newCms" data-expand="large" data-form data-history>
        <div class="modal-body">
            <div class="custom-toolbar">
                <span class="title">
                    Edycja zawartości    
                </span>

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

                <div style="width:100%;overflow:hidden;">
                  <div class="scroll-panel scroll-shadow newCmsContent_scroll_panel">
                    <div style="position:relative;height: 100%;padding:15px">
                      <!--<div class="edit_block_node"></div>-->
                      <div class="select_controls"></div>
                      <div class="rearrange_controls"></div>
                      <div class="rearrange_insert_rect"></div>
                      <div class="rearrange_grabbed_rect"></div>
                      <div class="quill_editor_wrapper">
                        <div class="quill_editor"></div>
                      </div>
                      <div class="newCmsContent newCms_container_content" data-type="html" name="content"></div>
                    </div>
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
