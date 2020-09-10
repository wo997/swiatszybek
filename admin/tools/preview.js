window.preview = {
  open: (url, params) => {
    $(`#preview .preview_form`).setAttribute("action", url);
    $(`#preview .preview_form [name="preview_params"]`).value = JSON.stringify(
      params
    );
    showModal("preview");
    $("#preview .preview_form").submit();
  },
  setSize: (width = "", height = "") => {
    var e = $(`[name="preview_iframe"]`);
    e.style.width = width;
    e.style.height = height;
    $(".preview_form").submit();
  },
};

registerModalContent(
  `
    <div id="preview" class="hugeModalDesktop" data-modal>
        <div class="modal-body stretch-vertical">
            <div class="custom-toolbar">
                <span class="title">
                    Podgląd strony
                    <button class="btn admin-primary" onclick="window.preview.setSize('','')">Komputer <i class="fas fa-desktop"></i></button>
                    <button class="btn admin-primary" onclick="window.preview.setSize('410px','850px')">Telefon <i class="fas fa-mobile-alt"></i></button>
                    <button class="btn admin-primary" onclick="window.preview.setSize('340px','568px')">iPhone SE <i class="fas fa-mobile-alt"></i> <i class='fas fa-info-circle' data-tooltip='Najmniejsza rozdzielczość z urządzeń mobilnych'></i></button>
                </span>
                <button class="btn admin-primary" onclick="hideParentModal(this)">Ukryj <i class="fa fa-times"></i></button>
            </div>
            <div style="margin: -10px;height: 100%;margin-top: 0;display:flex">
                <iframe name="preview_iframe"></iframe>
            </div>
        </div>
        <form class="preview_form" method="post" target="preview_iframe">
            <input type="text" name="preview_params">
        </form>
        <link href="/admin/tools/preview.css?v=${RELEASE}" rel="stylesheet">
    </div>
    `
);
