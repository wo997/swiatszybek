// dependencies
useTool("imagePicker");

var fontAwesomeList = [
  "fas fa-address-book",
  "far fa-address-book",

  "fas fa-angle-double-down",
  "fas fa-angle-down",
  "fas fa-chevron-down",
  "fas fa-arrow-down",
  "fas fa-arrow-alt-circle-down",
  "far fa-arrow-alt-circle-down",

  "fas fa-angle-double-right",
  "fas fa-angle-right",
  "fas fa-chevron-right",
  "fas fa-arrow-right",
  "fas fa-arrow-alt-circle-right",
  "far fa-arrow-alt-circle-right",

  "fas fa-angle-double-left",
  "fas fa-angle-left",
  "fas fa-chevron-left",
  "fas fa-arrow-left",
  "fas fa-arrow-alt-circle-left",
  "far fa-arrow-alt-circle-left",

  "fas fa-angle-double-up",
  "fas fa-angle-up",
  "fas fa-chevron-up",
  "fas fa-arrow-up",
  "fas fa-arrow-alt-circle-up",
  "far fa-arrow-alt-circle-up",

  "fas fa-quote-left",
  "fas fa-quote-right",

  "fas fa-calendar-alt",
  "far fa-calendar-alt",
  "fas fa-check",
  "fas fa-check-circle",
  "far fa-check-circle",
  "fas fa-envelope",
  "far fa-envelope",
  "fas fa-envelope-open",
  "far fa-envelope-open",
  "fas fa-hand-point-left",
  "far fa-hand-point-left",
  "fas fa-info-circle",
  "fas fa-phone",
  "fas fa-phone-square",
  "fas fa-question",
  "far fa-hourglass",
  "fas fa-stopwatch",
  "fas fa-book",
  "fas fa-book-open",
  "fas fa-bookmark",
  "far fa-bookmark",
  "fas fa-comment",
  "far fa-comment",
  "fas fa-info",
  "fas fa-paperclip",
  "fas fa-pencil-alt",
  "fas fa-search",
  "fas fa-tag",
  "fas fa-tags",
  "fas fa-tasks",
  "fas fa-file",
  "far fa-file",
  "fas fa-exclamation",
  "fas fa-plus",
  "fas fa-minus",
  "fas fa-user",
  "far fa-user",
  "fas fa-thumbs-up",
  "far fa-thumbs-up",
  "fab fa-facebook-f",
  "fab fa-facebook-square",
  "fab fa-instagram",
  "fab fa-twitter",
  "fab fa-twitter-square",

  "fas fa-bullhorn",
  "fas fa-camera",
  "fas fa-shopping-cart",
  "fas fa-cart-plus",
  "fas fa-shipping-fast",
  "fas fa-bell",
  "far fa-bell",
  "fas fa-bolt",
  "fas fa-award",
  "fas fa-map-marker-alt",
  "fas fa-location-arrow",
  "fas fa-download",
  "fas fa-external-link-alt",
  "fas fa-exclamation-triangle",
  "fas fa-exclamation-circle",
  "fas fa-heart",
  "far fa-heart",
  "fas fa-smile",
  "far fa-smile",
  "fas fa-smile-wink",
  "far fa-smile-wink",
  "fas fa-frown",
  "far fa-frown",
  "fas fa-thumbs-down",
  "far fa-thumbs-down",
];

window.quillEditor = {
  myColorList: [
    "rgb(255, 85, 118)",
    "rgb(255,43,0)",
    "#FFD700",
    "#6c1",
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
  ],
  callback: null,
  lastSelection: { index: 0, length: 0 },
  isLastNodeLink: null,
  source: null,
  wrapper: null,
  menu_sub: null,
  active_elem: null,
  open: (source, params = {}) => {
    if (!source) return;
    quillEditor.source = source;
    quillEditor.callback = params.callback;
    var quillColorNode = $("#quillEditor .background-color");
    if (params.colorNode) {
      quillColorNode.style.backgroundColor =
        params.colorNode.style.backgroundColor;
      quillColorNode.style.opacity = params.colorNode.style.opacity;
    } else {
      quillColorNode.style.backgroundColor = "#fff";
      quillColorNode.style.opacity = 1;
    }
    var w = $("#quillEditor .quill-editor-container");
    removeClassesWithPrefix(w, "align-");
    removeClassesWithPrefix(w, "block-padding-");
    if (params.wrapper) {
      quillEditor.wrapper = params.wrapper;
      w.style.backgroundImage = params.wrapper.style.backgroundImage;
      quillEditor.toggleQuillSize(true);
      matchClassesWithPrefix(params.wrapper, "align-").forEach((u) => {
        w.classList.add(u);
      });
      matchClassesWithPrefix(params.wrapper, "block-padding-").forEach((u) => {
        w.classList.add(u);
      });
    } else {
      w.style.backgroundImage = "";
    }
    quillEditor.wasInTable = false;
    var qlContainer = $(".quill-editor-container .ql-editor");
    qlContainer.innerHTML = source.innerHTML;
    qlContainer.style.padding = window.getComputedStyle(source).padding;

    setTimeout(() => {
      quillEditor.editor.history.clear();
      quillEditor.hideCustomQuillButtons();
      quillEditor.fixHeight(40);
    });

    showModal("quillEditor", { source: source });
  },
  save: () => {
    var cursor = $("#quillEditor .ql-cursor");
    if (cursor) removeNode(cursor);

    var target = quillEditor.source;
    var content = $("#quillEditor .ql-editor").innerHTML;
    target.innerHTML = content;
    var src = document.getElementById(target.id + "-src");
    if (src) src.value = content;
    if (quillEditor.callback) {
      quillEditor.callback();
    }
  },
  hideCustomQuillButtons: () => {
    $$(".quill-cloud").forEach((e) => {
      e.style.display = "";
    });
  },
  isSelectionInNode: (tagName) => {
    var sel_node = $(getSelection().focusNode);
    if (!sel_node) return false;
    if (sel_node.tagName == tagName) return sel_node;
    sel_node = sel_node.parent();
    if (sel_node.tagName == tagName) return sel_node;
    sel_node = sel_node.parent();
    if (sel_node.tagName == tagName) return sel_node;
    return false;
  },
  toggleQuillSize: (fromTarget = null) => {
    var e = $("#quillEditor .quill-editor-container");
    if (fromTarget === null) {
      fromTarget = e.style.width == "100%" || e.style.width == "";
    }
    if (fromTarget && quillEditor.wrapper) {
      e.style.width = quillEditor.wrapper.getBoundingClientRect().width + "px";
      $(
        "#quillEditor .toggle_size"
      ).innerHTML = `<i class="fas fa-expand"></i>`;
    } else {
      e.style.width = "100%";
      $(
        "#quillEditor .toggle_size"
      ).innerHTML = `<i class="fas fa-compress"></i>`;
    }
  },
  isInTable: (elem) => {
    if (elem) {
      while (true) {
        elem = elem.parent();
        if (!elem || elem.className == "ql-editor") return false;
        if (elem.tagName == "TABLE") {
          return elem;
        }
      }
    }
  },
  checkIfTable: () => {
    var table = quillEditor.isInTable(getSelection().focusNode);
    var table_menu = $("#quillEditor .table_menu");
    var container = $("#quillEditor .quill-wrapper");
    if (table) {
      table_menu.style.display = "block";
      var tr = table.getBoundingClientRect();
      var cr = container.getBoundingClientRect();
      table_menu.style.left = tr.x - cr.x + "px";
      table_menu.style.top = tr.y - cr.y + container.scrollTop + "px";
    } else table_menu.style.display = "";
  },
  markLastSelection: () => {
    quillEditor.isLastNodeLink = quillEditor.isSelectionInNode("A");
    var s = quillEditor.editor.getSelection();
    if (s) quillEditor.lastSelection = s;

    quillEditor.wasWasWasInTable = quillEditor.wasWasInTable;
    quillEditor.wasWasInTable = quillEditor.wasInTable;
    quillEditor.wasInTable = false;
    var nativeSelection = getSelection();
    if (
      nativeSelection &&
      findParentByTagName(nativeSelection.anchorNode, "TD")
    ) {
      quillEditor.wasInTable = true;
      quillEditor.lastSelecitonInTable = quillEditor.lastSelection;
    }

    quillEditor.toggleButtonsDisablationInTable(quillEditor.wasInTable);
  },

  toggleButtonsDisablationInTable: (disabled) => {
    $$(".ql-header, .ql-list, .ql-video, .ql-table").forEach((e) => {
      e.classList.toggle("ql-btn-disabled", disabled);
    });
  },

  selectHyperLink: () => {
    var x = getSelection();
    var q = quill.getSelection();
    if (x && q && q.length == 0) {
      quillEditor.selectText(active_elem);
      var q = quill.getSelection();
      quill.getFormat();
      quill.formatText(q.index, q.length, { myLink: true });
    }
  },

  removeLink: () => {
    quillEditor.selectAnything();

    var x = getSelection();
    var q = quillEditor.editor.getSelection();
    if (x && q && q.length == 0)
      quillEditor.selectText(quillEditor.active_elem);

    $("#quillEditor .ql-myLink").click();
    quillEditor.hideCustomQuillButtons();
  },

  selectText: (node) => {
    if (document.body.createTextRange) {
      const range = document.body.createTextRange();
      range.moveToElementText(node);
      range.select();
    } else if (window.getSelection) {
      const selection = window.getSelection();
      const range = document.createRange();
      range.selectNodeContents(node);
      selection.removeAllRanges();
      selection.addRange(range);
    } else {
      console.warn("Could not select text in node: Unsupported browser.");
    }
  },

  selectAnything: () => {
    var ed = $("#quillEditor .quill-editor-container");
    var wasTop = ed.scrollTop;

    var selection = quillEditor.editor.getSelection();
    if (!selection) {
      quillEditor.editor.setSelection(
        quillEditor.lastSelection.index,
        quillEditor.lastSelection.length
      );
    }

    ed.scrollTop = wasTop;
  },

  insertSpecialChar: (char) => {
    quillEditor.selectAnything();
    var selection = quillEditor.lastSelection;

    quillEditor.editor.insertEmbed(
      selection.index,
      "customIcon",
      {
        value: `${char}`,
      },
      "api"
    );

    quillEditor.editor.setSelection(selection.index + 1, 0);
  },

  insertVideo: (src) => {
    quillEditor.selectAnything();
    var selection = quillEditor.lastSelection;

    if (getIdFromYoutubeUrl(src)) {
      quillEditor.editor.insertEmbed(
        selection.index,
        "YTVideo",
        {
          value: `${src}`,
        },
        "api"
      );
    } else {
      quillEditor.editor.insertEmbed(
        selection.index,
        "MyVideo",
        {
          value: `${src}`,
        },
        "api"
      );
    }

    quillEditor.editor.setSelection(selection.index + 1, 0);
  },

  quillImageCallback: (src) => {
    src = "/uploads/df/" + src;
    quillEditor.editor.insertEmbed(
      quillEditor.lastSelection.index,
      "image",
      src
    );
  },

  fixQLtooltip: () => {
    var tool = $(".ql-tooltip");
    if (tool) {
      var left = parseInt(tool.style.left);
      var top = parseInt(tool.style.top);
      if (left < 20) {
        tool.style.left = "20px";
      }
      if (top < 20) {
        tool.style.top = "20px";
      }
      var maxleft =
        tool.parent().getBoundingClientRect().width -
        tool.getBoundingClientRect().width -
        30;
      if (left > maxleft) tool.style.left = maxleft + "px";
      var maxtop =
        tool.parent().getBoundingClientRect().height -
        tool.getBoundingClientRect().height -
        30;
      if (top > maxtop) tool.style.top = maxtop + "px";
    }
  },

  hideCustomQuillButtons: () => {
    $$(".quill-cloud").forEach((e) => {
      e.style.display = "";
    });
  },

  /*selectElementContents: (el) => {
        if (window.getSelection && document.createRange) {
            var sel = window.getSelection();
            var range = document.createRange();
            range.selectNodeContents(el);
            sel.removeAllRanges();
            sel.addRange(range);
        } else if (document.selection && document.body.createTextRange) {
            var textRange = document.body.createTextRange();
            textRange.moveToElementText(el);
            textRange.select();
        }
    },*/

  modifyNode: (prop, v) => {
    if (!quillEditor.active_elem) return;
    if (["alt", "data-href"].indexOf(prop) != -1)
      quillEditor.active_elem.setAttribute(prop, v);
    else if (prop == "width") quillEditor.active_elem.style[prop] = v;
    else if (prop == "youtube") {
      if (quillEditor.menu_sub == "myvideo") {
        quillEditor.active_elem.src = v;
      } else
        quillEditor.active_elem.src = getThumbnailFromYoutubeId(
          getIdFromYoutubeUrl(v)
        );
    } else if (prop == "mylink") {
      quillEditor.active_elem.href = v;
    } else if (prop == "mylinkstyle") {
      quillEditor.active_elem.className = v;
    } else if (prop == "mylinktitle") {
      if (!v) {
        v = "…";
      }
      quillEditor.active_elem.innerHTML = v;
    }
  },

  setBlockBackground: (val = "", type = "") => {
    var preview = $(".cmsBlockBackgroundPreview");
    preview.style.backgroundColor = ``;
    preview.style.backgroundImage = ``;
    if (type == "image") {
      preview.style.backgroundImage = `url("/uploads/df/${val}")`;
    }
    if (type == "color") {
      preview.style.backgroundColor = "#" + val;
    }
  },

  fixHeight: (repeat = 0) => {
    var expectYmin = quillEditor.wrapper
      ? quillEditor.wrapper.getBoundingClientRect().height
      : 100000;
    var contentHeight = $("#quillEditor .ql-editor").getBoundingClientRect()
      .height;
    var h = Math.min(
      expectYmin,
      $("#quillEditor .quill-wrapper").getBoundingClientRect().height -
        $("#quillEditor .ql-toolbar.ql-snow").getBoundingClientRect().height -
        10
    );

    $("#quillEditor .quill-editor-container").style.minHeight =
      contentHeight < h ? h + "px" : "";

    if (repeat > 0) {
      requestAnimationFrame(() => {
        quillEditor.fixHeight(repeat - 1);
      });
    }
  },

  considerUploadingImages() {
    if (!imagePicker) return;

    if (!$("#quillEditor [upload_image]")) {
      var counter = 0;
      var srcs = [];
      var e = [...$$("#quillEditor .ql-editor img")].forEach((e) => {
        if (e.src.indexOf("data:image/") == -1) return;
        counter++;
        e.setAttribute("upload_image", counter);
        srcs.push(e.src);
      });

      if (counter > 0) {
        var formData = new FormData();
        formData.append("tag", imagePicker.defaultTag);
        formData.append("base64", JSON.stringify(srcs));
        formData.append("search", "");

        imagePicker.imageAction(formData);
      }
    }
  },
  loaded: () => {
    var Size = Quill.import("attributors/style/size");
    Size.whitelist = [
      "14px",
      "18px",
      "24px",
      "30px",
      "38px",
      "48px",
      "60px",
      "80px",
    ];
    Quill.register(Size, true);

    let Inline = Quill.import("blots/inline");
    let Embed = Quill.import("blots/embed");
    let BlockEmbed = Quill.import("blots/block/embed");

    class Shadow extends Inline {
      static create(value) {
        let node = super.create();
        node.setAttribute("class", "shadow");
        return node;
      }
    }
    Shadow.blotName = "shadow";
    Shadow.tagName = "shadow";
    Quill.register(Shadow);

    class Przycisk extends Inline {
      static create(value) {
        let node = super.create();
        node.setAttribute("class", "przycisk");
        return node;
      }
    }
    Przycisk.blotName = "przycisk";
    Przycisk.tagName = "przycisk";
    Quill.register(Przycisk);

    class Video extends BlockEmbed {
      static create(data) {
        let node = super.create();
        node.setAttribute("src", data.value);
        node.setAttribute("class", "ql-video");
        node.setAttribute("controls", true);
        return node;

        stopAllVideos();
      }

      deleteAt(index, length) {
        super.deleteAt(0, 1);
      }

      length() {
        return 1;
      }

      static value(node) {
        return {
          value: node.getAttribute("src"),
          width: node.style.width,
        };
      }
    }
    Video.blotName = "MyVideo";
    Video.tagName = "video";
    Quill.register(Video);

    class MyLink extends Inline {
      static create(data) {
        let node = super.create();
        if (data.href) node.setAttribute("href", data.href);
        if (data.classList) node.classList = data.classList; // yay, it can be anything :)
        return node;
      }

      static formats(node) {
        return {
          href: node.getAttribute("href"),
          classList: node.classList,
        };
      }
    }
    MyLink.blotName = "myLink";
    MyLink.tagName = "a";
    Quill.register(MyLink);

    class YTVideo extends Inline {
      static create(data) {
        var src = data.value;
        if (!isYTThumbnail(src)) {
          var id = getIdFromYoutubeUrl(src);
          if (id) {
            src = getThumbnailFromYoutubeId(id);
          }
        }

        let node = super.create();
        var style = data.width ? `style='width:${data.width}'` : "";
        node.innerHTML = `<img class='ql-video' ${style} src='${src}'>`;
        return node;
      }

      static deleteAt(index, length) {
        super.deleteAt(0, 1);
      }

      static length() {
        return 1;
      }

      static value(node) {
        var img = node.find("img");
        return {
          value: img.getAttribute("src"),
          width: img.style.width,
        };
      }
    }
    YTVideo.blotName = "YTVideo";
    YTVideo.tagName = "yt-video";
    Quill.register(YTVideo);

    class CustomIcon extends Embed {
      static create(data) {
        let node = super.create();
        node.innerHTML = `<i class='${data.value}'><span>&nbsp;&nbsp;&nbsp;</span></i>`;
        return node;
      }

      static deleteAt(index, length) {
        super.deleteAt(0, 1);
      }

      static length() {
        return 1;
      }

      static value(node) {
        var n = node.find("i");
        var v = n ? n.className : "";
        return { value: v };
        //return {value: node.find("img").getAttribute('src')};
      }
    }
    CustomIcon.blotName = "customIcon";
    CustomIcon.tagName = "ql-icon";
    Quill.register(CustomIcon);

    class CustomImg extends Embed {
      static create(data) {
        let node = super.create();

        var alt = "";
        if (data.alt) alt = data.alt;
        node.setAttribute("alt", alt);

        var src = "";
        if (data.value) src = data.value;
        node.setAttribute("src", src);

        var href = "";
        if (data.href) href = data.href;
        node.setAttribute("data-href", href);

        var style = "";
        if (data.width) style = `width:${data.width}`;
        node.setAttribute("style", style);

        return node;
      }

      static deleteAt(index, length) {
        super.deleteAt(0, 1);
      }

      static length() {
        return 1;
      }

      static value(node) {
        return {
          value: node.getAttribute("src"),
          alt: node.getAttribute("alt"),
          href: node.getAttribute("data-href"),
          width: node.style.width,
        };
      }
    }
    CustomImg.blotName = "customImg";
    CustomImg.tagName = "img";
    Quill.register(CustomImg);

    class BreakLine extends Embed {
      static create(data) {
        let node = super.create();
        return node;
      }

      static deleteAt(index, length) {
        super.deleteAt(0, 1);
      }

      static length() {
        return 1;
      }
    }
    BreakLine.blotName = "breakLine";
    BreakLine.tagName = "break-line";
    Quill.register(BreakLine);

    quillEditor.editor = new Quill(".quill-editor-container", {
      scrollingContainer: "#quillEditor .quill-wrapper",
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
              color: quillEditor.myColorList,
            },
            {
              background: quillEditor.myColorList,
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
          ["myLink", "image", "video"],
          ["clean"],
          ["shadow"],
        ],
        table: true,
      },
    });

    var toolbar = $("#quillEditor .ql-toolbar.ql-snow");
    toolbar.parent().parent().appendChild(toolbar);

    $(".quill-editor-container").insertAdjacentHTML(
      "afterbegin",
      `<div class="background-color"></div>`
    );

    //window.better_table = quill.getModule('better-table');
    table = quillEditor.editor.getModule("table");

    $("#quillEditor .ql-image").outerHTML += "";
    setTimeout(() => {
      $("#quillEditor .ql-image").onclick = function () {
        imagePicker.open(null, {
          callback: quillEditor.quillImageCallback,
          source: this,
        });
      };
    }, 100);

    $("#quillEditor .ql-video").outerHTML += "";
    setTimeout(() => {
      $("#quillEditor .ql-video").onclick = function () {
        //beforeImageInsert();
        if (quillEditor.source) {
          showModal("putVideo", { source: this });
        }
      };
    }, 100);

    var fa = "";

    for (let f of window.fontAwesomeList) {
      fa += `<div onclick='quillEditor.insertSpecialChar("${f}")'><i class='${f}'></i></div>`;
    }

    $("#quillEditor .ql-toolbar").insertAdjacentHTML(
      "beforeend",
      `
            <span class="ql-formats">
                <button class="ql-table" onclick="table.insertTable(1, 2);" type="button" style="white-space: nowrap;width: auto;"><i class="fas fa-table"></i></button>
            </span>
            <span class="ql-formats tooltip-wrapper tooltip-icons" onclick="this.classList.toggle('active')">
                <i class="fas fa-icons"></i>
                <div class="tooltip-content" style='margin-top: 3px;'>
                    ${fa}
                </div>
            </span>
        `
    );

    quillEditor.editor.on("text-change", (delta, oldDelta, source) => {
      quillEditor.fixHeight();

      var keyPressed = null;
      for (a of delta.ops) {
        if (a.insert) {
          if (a.insert.length === 1 && a.insert != " ") keyPressed = a.insert;
          if (a.insert == "\n" && quillEditor.isSelectionInNode("A")) {
            setTimeout(() => {
              $("#quillEditor .ql-myLink").click();
            }, 0);
          }
        }
      }

      quillEditor.considerUploadingImages();

      $$("#quillEditor .ql-editor a").forEach((e) => {
        if (e.innerHTML.length > 2) {
          /*if (e.innerHTML.charAt(0) != " ") {
                        e.innerHTML = " " + e.innerHTML;
                    }
                    if (e.innerHTML.charAt(e.innerHTML.length-1) != " ") {
                        e.innerHTML += " ";
                    }*/
          /*if (e.innerHTML.charAt(1) != " ") {
                        e.innerHTML = " " + e.innerHTML;
                    }*/
          /*if (e.innerHTML.charAt(e.innerHTML.length-2) != " ") {
                        e.innerHTML += " ";
                    }*/
        }
      });

      quillEditor.markLastSelection();

      if (keyPressed && false) {
        var isNodeLink = quillEditor.isSelectionInNode("A");
        var ln = quillEditor.isLastNodeLink;
        //console.log(quillEditor.isLastNodeLink, isNodeLink, keyPressed);

        var s = getSelection();
        if (isNodeLink && s.anchorOffset === 0) {
          var i = quillEditor.lastSelection.index + 2;
          setTimeout(() => {
            quillEditor.editor.setSelection(i, 0);
          }, 0);
        }

        if (ln && !isNodeLink) {
          quillEditor.editor.history.undo();
          quillEditor.editor.insertText(
            quillEditor.lastSelection.index - 1,
            " " + keyPressed
          );
          quillEditor.editor.setSelection(
            quillEditor.lastSelection.index + 1,
            0
          );
        }
      }

      quillEditor.checkIfTable();
    });

    quillEditor.editor.on("selection-change", () => {
      var s = getSelection();
      var p = window.lastP;
      p = findParentByTagName(s.anchorNode, "P");
      var jump = p != window.lastP;
      window.lastP = p;

      //console.log("["+s.anchorOffset+"]",quillEditor.isLastNodeLink,quillEditor.isSelectionInNode("A"));

      if (true) {
        if (window.justLeftPressed) {
          /*if (quillEditor.isLastNodeLink != quillEditor.isSelectionInNode("A") && s.anchorOffset === 1) {
                        quillEditor.editor.insertText(quillEditor.lastSelection.index," ");
                        quillEditor.editor.formatText(quillEditor.lastSelection.index,1,{myLink:false});
                        quillEditor.editor.setSelection(quillEditor.lastSelection.index+1,0);
                        quillEditor.isLastNodeLink = quillEditor.isSelectionInNode("A"); 
                    }
                    window.justLeftPressed = false;*/
        }

        if (window.justRightPressed) {
          /*if (jump && quillEditor.isLastNodeLink) {
                        quillEditor.editor.insertText(quillEditor.lastSelection.index," ");
                        quillEditor.editor.formatText(quillEditor.lastSelection.index,2,{myLink:false});
                        quillEditor.editor.setSelection(quillEditor.lastSelection.index+1,0);
                    }
                    window.justRightPressed = false;*/
        }

        quillEditor.markLastSelection();
        quillEditor.checkIfTable();
      }

      quillEditor.markLastSelection();
    });

    var observer = new MutationObserver((mutations) => {
      if (!$(".ql-myLink.ql-active")) {
        var x = getSelection().anchorNode;
        var cloud = false;
        if (x) {
          if (findParentByClassName(x, ["quill-cloud"])) {
            cloud = true;
          }
        }
        if (!cloud) {
          quillEditor.hideCustomQuillButtons();
        }
      }
      for (var m of mutations) {
        for (var n of m.addedNodes) {
          if (quillEditor.wasInTable && n.tagName == "P") {
            if (!findParentByTagName(n, "TD") && n.parent()) {
              removeNode(n);
            }
          }
          if (n.tagName == "A" && !n.href) {
            if (validURL(n.innerHTML)) {
              n.href = n.innerHTML;
            }
            n.click();
          }
        }
      }
      quillEditor.fixQLtooltip();

      var x = $("#quillEditor .ql-myLink:not([data-tooltip])");
      if (x) {
        x.innerHTML =
          '<i class="fas fa-link" style="transform: translateY(-2px);"></i>';
        x.setAttribute("data-tooltip", "Ustaw zaznaczenie jako link");
      }

      var x = $("#quillEditor .ql-shadow:not([data-tooltip])");
      if (x) {
        x.setAttribute("data-tooltip", "Cień");
      }

      var x = $("#quillEditor .ql-clean:not([data-tooltip])");
      if (x) x.setAttribute("data-tooltip", "Usuń formatowanie");

      scaleVideos();

      $$("iframe.ql-video").forEach((e) => {
        e.outerHTML = `<video src="${e.src}" class="ql-video" controls="true"></video>`;
      });

      $$("#quillEditor break-line").forEach((e) => {
        var n = e.next();
        e.classList.toggle(
          "break-grow",
          (n && n.tagName == "BREAK-LINE") || !n
        );
      });
    });

    observer.observe($("#quillEditor"), {
      childList: true,
      subtree: true,
    });

    $("#quillEditor .ql-editor").addEventListener("keydown", (e) => {
      quillEditor.hideCustomQuillButtons();
      if (e.key === "Escape") {
        $("#quillEditor .ql-clean").click();
      }
      if (e.key === "ArrowRight") {
        var end =
          quillEditor.lastSelection.index + 1 == quillEditor.editor.getLength();
        if (quillEditor.isLastNodeLink && end) {
          $("#quillEditor .ql-myLink").click();
          quillEditor.editor.insertText(quillEditor.lastSelection.index, " ");
        }
        window.justRightPressed = true;
      }
      if (e.key === "ArrowLeft") {
        var end = quillEditor.lastSelection.index == 0;
        if (quillEditor.isLastNodeLink && end) {
          quillEditor.editor.insertText(0, " ");
          quillEditor.editor.setSelection(0, 0);
          quillEditor.editor.formatText(0, 1, { myLink: false });
        }
        window.justLeftPressed = true;
      }
      var nativeSelection = getSelection();
      if (
        quillEditor.wasWasWasInTable ||
        quillEditor.wasWasInTable ||
        quillEditor.wasInTable
      ) {
        // weird as hell    nativeSelection && findParentByTagName(nativeSelection.anchorNode,"TD") || quillEditor.wasInTable) {

        if (e.key === "Enter") {
          var s = quillEditor.lastSelecitonInTable.index;

          quillEditor.editor.insertEmbed(s, "breakLine", {}, "user");
          quillEditor.editor.setSelection(s + 1);
          quillEditor.editor.focus();
        }
      }
      if (
        nativeSelection &&
        findParentByTagName(nativeSelection.anchorNode, "TD")
      ) {
        if (e.key === "Delete") {
          var n = $(nativeSelection.focusNode);
          var deleted = false;
          if (
            (n && n.tagName == "BREAK-LINE") ||
            (n && n.parent() && n.parent().tagName == "BREAK-LINE")
          ) {
            quillEditor.editor.deleteText(quillEditor.lastSelection.index, 1);
            deleted = true;
          }
          if (!deleted && n) {
            n = n.next();
            if (
              (n && n.tagName == "BREAK-LINE") ||
              (n && n.parent() && n.parent().tagName == "BREAK-LINE")
            ) {
              quillEditor.editor.deleteText(quillEditor.lastSelection.index, 1);
            }
          }
        }
      }
    });

    $("#quillEditor").addEventListener("click", (event) => {
      removeClasses("ql-active-element");
      var touchQL = event.target == $(".quill-editor-container");
      if (event.toElement == $(".quill-wrapper") || touchQL) {
        /*if (touchQL) {
                    quillEditor.toggleQuillSize(false);
                }*/
        quillEditor.hideCustomQuillButtons();

        $("#quillEditor .ql-editor").classList.add("attention");
        setTimeout(() => {
          $("#quillEditor .ql-editor").classList.remove("attention");
        }, 200);
      }
    });

    $("#quillEditor .ql-editor").addEventListener("click", (e) => {
      quillEditor.hideCustomQuillButtons();

      var prevActive = quillEditor.active_elem;
      quillEditor.active_elem = e.target;

      setTimeout(() => {
        if (quillEditor.active_elem) {
          quillEditor.active_elem.classList.add("ql-active-element");
        }
      });

      if (
        ["IMG", "VIDEO", "A"].indexOf(quillEditor.active_elem.tagName) != -1 &&
        !quillEditor.active_elem.classList.contains("ql-icon")
      ) {
        var cloud = null;
        if (quillEditor.active_elem.classList.contains("ql-video")) {
          if (quillEditor.active_elem.tagName == "VIDEO") {
            quillEditor.menu_sub = "myvideo";
            if (prevActive != quillEditor.active_elem) {
              setTimeout(stopAllVideos, 300);
              setTimeout(stopAllVideos, 700);
              setTimeout(stopAllVideos, 1000);
              setTimeout(stopAllVideos, 1500);
              // lol, you never know when it starts
            }
            cloud = $(".video-buttons");
            $("#edit_yt_link").value = quillEditor.active_elem.src;
            $("#szerokosc_yt").value = quillEditor.active_elem.style.width;
          } else {
            quillEditor.menu_sub = "youtube";
            cloud = $(".video-buttons");
            $("#edit_yt_link").value = getUrlFromYoutubeId(
              getIdFromYoutubeThumbnail(quillEditor.active_elem.src)
            );
            $("#szerokosc_yt").value = quillEditor.active_elem.style.width;
          }
        } else if (quillEditor.active_elem.tagName == "A") {
          quillEditor.menu_sub = "link";
          cloud = $(".my-link");
          $("#my-link-href").value = quillEditor.active_elem.href;
          $("#my-link-title").value = quillEditor.active_elem.innerHTML;

          /*var style = "Zwykły";
                    quillEditor.active_elem.classList.forEach(e=>{
                        if (e == "przycisk") style = "Przycisk";
                    });
                    $("#my-link-style").innerHTML = style;*/
        } else {
          quillEditor.menu_sub = "img";
          cloud = $(".image-buttons");
          $("#szerokosc").value = quillEditor.active_elem.style.width;
          $("#imgalt").value = quillEditor.active_elem.alt;
          document.getElementById(
            "img-href"
          ).value = quillEditor.active_elem.getAttribute("data-href");
        }

        if (cloud) {
          cloud.style.display = "block";

          var pr = cloud.parent().getBoundingClientRect();
          var er = quillEditor.active_elem.getBoundingClientRect();
          var cr = cloud.getBoundingClientRect();

          var left = er.x - pr.x + (er.width - cr.width) / 2;
          var top = er.y - pr.y - cr.height;

          var minLeft = 10;
          if (left < minLeft) left = minLeft;
          var maxLeft = pr.width - cr.width - 10;
          if (left > maxLeft) left = maxLeft;
          if (top < 0) top = er.y - pr.y + er.height;
          var maxTop = pr.height - cr.height - 10;
          if (top > maxTop) top = maxTop;

          cloud.style.left = left + "px";
          cloud.style.top = top + cloud.parent().scrollTop + "px";
        }
        return;
      }
      quillEditor.active_elem = null;
    });

    /*var wasY = 0;
        $("#quillEditor .quill-wrapper").addEventListener("scroll", function(e) {
            var nowY = e.srcElement.scrollTop;
            var diff = wasY - nowY;
            for (m of $$("#quillEditor .quill-cloud, #quillEditor .table_menu")) {
                m.style.top = Math.round(+m.style.top.replace(/[^0-9-.]/g, '') + diff) + "px";
            }
            wasY = nowY;
        });*/

    window.addEventListener("click", () => {
      quillEditor.fixQLtooltip();
    });
  },
};

registerModalContent(
  `
    <div id="quillEditor" data-expand="true">
        <div class="stretch-vertical">
            <div class="custom-toolbar">
                <span class="title">Edytor bloku</span>
                <button class="btn secondary toggle_size" onclick="quillEditor.toggleQuillSize();" data-tooltip="Ustaw na szerokość bloku / cały ekran"> <i class="fas fa-expand"></i> </button>
                <button class="btn secondary" onclick="hideParentModal(this)">Anuluj <i class="fa fa-times"></i></button>
                <button class="btn primary" onclick="quillEditor.save();hideParentModal(this);">Zapisz <i class="fa fa-save"></i></button>
            </div>
            <div class="quill-wrapper stretch-vertical">
                <div class="quill-editor-container"></div>
                <div class="table_menu">
                    <img onclick="table.insertRowAbove()" src="/img/tableaddtop.png">
                    <img onclick="table.insertRowBelow()" src="/img/tableaddbottom.png">
                    <img onclick="table.insertColumnLeft()" src="/img/tableaddleft.png">
                    <img onclick="table.insertColumnRight()" src="/img/tableaddright.png">
                    <img onclick="table.deleteRow()" src="/img/tabledeleterow.png">
                    <img onclick="table.deleteColumn()" src="/img/tabledeletecolumn.png">
                    <img onclick="table.deleteTable()" src="/img/tabledelete.png">
                </div>
                <div class="image-buttons quill-cloud">
                    <div>
                        Szerokość: <input type='text' autocomplete="off" placeholder='30px, 100%...' id="szerokosc" oninput="quillEditor.modifyNode('width',this.value)" style='width:90px'>
                        Opis ALT: <input type='text' autocomplete="off" placeholder='Słuchawki padmate...' id="imgalt" oninput="quillEditor.modifyNode('alt',this.value)" style='width:180px'>
                    </div>
                    <div style="margin-top:4px">
                        Link: <input type='text' autocomplete="off" placeholder='https://google.com' id="img-href" oninput="quillEditor.modifyNode('data-href',this.value)" style='width:300px'>
                        <div class="btn primary" onclick="window.open($('#img-href').value);">Otwórz <i class="fas fa-external-link-alt"></i></div>
                    </div>
                </div>
                <div class="video-buttons quill-cloud">
                    Link do filmu: <div class="btn primary" onclick="window.open($('#edit_yt_link').value);">Otwórz <i class="fas fa-external-link-alt"></i></div>
                    Szerokość: <input type='text' autocomplete="off" placeholder='30px, 100%...' id="szerokosc_yt" oninput="quillEditor.modifyNode('width',this.value)" style='width:90px'>
                    <br>
                    <input type='text' autocomplete="off" placeholder='https://www.youtube.com/watch?v=...' id="edit_yt_link" oninput="quillEditor.modifyNode('youtube',this.value)" style='margin-top: 4px;width:350px'>
                </div>
                <div class="my-link quill-cloud" style="display: block; left: 296.258px; top: 139.219px;">
                    <div>
                        Link:
                        <input type="text" autocomplete="off" placeholder="https://google.com" id="my-link-href" oninput="quillEditor.modifyNode('mylink',this.value)" style="margin-top: 4px;width:300px">
                    </div>
                    <div>
                        Tytuł:
                        <input type="text" autocomplete="off" id="my-link-title" oninput="quillEditor.modifyNode('mylinktitle',this.value)" style="margin-top: 4px;width:300px">
                    </div>
                    <div style="text-align: center;padding-top: 5px;">
                        <div class="btn primary" onclick="window.open($('#my-link-href').value);">Otwórz <i class="fas fa-external-link-alt"></i></div>
                        <div class="btn primary" onclick="quillEditor.removeLink()">Usuń <i class="fa fa-times"></i></div>
                        <div class="showhover" style="display:inline-block">
                            <div id="my-link-style" class="btn primary">Styl <i class="fas fa-chevron-down"></i></div>
                            <div class="menucontent cms-toolbar-shadow" style="display:flex;flex-direction:column;align-items:stretch">
                                <button type="button" onclick="quillEditor.modifyNode('mylinkstyle','')"> Zwykły </button>
                                <button type="button" onclick="quillEditor.modifyNode('mylinkstyle','przycisk')"> Przycisk </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <link href="/admin/tools/quillEditor.css?v=${RELEASE}" rel="stylesheet">
    </div>
    `,
  () => {
    quillEditor.loaded();
  }
);

registerModalContent(`
    <div id="putVideo" class="form-spacing">
        <div style="width: 100%;max-width: 300px;">
            <div class="custom-toolbar">
                <span class="title">Wstawianie filmu</span>
                <button class="btn secondary" onclick="hideParentModal(this)">Anuluj <i class="fa fa-times"></i></button>
            </div>
            <div style="padding:10px;width:100%;max-width:300px;margin-top: -15px;">
              <span class="field-title">Wklej źródło filmu <i class='fas fa-info-circle' data-tooltip='Z Youtube lub serwera'></i></span>
              <div style="display:flex">
                  <input type="text" id="videoUrl" class="field">
                  <button class="btn primary" onclick="quillEditor.insertVideo($('#videoUrl').value);hideParentModal(this);$('#videoUrl').value=''">Wstaw</button>
              </div>
            </div>
        </div>
    </div>
`);
