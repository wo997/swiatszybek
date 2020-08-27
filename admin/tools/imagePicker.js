window.imagePicker = {
  firstOpen: true, // preload or not?
  target: null,
  callback: null,
  defaultTag: "",
  open: (target = null, params = {}) => {
    imagePicker.target = target;
    imagePicker.callback = params.callback;

    if (imagePicker.firstOpen) {
      imagePicker.search();
      imagePicker.firstOpen = false;
    }
    imagePicker.setTag(null, true);
    showModal("imagePicker", { source: nonull(params.source, target) });
  },
  choose: (src) => {
    hideModalTopMost();
    if (imagePicker.target) {
      setValue(imagePicker.target, src);
    }
    if (imagePicker.callback) {
      imagePicker.callback(src);
    }
  },
  setDefaultTag: (tag, replaceEmptyOnly = true) => {
    imagePicker.defaultTag = tag;
    imagePicker.setTag(imagePicker.defaultTag, replaceEmptyOnly);
  },
  setTag: (tag = null, replaceEmptyOnly = false) => {
    if (tag === null) {
      tag = imagePicker.defaultTag;
    }
    var tagElement = $("#imagePicker .tag");
    if (!replaceEmptyOnly || tagElement.value == "") {
      tagElement.value = tag;
    }
  },
  imageAction: (formData, callback = null) => {
    xhr({
      url: "/admin/uploads_action",
      formData: formData,
      success(images) {
        try {
          var out = "";
          var counter = 0;
          for (image of images) {
            counter++;

            var replaceImg = $(`[upload_image="${counter}"]`);
            if (replaceImg) {
              replaceImg.src = "/" + image.file_path;
              replaceImg.removeAttribute("upload_image");
            }
            out += `
                <div class='gallery-item'>
                    <div class="item-image" style='width:100%;height:250px;background-image:url("/${image.file_path}")'></div>
                    <div class="btn primary" onclick='imagePicker.choose("/${image.file_path}")'>Wybierz</div>
                    <div class="btn secondary" onclick='imagePicker.delete("/${image.file_path}")'>Usuń</div>
                </div>
            `;
          }
          $("#imagePicker .gallery").innerHTML = out;

          if (callback) {
            callback();
          }
        } catch (e) {
          //console.log(e);
        }
      },
    });
  },
  search: () => {
    var formData = new FormData();
    formData.append("search", $("#search").value);
    imagePicker.imageAction(formData);
  },
  delete: (src) => {
    if (confirm("Czy aby na pewno chcesz usunąć zdjęcie?")) {
      var formData = new FormData();
      //formData.append("search", $("#search").value);
      formData.append("delete_path", src);
      imagePicker.imageAction(formData, () => {
        imagePicker.search(src);
      });
    }
  },
  loaded: () => {
    $("#imagePicker").addEventListener("submit", (e) => {
      e.preventDefault();

      var input = $("#imagePicker [type=file]");
      var files = input.files;
      var formData = new FormData();

      for (let i = 0; i < files.length; i++) {
        let file = files[i];

        formData.append("files[]", file);
      }
      input.value = "";

      formData.append("tag", $("#imagePicker .tag").value);
      formData.append("search", $("#search").value);

      imagePicker.imageAction(formData);
    });
  },
};

registerModalContent(
  `
    <form id="imagePicker" data-expand="true">
        <div class="stretch-vertical">
            <div class="custom-toolbar" style="/*display: flex;background: #eee;padding: 5px;align-items: center;border-bottom: 1px solid #777;*/">
                <i class="fa fa-cloud-upload" style="font-size: 22px;vertical-align: middle;"></i>
                <label style="display:flex;margin: 0 5px;flex-grow: 1;align-items: center;max-width:400px">
                    <span style="margin-right:4px">Tag: <i class='fas fa-info-circle' data-tooltip='Stosowanie tagów pozwala na łatwiejsze wyszukiwanie zdjęć'></i></span>
                    <input style="display:inline-block; width: auto;flex-grow: 1" type="text" name="tag" class="tag">
                </label>
                <label style="display:inline-block;margin: 0 5px">
                    <input id="files" type="file" name="files[]" multiple onchange="$('#submitbtn').click()" style="display:none">
                    <input type="submit" id="submitbtn" value="Upload File" name="submit" style="display:none">
                    <div class="btn primary">Wyślij zdjęcie <i class="fas fa-cloud-upload-alt"></i></div>
                </label>

                <label style="display:inline-block;margin: 0 25px">
                    <span>Filtruj galerię: </span>
                    <input style="display:inline-block; width: auto;" type="text" name="search" id="search" oninput="delay('search',500,imagePicker)">
                </label>

                <button type="button" class="btn primary" onclick="hideParentModal(this)" style="margin-left: auto">Zamknij <i class="fa fa-times"></i></button>
            </div>

            <div class="gallery">

            </div>
        </div>
        <link href="/admin/tools/imagePicker.css?v=${RELEASE}" rel="stylesheet">
    </form>
    `,
  () => {
    imagePicker.loaded();
  }
);
