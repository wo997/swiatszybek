// dependencies
useTool("quillEditor");

class EditBlockRect {
  constructor(edit_block_node, newCms) {
    this.node = edit_block_node;
    this.newCms = newCms;
    this.init();
  }

  init() {
    this.target = null;
    this.node.classList.toggle("visible", false);
  }

  mouseMove() {
    const target = this.newCms.mouse_target;

    if (this.target) {
      if (!target.findParentByClassName("edit_block_node")) {
        this.init();
      }
    }
  }

  showControlsToBlock(block) {
    this.target = block;

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
    if (edit_block_btn && block.classList.contains("newCms_quill_editor")) {
      edit_block_btn.addEventListener("click", () => {
        this.newCms.inline_quill_editor.appendInlineQuillEditor(
          this.newCms.edit_block.target
        );
        this.init();
      });
    }

    const relocate_btn = this.node.find(".relocate_btn");
    if (relocate_btn) {
      relocate_btn.addEventListener(
        IS_MOBILE ? "touchstart" : "mousedown",
        () => {
          this.newCms.grabBlock(block);
          this.init();
        }
      );
    }

    const remove_btn = this.node.find(".remove_btn");
    if (remove_btn) {
      remove_btn.addEventListener("click", () => {
        this.newCms.removeBlock(block);
        this.init();
      });
    }

    const node_rect = this.node.getBoundingClientRect();

    let left = this.newCms.mouse_x;
    let top =
      this.newCms.mouse_y +
      this.newCms.content_scroll_panel.scrollTop -
      node_rect.height * 0.35;

    const node_width = node_rect.width;
    const node_height = node_rect.height;
    const side_offset = node_width * 0.5 + 5;
    const vertical_offset = node_height * 0.5 + 5;

    left = Math.max(left, side_offset);
    left = Math.min(
      left,
      this.newCms.content_scroll_content.clientWidth - side_offset
    );

    top = Math.max(top, vertical_offset);
    top = Math.min(
      top,
      this.newCms.content_scroll_content.clientHeight - vertical_offset
    );

    this.node.style.left = left + "px";
    this.node.style.top = top + "px";

    this.node.classList.toggle("visible", true);
  }
}

class FloatingRearrangeControls {
  constructor(newCms) {
    this.newCms = newCms;
    this.node = newCms.container.find(`.rearrange_controls`);
    this.rearrange_insert_rect_node = newCms.container.find(
      `.rearrange_insert_rect`
    );
    this.rearrange_grabbed_rect_node = newCms.container.find(
      `.content_rearrange_grabbed_rect`
    );
    this.init();
  }

  init() {
    this.node.classList.remove("visible");
    this.rearrange_insert_rect_node.classList.remove("visible");
    this.rearrange_grabbed_rect_node.classList.remove("visible");

    this.removeRearrangement();
  }

  removeRearrangement(options = {}) {
    this.rearrange_block = null;
    this.rearrange_position = "";
    this.rearrange_control_node = null;

    this.newCms.container.findAll(".rearrange_active").forEach((e) => {
      if (options.except && options.except.indexOf(e) !== -1) {
        return;
      }
      e.classList.remove("rearrange_active");
    });

    this.newCms.container.classList.remove("rearrange_possible");
  }

  mouseMove() {
    const target = this.newCms.mouse_target;

    let rearrange_block = null;
    let rearrange_control_node = null;

    if (!target || !target.findParentNode(this.rearrange_grabbed_rect_node)) {
      rearrange_control_node = target
        ? target.findParentByClassName("rearrange_control")
        : null;

      if (rearrange_control_node) {
        rearrange_block = rearrange_control_node.rearrange_block;
      }

      if (!rearrange_block) {
        rearrange_block = target
          ? target.findParentByClassName("newCms_block")
          : null;
      }
    }

    let rearrange_position = "";

    let parent_container = null;
    let is_parent_row = false;
    let rearrange_block_rect = null;

    if (rearrange_block) {
      if (
        rearrange_control_node &&
        rearrange_control_node.classList.contains("insert_inside")
      ) {
        parent_container = rearrange_block;
        rearrange_position = "inside";
      } else {
        parent_container = rearrange_block.findParentByAttribute(
          { "data-block": "container" },
          { skip: 1 }
        );

        if (!parent_container) {
          parent_container = this.newCms.content_node;
        }

        is_parent_row = parent_container
          ? parent_container.classList.contains("container_row")
          : false;

        rearrange_block_rect = rearrange_block.getBoundingClientRect();
        if (is_parent_row) {
          rearrange_position =
            event.clientX <
            rearrange_block_rect.left + rearrange_block_rect.width * 0.5
              ? "before"
              : "after";
        } else {
          rearrange_position =
            event.clientY <
            rearrange_block_rect.top + rearrange_block_rect.height * 0.5
              ? "before"
              : "after";
        }

        if (rearrange_position == "inside") {
          rearrange_position = "inside";
          rearrange_control_node = rearrange_block.rearrange_control_inside;
        } else {
          if (rearrange_position == "before") {
            if (rearrange_block.rearrange_control_before) {
              rearrange_control_node = rearrange_block.rearrange_control_before;
            } else {
              var prev_block = rearrange_block.prev();

              if (prev_block && prev_block.rearrange_control_after) {
                rearrange_control_node = prev_block.rearrange_control_after;
              }
            }
          } else if (
            rearrange_position == "after" &&
            rearrange_block.rearrange_control_after
          ) {
            rearrange_control_node = rearrange_block.rearrange_control_after;
          }
        }
      }
    }

    this.removeRearrangement({ except: [rearrange_control_node] });

    if (!rearrange_control_node) {
      rearrange_block = null;
    }

    this.rearrange_block = rearrange_block;
    this.rearrange_position = rearrange_position;
    this.rearrange_control_node = rearrange_control_node;

    this.rearrange_insert_rect_node.classList.toggle(
      "visible",
      !!rearrange_control_node
    );

    this.newCms.container.classList.toggle(
      "rearrange_possible",
      !!rearrange_control_node
    );

    if (rearrange_control_node) {
      if (!rearrange_control_node.classList.contains("rearrange_active")) {
        const min_size = 20;

        let width = min_size;
        let height = min_size;

        const rearrange_block_rect_data = nodePositionAgainstScrollableParent(
          rearrange_block
        );

        let x = rearrange_block_rect_data.relative_pos.left;
        let y = rearrange_block_rect_data.relative_pos.top;

        if (rearrange_position == "inside") {
          height = rearrange_block_rect_data.node_rect.height;
          width = rearrange_block_rect_data.node_rect.width;

          if (height > 30) {
            height -= 20;
            y += 10;
          }
          if (width > 30) {
            width -= 20;
            x += 10;
          }
        } else {
          if (is_parent_row) {
            height = rearrange_block_rect_data.node_rect.height;
          } else {
            width = rearrange_block_rect_data.node_rect.width;
          }

          if (rearrange_position != "before") {
            if (is_parent_row) {
              x += rearrange_block_rect_data.node_rect.width;
            } else {
              y += rearrange_block_rect_data.node_rect.height;
            }
          }

          if (is_parent_row) {
            x -= min_size * 0.5;
          } else {
            y -= min_size * 0.5;
          }

          if (rearrange_control_node.classList.contains("insert_end")) {
            if (is_parent_row) {
              x += min_size * (rearrange_position == "before" ? 0.5 : -0.5);
            } else {
              y += min_size * (rearrange_position == "before" ? 0.5 : -0.5);
            }
          }
        }

        this.rearrange_insert_rect_node.style.left = x + "px";
        this.rearrange_insert_rect_node.style.top = y + "px";
        this.rearrange_insert_rect_node.style.width = width + "px";
        this.rearrange_insert_rect_node.style.height = height + "px";
      }
      rearrange_control_node.classList.add("rearrange_active");

      if (parent_container) {
        parent_container.classList.add("rearrange_active");
        if (parent_container.select_control) {
          parent_container.select_control.classList.add("rearrange_active");
        }
      }
    }
  }

  /*mouseDown(event) {
    if (this.rearrange_block && this.newCms.grabbed_block) {
      this.newCms.releaseBlock();
    }
  }*/

  addFloatingRearrangeControls(block) {
    this.removeRearrangement();

    // just a rect u grab from
    if (block) {
      const block_rect_data = nodePositionAgainstScrollableParent(block);
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
    }

    // them floating controls
    const rearrange_control_width = parseInt(
      getComputedStyle(document.documentElement).getPropertyValue(
        "--rearrange_control_width"
      )
    );
    const rearrange_control_height = parseInt(
      getComputedStyle(document.documentElement).getPropertyValue(
        "--rearrange_control_height"
      )
    );

    let blocks_data = [];
    const addControls = (position) => {
      this.newCms.content_node.findAll(".newCms_block").forEach((block) => {
        if (block.findParentByClassName("select_active")) {
          // we don't wanna rearrange to it's own child or itself, no incest or masturbation allowed here!
          return;
        }

        const parent_container = block.findParentByAttribute(
          { "data-block": "container" },
          { skip: 1 }
        );

        if (
          this.newCms.grabbed_block &&
          ((position === "after" &&
            block.next() == this.newCms.grabbed_block) ||
            (position === "before" &&
              block.prev() == this.newCms.grabbed_block))
        ) {
          return;
        }

        const is_parent_row = parent_container
          ? parent_container.classList.contains("container_row")
          : false;

        const block_rect_data = nodePositionAgainstScrollableParent(block);

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

        if (
          position == "inside" &&
          (block.find(".newCms_block") ||
            block.getAttribute("data-block") != "container")
        ) {
          // has a kid? no need to add that little icon to add more bro
          return;
        }

        let parent_count = 0;
        let parent = block;
        while (parent != this.content_node) {
          parent_count++;
          parent = parent.parent();
        }

        if (position == "inside") {
          block_rect_data.relative_pos.left +=
            (block_rect_data.node_rect.width - rearrange_control_width) * 0.5;
          block_rect_data.relative_pos.top +=
            (block_rect_data.node_rect.height - rearrange_control_height) * 0.5;
        } else {
          if (is_parent_row) {
            block_rect_data.relative_pos.left -= rearrange_control_width * 0.5;
            block_rect_data.relative_pos.top +=
              (block_rect_data.node_rect.height - rearrange_control_height) *
              0.5;

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

    this.newCms.content_node.findAll(".newCms_block").forEach((block) => {
      block.rearrange_control_before = null;
      block.rearrange_control_after = null;
      block.rearrange_control_inside = null;
    });

    addControls("inside");
    addControls("before");
    addControls("after");

    const sorted_blocks_data = blocks_data.sort((a, b) => {
      return Math.sign(a.index - b.index);
    });

    const sorted_blocks_data_length = sorted_blocks_data.length;
    let upper_bound = 0;

    for (let i = 0; i < sorted_blocks_data_length; i++) {
      delete block.rearrange_control_before;
      delete block.rearrange_control_after;
    }

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
            } else if (
              block_data.position === "before" ||
              block_data.position === "inside"
            ) {
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
      rearrange_control.classList.add("rearrange_control");
      rearrange_control.style.left = left + "px";
      rearrange_control.style.top = top + "px";

      let rearrange_control_html = "";

      let rotation = 0;

      if (block_data.position == "inside") {
        rearrange_control_html = `<img style='width:0.7em' src="/src/img/insert_plus.svg">`;
        rearrange_control.classList.add("insert_inside");
      } else {
        if (block_data.is_parent_row) {
          rotation += 90;
        }

        const has_prev = block_data.position == "after" ? true : !!block.prev();
        const has_next =
          block_data.position == "before" ? true : !!block.next();

        if (has_next && has_prev) {
          rearrange_control_html = `<img style='width:1em' src="/src/img/arrows_insert_between.svg">`;
          rearrange_control.classList.add("insert_between");
        } else if (has_prev || has_next) {
          rearrange_control_html = `<img style='width:1em' src="/src/img/arrows_insert_after.svg">`;
          if (has_next) {
            rotation += 180;
          }
          rearrange_control.classList.add("insert_end");
        }
      }

      rearrange_control.innerHTML = rearrange_control_html;

      $(rearrange_control).find("*").style.transform = `rotate(${rotation}deg)`;

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
    this.removeSelection();
  }

  init() {
    this.selected_block = null;
    this.node.classList.add("visible");
    this.removeSelection();
  }

  removeSelection() {
    this.newCms.container.findAll(".select_active").forEach((e) => {
      e.classList.remove("select_active");
    });
  }

  mouseMove() {
    const target = this.newCms.mouse_target;

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

    if (
      this.selected_block != hovered_block ||
      (this.selected_block &&
        !this.selected_block.select_control.classList.contains("select_active"))
    ) {
      this.removeSelection();

      this.selected_block = hovered_block;

      const selected_block = this.selected_block;

      if (selected_block) {
        selected_block.classList.add("select_active");
        selected_block.select_control.classList.add("select_active");
      }
    }

    this.newCms.container.classList.toggle(
      "anything_selected",
      this.selected_block
    );
  }

  mouseDown() {
    if (
      this.newCms.mouse_left_btn &&
      this.selected_block &&
      !this.newCms.grabbed_block
    ) {
      this.newCms.edit_block.showControlsToBlock(this.selected_block);
      //this.newCms.grabBlock(this.selected_block);
    }
  }

  addFloatingSelectControls() {
    this.removeSelection();

    let blocks_data = [];
    this.newCms.content_node.findAll(".newCms_block").forEach((block) => {
      const block_rect_data = nodePositionAgainstScrollableParent(block);

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

    const select_control_width = parseInt(
      getComputedStyle(document.documentElement).getPropertyValue(
        "--select_control_width"
      )
    );
    const select_control_height = parseInt(
      getComputedStyle(document.documentElement).getPropertyValue(
        "--select_control_height"
      )
    );

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

      //let select_control_html = "";
      /*if (block.classList.contains("newCms_container")) {
        //select_control_html = `<i class="fas fa-columns"></i>`;
        select_control.classList.add("control_container");
      } else {
        //select_control_html = `<i class="fas fa-square"></i>`;
        select_control.classList.add("control_block");
      }*/
      //select_control.innerHTML = select_control_html;
      //select_control.innerHTML = ;

      select_control.block = block;
      block.select_control = select_control;

      const block_type = block.getAttribute("data-block");

      select_control.setAttribute("data-block", block_type);

      const icon = $(`.side_block[data-block="${block_type}"] i`);

      select_control.innerHTML = icon
        ? icon.outerHTML
        : `<i class="fas fa-square"></i>`;

      block.select_control = select_control;
      select_control.select_block = block;

      this.node.appendChild(select_control);
    }

    this.node.classList.add("blocks_visible");
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

  constructor(newCms, node, wrapper, content_scroll_panel) {
    this.node = node;
    this.wrapper = wrapper;
    this.newCms = newCms;

    var Size = Quill.import("attributors/style/size");
    Size.whitelist = [];
    for (let i = 0; i < 10; i++) {
      Size.whitelist.push(Math.round(Math.pow(1.25, i - 2) * 100) / 100 + "em");
    }

    this.quill_editor = new Quill(node, {
      scrollingContainer: content_scroll_panel,
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
        this.newCms.updateMouseCoords(event);
        this.mouseDown();
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

    block.classList.add("during_inline_edit");
  }

  saveInlineQuillEditor(block) {
    const newCms_block_content = block.find(".newCms_block_content");

    this.newCms.inline_edited_block = null;

    const ql_html = this.content_node.innerHTML;
    newCms_block_content.setContent(ql_html);

    this.newCms.content_scroll_panel.appendChild(this.wrapper);
    this.wrapper.classList.remove("visible");

    block.classList.remove("during_inline_edit");

    this.newCms.contentChange();
  }

  mouseDown() {
    const target = this.newCms.mouse_target;

    const newCms_block = target
      ? target.findParentByClassName("newCms_block")
      : null;

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
    this.content_scroll_panel = this.container.find(`.content_scroll_panel`);
    this.content_scroll_content = this.container.find(
      `.content_scroll_content`
    );
    this.sidebar = this.container.find(`.sidebar`);

    this.inline_edited_block = null;

    this.initEditBlockRect();
    this.initQuillEditor();
    this.initFloatingSelectControls();
    this.initFloatingRearrangeControls();
    this.initListenChange();

    this.mouse_x = 0;
    this.mouse_y = 0;
    this.client_mouse_x = 0;
    this.client_mouse_y = 0;
    this.mouse_dx = 0;
    this.mouse_dy = 0;
    this.mouse_target = null;
    //this.scroll_top = 0;

    setFormData(
      {
        edit_mode: 1,
      },
      container
    );

    this.container.addEventListener(
      IS_MOBILE ? "touchstart" : "mousemove",
      (event) => {
        this.updateMouseCoords(event);
        this.mouseMove();
      }
    );

    this.container.addEventListener(
      IS_MOBILE ? "click" : "mousedown",
      (event) => {
        this.updateMouseCoords(event);
        this.mouseDown();
      }
    );

    this.container.addEventListener(
      IS_MOBILE ? "touchend" : "mouseup",
      (event) => {
        this.updateMouseCoords(event);
        this.mouseUp();
      }
    );

    this.content_scroll_panel.addEventListener("scroll", () => {
      this.scroll();
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
      this.container.find(".content_scroll_panel")
    );
  }

  initFloatingSelectControls() {
    this.select_controls = new FloatingSelectControls(this);
  }

  initFloatingRearrangeControls() {
    this.rearrange_controls = new FloatingRearrangeControls(this);
  }

  edit(targetNode, options) {
    this.targetNode = $(targetNode);
    this.options = options;

    this.edit_block.init();
    this.rearrange_controls.removeRearrangement();
    this.select_controls.removeSelection();

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

  updateMouseTarget() {
    this.mouse_target = $(
      document.elementFromPoint(this.client_mouse_x, this.client_mouse_y)
    );
  }

  updateMouseCoords(event) {
    const content_scroll_panel_rect = this.content_scroll_panel.getBoundingClientRect();
    const mouse_x = event.clientX - content_scroll_panel_rect.left;
    const mouse_y = event.clientY - content_scroll_panel_rect.top;
    this.client_mouse_x = event.clientX;
    this.client_mouse_y = event.clientY;
    this.mouse_dx = mouse_x - this.mouse_x;
    this.mouse_dy = mouse_y - this.mouse_y;
    this.mouse_x = mouse_x;
    this.mouse_y = mouse_y;
    this.mouse_left_btn = event.buttons === 1;
    this.mouse_target = $(event.target);
  }

  mouseMove() {
    if (this.grabbed_block) {
      this.rearrange_controls.mouseMove();
      return;
    } else if (this.edit_block.target) {
      this.edit_block.mouseMove();
    } else {
      this.select_controls.mouseMove();
    }
  }

  mouseDown() {
    if (this.edit_block.target) {
    } else {
      this.select_controls.mouseDown();
    }

    const target = this.mouse_target;

    const side_block = target
      ? target.findParentByClassName("side_block")
      : null;
    if (side_block) {
      this.grabBlock(side_block);
    }
  }

  mouseUp() {
    if (this.grabbed_block) {
      this.releaseBlock();
    }
  }

  scroll() {
    this.updateMouseTarget();
    this.mouseMove();

    //this.scroll_top = this.content_scroll_panel.scrollTop;
    /*if (this.grabbed_block) {
      this.grabbedBlockPositionChange();
      return;
    }*/
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

  getBlockHtml(type, options = {}) {
    let content = "";
    let class_name = "";
    let class_name_content = "";

    if (type === "quill_editor") {
      class_name_content = "ql-editor";
    }

    return /*html*/ `
      <div class="newCms_block ${class_name}" data-block="${type}">
          <div class="newCms_block_content ${class_name_content}">${content}</div>
      </div>
    `;
  }

  insertBlock(target, position, type, options = {}) {
    target.insertAdjacentHTML(position, getBlockHtml(type, options));

    this.contentChange();
  }

  removeBlock(block) {
    if (!block) {
      return;
    }
    const duration = 300;
    this.lockInput(duration);
    zoomNode(block, "out", {
      duration: duration,
      callback: () => {
        block.remove();
        this.contentChange();
      },
    });
  }

  grabBlock(block) {
    if (this.grabbed_block) {
      return;
    }

    const block_rect = block.getBoundingClientRect();
    block.last_rect = block_rect;
    block.last_relative_rect_data = nodePositionAgainstScrollableParent(block);

    this.source_grabbed_node = block.classList.contains("side_block")
      ? this.sidebar
      : this.content_scroll_content;

    this.source_grabbed_node_scroll_parent = this.source_grabbed_node.findScrollParent();

    this.source_grabbed_node.appendChild(
      newCms.rearrange_controls.rearrange_grabbed_rect_node
    );

    this.grabbed_block = $(block);
    this.grabbed_block.classList.add("grabbed");
    this.grabbed_mouse_x = this.mouse_x;
    this.grabbed_mouse_y = this.mouse_y;
    this.grabbed_scroll_top = nonull(
      this.source_grabbed_node_scroll_parent.scrollTop,
      0
    );

    this.container.classList.add("grabbed_block");

    this.rearrange_controls.node.classList.add("visible");
    this.select_controls.node.classList.remove("blocks_visible");

    this.rearrange_controls.addFloatingRearrangeControls(this.grabbed_block);

    this.grabAnimation();
  }

  releaseBlock() {
    let grabbed_block = this.grabbed_block;
    if (!grabbed_block) {
      return;
    }

    const block_type = grabbed_block.getAttribute("data-block");

    let delay_grabbed_rect_node_fadeout = 0;

    if (block_type && grabbed_block.classList.contains("side_block")) {
      const side_block = grabbed_block;
      const side_block_rect = side_block.getBoundingClientRect();

      const t1 = 100;
      const t2 = 250;
      animate(
        side_block,
        `
          0% {opacity: 1}
          100% {opacity: 0}
        `,
        t1,
        () => {
          side_block.classList.remove("grabbed");
          side_block.style.transform = "";
          animate(
            side_block,
            `
              0% {opacity: 0; transform: scale(0.65)}
              100% {opacity: 1; transform: scale(1)}
            `,
            t2
          );
        }
      );
      delay_grabbed_rect_node_fadeout = t1 + t2;

      // replace
      grabbed_block = createNodeByHtml(this.getBlockHtml(block_type));
      this.grabbed_block = grabbed_block;
      this.content_node.appendChild(grabbed_block);

      grabbed_block.animation_data = { x: 0, y: 0 };
      grabbed_block.last_rect = side_block_rect;
      grabbed_block.classList.add("select_active");
    }

    this.grabbed_block.style.transform = "";
    grabbed_block.classList.remove("grabbed");
    this.container.classList.remove("grabbed_block");

    this.grabbed_block = null;

    let end_just_once = true;
    const end = () => {
      if (!end_just_once) {
        return;
      }
      end_just_once = false;

      // not needed cause we set it to user-select none bro
      removeUserSelection();

      this.rearrange_controls.removeRearrangement();
      this.select_controls.removeSelection();

      setTimeout(() => {
        this.updateMouseTarget();
        this.mouseMove();
      }, 100);

      this.contentChange();
    };

    this.rearrange_controls.node.classList.remove("visible");

    setTimeout(() => {
      this.rearrange_controls.rearrange_grabbed_rect_node.classList.remove(
        "visible"
      );
    }, delay_grabbed_rect_node_fadeout);

    if (this.rearrange_controls.rearrange_block) {
      const duration = 350;

      this.content_node.findAll(".newCms_block").forEach((block) => {
        const node_on_screen_rect = isNodeOnScreen(block, 0);
        if (node_on_screen_rect && !block.last_rect) {
          block.last_rect = node_on_screen_rect;
        }
      });

      if (this.rearrange_controls.rearrange_position == "inside") {
        this.rearrange_controls.rearrange_block
          .find(".newCms_block_content")
          .appendChild(grabbed_block);
      } else {
        let before_node = this.rearrange_controls.rearrange_block;
        if (this.rearrange_controls.rearrange_position == "after") {
          before_node = before_node.next();
        }

        this.rearrange_controls.rearrange_block
          .parent()
          .insertBefore(grabbed_block, before_node);
      }

      const all_animatable_blocks = this.content_node
        .findAll(".newCms_block")
        .filter((block) => {
          const node_on_screen_rect = isNodeOnScreen(block, 0);
          if (block.last_rect && node_on_screen_rect) {
            block.new_rect = node_on_screen_rect;
            if (!block.animation_data) {
              block.animation_data = { x: 0, y: 0 };
            }
            return true;
          } else {
            return false;
          }
        });

      all_animatable_blocks.forEach((block) => {
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

      all_animatable_blocks.forEach((block) => {
        //const styles = window.getComputedStyle(block);

        // TODO: every property such like flexGrow etc needs to be available in a quickly accessible place
        // maybe put them straight to styles?
        // we should remove it when cleaning the cms output anyway ;)

        let mx = 0.5 * (block.new_rect.width - block.last_rect.width);
        let my = 0.5 * (block.new_rect.height - block.last_rect.height);

        const dx = block.animation_data.x - mx;
        const dy = block.animation_data.y - my;

        const fg = block.style.flexGrow;
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
            block.style.flexGrow = fg;

            setTimeout(() => {
              end();
            }, 50);
          }
        );

        delete block.animation_data;
        delete block.last_rect;
      });

      this.lockInput(duration);
    } else {
      end();
    }
  }

  grabAnimation() {
    if (!this.grabbed_block) {
      return;
    }

    // cute scroll
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

    // move the block itself
    const grabbed_block = this.grabbed_block;

    // pull closer to the cursor
    grabbed_block.last_relative_rect_data,
      this.grabbed_mouse_x,
      this.grabbed_mouse_y;

    const acc = 0.15;
    const gb_rect = grabbed_block.last_relative_rect_data;
    this.grabbed_mouse_x =
      this.grabbed_mouse_x * (1 - acc) +
      (gb_rect.relative_pos.left + gb_rect.node_rect.width * 0.5) * acc;
    this.grabbed_mouse_y =
      this.grabbed_mouse_y * (1 - acc) +
      (gb_rect.relative_pos.top + gb_rect.node_rect.height * 0.5) * acc;

    // display actual position using transform
    const dx = this.mouse_x - this.grabbed_mouse_x;
    const dy =
      this.mouse_y -
      this.grabbed_mouse_y +
      nonull(this.source_grabbed_node_scroll_parent.scrollTop, 0) -
      this.grabbed_scroll_top;

    grabbed_block.animation_data = { x: dx, y: dy };

    grabbed_block.style.transform = `
      translate(
        ${dx.toPrecision(5)}px,
        ${dy.toPrecision(5)}px
      )
    `;

    // repeat
    requestAnimationFrame(() => {
      this.grabAnimation();
    });
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
                <div class="sidebar shown">
                  <!--<button class="toggle-sidebar-btn btn subtle" onclick="toggleSidebar(this.parent())" data-tooltip="Ukryj bloki"><i class="fas fa-chevron-left"></i><i class="fas fa-puzzle-piece"></i></button>-->
                  <span class="field-title first" style='margin-bottom:7px'><i class="fas fa-puzzle-piece"></i>
                    Bloki 
                    <i class="fas fa-info-circle" data-tooltip="Przeciągnij na dokument i upuść"></i>
                  </span>
                  <div class="block_list">
                    <div class="side_rearrange_grabbed_rect"></div>
                    <div class="side_block" data-block="quill_editor">
                      <i class="fas fa-align-center"></i>
                      <span>Edytor tekstowy</span>
                    </div>
                    <div class="side_block" data-block="container">
                      <i class="fas fa-columns"></i>
                      <span>Kontener</span>
                    </div>
                    
                  </div>
                </div>

                <div style="width:100%;">
                  <div class="scroll-panel scroll-shadow content_scroll_panel">
                    <div style="position:relative" class="content_scroll_content">
                      <div class="edit_block_node"></div>
                      <div class="select_controls"></div>
                      <div class="rearrange_controls"></div>
                      <div class="rearrange_insert_rect"></div>
                      <div class="rearrange_grabbed_rect content_rearrange_grabbed_rect"></div>
                      <div class="quill_editor_wrapper">
                        <div class="quill_editor"></div>
                      </div>
                      <div style="padding:15px;overflow:hidden">
                        <div class="newCmsContent newCms_container_content" data-type="html" name="content"></div>
                      </div>
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
