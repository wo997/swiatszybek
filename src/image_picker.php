<form id="imagePicker" method="post" enctype="multipart/form-data"> <!-- deprecated -->
    <div style="display: flex;background: #eee;padding: 5px;align-items: center;border-bottom: 1px solid #777;margin: -5px;">
    <i class="fa fa-cloud-upload" style="font-size: 22px;vertical-align: middle;"></i>
    <label style="display:flex;margin: 0 5px;flex-grow: 1;align-items: center;">
        <span>Tag: </span>
        <input style="display:inline-block; width: auto;flex-grow: 1;" type="text" name="tag" id="tag">
    </label>
    <label style="display:inline-block;margin: 0 5px">
        <input id="files" type="file" name="files[]" accept=".png,.jpg,.jpeg,.gif" multiple onchange="document.getElementById('submitbtn').click()" style="display:none">
        <input type="submit" id="submitbtn" value="Upload File" name="submit" style="display:none">
        <div class="btn primary">Wyślij zdjęcie</div>
    </label>

    <label style="display:inline-block;margin: 0 25px">
        <span>Filtruj wyniki: </span>
        <input style="display:inline-block; width: auto;" type="text" name="search" id="search" oninput="awaitSearch()">
    </label>

    <button type="button" class="btn primary" onclick="toggleModal()" style="margin-left: auto">Zamknij X</button>
    </div>

    <div id="gallery">

    </div>
</form>