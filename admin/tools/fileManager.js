window.fileManager = {
  firstOpen: true, // preload or not?
  target: null,
  callback: null,
  defaultTag: "",
  open: (target = null, params = {}) => {
    fileManager.target = target;
    fileManager.callback = params.callback;

    if (fileManager.firstOpen) {
      fileManager.search();
      fileManager.firstOpen = false;
    }
    fileManager.setTag(null, true);
    showModal("fileManager", { source: nonull(params.source, target) });
  },
  choose: (src) => {
    hideModalTopMost();
    if (fileManager.target) {
      setValue(fileManager.target, src);
    }
    if (fileManager.callback) {
      fileManager.callback(src);
    }
  },
  setDefaultTag: (tag, replaceEmptyOnly = true) => {
    fileManager.defaultTag = tag;
    fileManager.setTag(fileManager.defaultTag, replaceEmptyOnly);
  },
  setTag: (tag = null, replaceEmptyOnly = false) => {
    if (tag === null) {
      tag = fileManager.defaultTag;
    }
    var tagElement = $("#fileManager .tag");
    if (!replaceEmptyOnly || tagElement.value == "") {
      tagElement.value = tag;
    }
  },
  fileAction: (formData, callback = null) => {
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

            var display = "";

            if (image.asset_type == "video") {
              display = `<video src="/${image.file_path}" class="ql-video" controls="true" style='width:100%;height:250px;'></video>`;
            } else {
              display = `<img style='width:100%;height:250px;object-fit:contain' src='/${image.file_path}'>`;
            }

            out += `
                <div class='gallery-item'>
                    ${display}
                    <div class="btn primary" onclick='fileManager.choose("/${image.file_path}")'>Wybierz</div>
                    <div class="btn secondary" onclick='fileManager.delete("/${image.file_path}")'>Usuń</div>

                    <i class='fas fa-info-circle' data-tooltip='Ścieżka: ${image.file_path}<hr>Nazwa: ${image.uploaded_file_name}'></i>
                </div>
            `;
          }
          $("#fileManager .gallery").innerHTML = out;

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
    fileManager.fileAction(formData);
  },
  delete: (src) => {
    if (confirm("Czy aby na pewno chcesz usunąć zdjęcie?")) {
      var formData = new FormData();
      //formData.append("search", $("#search").value);
      formData.append("delete_path", src);
      fileManager.fileAction(formData, () => {
        fileManager.search(src);
      });
    }
  },
  loaded: () => {
    $("#fileManager").addEventListener("submit", (e) => {
      e.preventDefault();

      var input = $("#fileManager [type=file]");
      var files = input.files;
      var formData = new FormData();

      for (let i = 0; i < files.length; i++) {
        let file = files[i];

        formData.append("files[]", file);
      }
      input.value = "";

      formData.append("tag", $("#fileManager .tag").value);
      formData.append("search", $("#search").value);

      fileManager.fileAction(formData);
    });
  },
};

registerModalContent(
  `
    <form id="fileManager" data-expand="true">
        <div class="stretch-vertical">
            <div class="custom-toolbar" style="/*display: flex;background: #eee;padding: 5px;align-items: center;border-bottom: 1px solid #777;*/">
                <i class="fa fa-cloud-upload" style="font-size: 22px;vertical-align: middle;"></i>
                <label style="display:flex;margin: 0 5px;flex-grow: 1;align-items: center;max-width:400px">
                    <span style="margin-right:4px">Nazwa: <i class='fas fa-info-circle' data-tooltip='Stosowanie nazw pozwala na łatwiejsze wyszukiwanie zdjęć'></i></span>
                    <input style="display:inline-block; width: auto;flex-grow: 1" type="text" name="tag" class="tag">
                </label>
                <label style="display:inline-block;margin: 0 5px">
                    <input id="files" type="file" name="files[]" multiple onchange="$('#submitbtn').click()" style="display:none">
                    <input type="submit" id="submitbtn" value="Upload File" name="submit" style="display:none">
                    <div class="btn primary">Wyślij zdjęcie <i class="fas fa-cloud-upload-alt"></i></div>
                </label>

                <label style="display:inline-block;margin: 0 25px">
                    <span>Filtruj galerię: </span>
                    <input style="display:inline-block; width: auto;" type="text" name="search" id="search" oninput="delay('search',500,fileManager)">
                </label>

                <button type="button" class="btn primary" onclick="hideParentModal(this)" style="margin-left: auto">Zamknij <i class="fa fa-times"></i></button>
            </div>

            <div class="gallery">

            </div>
        </div>
        <link href="/admin/tools/fileManager.css?v=${RELEASE}" rel="stylesheet">
    </form>
    `,
  () => {
    fileManager.loaded();
  }
);
