<form id="imagePicker" data-expand="true" data-modal>
    <div class="stretch-vertical">
        <div class="custom-toolbar" style="/*display: flex;background: #eee;padding: 5px;align-items: center;border-bottom: 1px solid #777;*/">
            <i class="fa fa-cloud-upload" style="font-size: 22px;vertical-align: middle;"></i>
            <label style="display:flex;margin: 0 5px;flex-grow: 1;align-items: center;max-width:400px">
                <span style="margin-right:4px">Tag: <i class='fas fa-info-circle' data-tooltip='Stosowanie tagów pozwala na łatwiejsze wyszukiwanie zdjęć'></i></span>
                <input style="display:inline-block; width: auto;flex-grow: 1" type="text" name="tag" id="tag">
            </label>
            <label style="display:inline-block;margin: 0 5px">
                <input id="files" type="file" name="files[]" accept=".png,.jpg,.jpeg,.gif" multiple onchange="document.getElementById('submitbtn').click()" style="display:none">
                <input type="submit" id="submitbtn" value="Upload File" name="submit" style="display:none">
                <div class="btn primary">Wyślij zdjęcie <i class="fas fa-cloud-upload-alt"></i></div>
            </label>

            <label style="display:inline-block;margin: 0 25px">
                <span>Filtruj galerię: </span>
                <input style="display:inline-block; width: auto;" type="text" name="search" id="search" oninput="delay('searchImages',500)">
            </label>

            <button type="button" class="btn primary" onclick="hideParentModal(this)" style="margin-left: auto">Zamknij <i class="fa fa-times"></i></button>
        </div>

        <div id="gallery">

        </div>
    </div>
</form>