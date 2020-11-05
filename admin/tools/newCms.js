class newCMS {
  constructor(container) {
    this.container = $(container);
    this.contentNode = this.container.find(`.newCmsContent`);
    this.addBlockBtn = this.container.find(`.addBlockBtn`);

    this.container.insertAdjacentHTML;
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

  mouseMove(event) {
    const mx = event.clientX;
    const my = event.clientY;
    const target = $(event.target);

    let insertWithin = target.findParentByClassName("newCms-block");
    if (insertWithin) {
      insertWithin = insertWithin.find("newCms-block-content");
    } else {
      insertWithin = this.contentNode;
    }

    /*this.addBlockBtn*/

    console.log(insertWithin);
  }

  mouseDown(event) {
    console.log(event);
  }

  contentChange() {
    /*if (!this.contentNode.find(".newCms-block")) {
      this.insertNewCmsBlock("container", { main_container: true });
      return;
    }*/

    this.contentNode.setValue();
  }

  insertNewCmsBlock(type, options) {
    let content = "";
    let className = "";

    if (type == "container") {
      content = "cipka";
      if (options.main_container) {
        className += " newCms-main_container";
      }
    }

    this.contentNode.insertAdjacentHTML(
      "beforeend",
      `
        <div class="newCms-block newCms-${type}${className}">
            <div class="newCms-block-content">${content}</div>
        </div>
      `
    );

    this.contentChange();
  }
}

registerModalContent(
  /*html*/ `
    <div id="newCms" data-expand="large" data-form data-history>
        <div class="stretch-vertical">
            <div class="custom-toolbar">
                <span class="title">
                    Edycja zawartości    
                </span>

                <div class="history-buttons"></div>
                <button class="btn primary" onclick="window.pasteType='container';showModal('pasteBlock')" data-tooltip="Wklej skopiowany kontener / blok"><i class="fas fa-paste"></i></button>
                <button class="btn primary" onclick="copyCMS()" data-tooltip="Skopiuj całą zawartość do schowka"> <i class="fas fa-clipboard"></i> </button>
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

                <div style="width:100%">
                  <div class="scroll-panel scroll-shadow" style="height: 100%;">
                    <div class="addBlockBtn"></div>
                    <div class="newCmsContent" data-type="html" name="content"></div>
                  </div>
                </div>
            </div>
        </div>
        <link href="/admin/tools/newCms.css?v=${CSS_RELEASE}" rel="stylesheet">
    </div>
    `,
  (modal) => {
    window._newCMS = new newCMS(modal);
  }
);
