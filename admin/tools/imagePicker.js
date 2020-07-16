window.imagePicker = {
    firstOpen: true, // preload or not?
    callback: null,
    defaultTag: "",
    open: (callback) => {
        imagePicker.callback = callback;
        showModal("imagePicker", {ontop: true});
        if (imagePicker.firstOpen) {
            imagePicker.search();
            imagePicker.firstOpen = false;
        }
        imagePicker.setTag(null,true);
    },
    choose: (src) => {
        hideModalTopMost();
        imagePicker.callback(src);
    },
    setDefaultTag: (tag, replaceEmptyOnly = true) => {
        imagePicker.defaultTag = tag;
        imagePicker.setTag(imagePicker.defaultTag, replaceEmptyOnly);
    },
    setTag: (tag = null, replaceEmptyOnly = false) => {
        if (tag === null) {
            tag = imagePicker.defaultTag;
        }
        var tagElement = elem("#imagePicker .tag");
        if (!replaceEmptyOnly || tagElement.value == "") {
            tagElement.value = tag;
        }
    },
    imageAction: (formData) => {
        xhr({
            url: "/admin/upload_images",
            formData: formData,
            success(res) {
                try {
                    images = JSON.parse(res);
                    var out = "";
                    var replaceImg = elem(".replaceThatImagePlease");
                    var counter = -1;
                    for (image of images) {
                        counter++;
                        if (counter == 0 && replaceImg) {
                            replaceImg.src = `/uploads/df/${image.path}`;
                            replaceImg.classList.remove("replaceThatImagePlease");
                        }
                        out += `
                            <div class='gallery-item'>
                                <div class="item-image" style='width:100%;height:250px;background-image:url("/uploads/df/${image.path}")'></div>
                                <div class="btn primary" onclick='imagePicker.choose("${image.path}")'>Wybierz</div>
                                <div class="btn secondary" onclick='imagePicker.delete("${image.path}")'>Usuń</div>
                            </div>
                        `;
                    }
                    elem("#imagePicker .gallery").innerHTML = out;
                } catch (e) {
                    //console.log(e);
                }
            }
        });
    },
    search: () => {
        var formData = new FormData();
        formData.append('search', elem("#search").value);
        imagePicker.imageAction(formData);
    },
    delete: (src) => {
        if (confirm("Czy aby na pewno chcesz usunąć zdjęcie?")) {
            var formData = new FormData();
            formData.append('search', elem("#search").value);
            formData.append('alsoDelete', src);
            imagePicker.imageAction(formData);

            imagePicker.search(src);
        }
    },
    loaded: () => {
        elem('#imagePicker').addEventListener('submit', e => {
            e.preventDefault();
    
            var input = elem('#imagePicker [type=file]');
            var files = input.files;
            var formData = new FormData();
    
            for (let i = 0; i < files.length; i++) {
                let file = files[i];
    
                formData.append('files[]', file);
            }
            input.value = "";

            formData.append('tag', elem("#imagePicker .tag").value);
            formData.append('search', elem("#search").value);
    
            imagePicker.imageAction(formData);
        });
    }
};

registerModalContent(`
    <form id="imagePicker" data-expand="true">
        <div class="stretch-vertical">
            <div class="custom-toolbar" style="/*display: flex;background: #eee;padding: 5px;align-items: center;border-bottom: 1px solid #777;*/">
                <i class="fa fa-cloud-upload" style="font-size: 22px;vertical-align: middle;"></i>
                <label style="display:flex;margin: 0 5px;flex-grow: 1;align-items: center;max-width:400px">
                    <span style="margin-right:4px">Tag: <i class='fas fa-info-circle' data-tooltip='Stosowanie tagów pozwala na łatwiejsze wyszukiwanie zdjęć'></i></span>
                    <input style="display:inline-block; width: auto;flex-grow: 1" type="text" name="tag" class="tag">
                </label>
                <label style="display:inline-block;margin: 0 5px">
                    <input id="files" type="file" name="files[]" accept=".png,.jpg,.jpeg,.gif" multiple onchange="document.getElementById('submitbtn').click()" style="display:none">
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
    `, ()=>{imagePicker.loaded()}
);