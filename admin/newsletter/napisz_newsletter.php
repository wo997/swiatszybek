<?php //route[admin/napisz_newsletter] 
?>

<?php startSection("head"); ?>

<title>Newsletter</title>

<script src="https://unpkg.com/computed-style-to-inline-style"></script>


<style>
    .button {
        font-size: 16px;
    }

    .variants>div {
        border: 1px solid #ccc;
        margin: 5px 0;
        padding: 5px 15px 15px;
        background: #fafafa;
    }

    .cont {
        width: 100%;
        max-width: 1100px;
        padding: 10px;
        margin: 30px auto;
        box-sizing: border-box;
        -webkit-box-shadow: 0px 3px 8px 0px rgba(0, 0, 0, 0.14);
        -moz-box-shadow: 0px 3px 8px 0px rgba(0, 0, 0, 0.14);
        box-shadow: 0px 3px 8px 0px rgba(0, 0, 0, 0.14);
    }

    textarea {
        resize: none;
    }

    #modal {
        position: fixed;
        width: 100vw;
        height: 100vh;
        background-color: rgba(0, 0, 0, .4);
        top: 0;
        left: 0;
        opacity: 0;
        display: none;
        transition: opacity .3s;
        -webkit-transition: opacity .3s;
        z-index: 1100000;
    }

    #modal.displayModal {
        opacity: 1;
        display: block;
    }

    .displayModal #slider {
        transform: translateX(-50%) translateY(-50%);
    }

    #slider {
        position: relative;
        top: 50%;
        left: 50%;
        transform: translateX(-50%) translateY(-70%) scale(.9);
        background-color: #f5f5f5;
        max-width: 1000px;
        padding: 7px;
        border-radius: 4px;
        width: calc(100vw - 50px);
        -webkit-transition: transform 300ms cubic-bezier(.290, .000, .410, 1);
        -webkit-transition: transform 300ms cubic-bezier(.290, .000, .410, 1.205);
        -moz-transition: transform 300ms cubic-bezier(.290, .000, .410, 1.205);
        -o-transition: transform 300ms cubic-bezier(.290, .000, .410, 1.205);
        transition: transform 300ms cubic-bezier(.290, .000, .410, 1.205);
        -webkit-transition-timing-function: cubic-bezier(.290, .000, .410, 1);
        -webkit-transition-timing-function: cubic-bezier(.290, .000, .410, 1.205);
        -moz-transition-timing-function: cubic-bezier(.290, .000, .410, 1.205);
        -o-transition-timing-function: cubic-bezier(.290, .000, .410, 1.205);
        transition-timing-function: cubic-bezier(.290, .000, .410, 1.205);
    }

    #gallery>div {
        width: 25%;
        display: block;
        border: 2px solid transparent;
        box-sizing: border-box;
        position: relative;
    }

    #gallery>div>img {
        width: 100%;
        box-sizing: border-box;
        display: block;
    }

    .shift #gallery>div:after {
        content: "Usuń";
        color: black;
        position: absolute;
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        background: #a005;
        color: white;
        font-weight: bold;
        font-size: 20px;
        text-shadow: 0 0 1px black;
        left: 0;
        top: 0;
    }

    #gallery {
        height: calc(100vh - 200px);
        overflow-y: auto;
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        margin: 13px 0;
    }

    .colorpicker {
        display: flex;
        align-items: center;
        padding-left: 10px;
    }

    .colorpicker * {
        vertical-align: middle;
    }

    .colorpicker input[type=color] {
        display: none;
    }

    .color-border {
        display: inline-block;
        width: 30px;
        margin-right: 5px;
        border: 1px solid #ccc !important;
    }

    .jscolor {
        color: transparent !important;
        display: block;
        border: none !important;
    }

    .colorpicker>div:last-child {
        width: 24px;
        height: 24px;
        display: inline-block;
        margin-left: 5px;
        margin-top: 17px;
    }

    .colorpicker .button {
        font-size: 14px;
        padding: 3px;
        margin-right: 5px;
        margin-left: 5px;
    }

    .zdjecia .wrapper {
        max-width: 50%;
        display: inline-block;
        margin: 10px 5px;
        position: relative;
        vertical-align: middle;
    }

    .delete {
        position: absolute;
        top: 0;
        right: 0;
        color: white;
    }

    .zdjecia img {
        max-width: 100%;
        max-height: 120px;
    }

    .unpublished {
        opacity: 0.5;
        background: #a88;
        max-height: 32px;
        overflow: hidden;
    }

    .unpublished h2 {
        text-decoration: line-through;
    }

    h2 {
        margin: 10px 0;
        font-size: 17px;
    }

    .copy_price {
        display: flex;
    }

    .copy_price input {
        margin: 3px;
    }

    .wybierz {
        width: auto;
        display: inline-block;
        font-size: 16px;
        padding: 4px;
    }

    #kategorie>div,
    #modele>div {
        padding: 2px;
        margin-top: 3px;
        background: white;
        display: flex;
        justify-content: space-between;
    }

    .red {
        color: white;
        background: #c66;
        font-weight: bold;
        margin-left: 5px;
        width: 18px;
        text-align: center;
        border-radius: 3px;
        cursor: pointer;
    }

    .btn secondary {
        background: white;
    }

    input[type=radio] {
        -webkit-appearance: radio !important;
        width: auto;
        display: inline-block;
    }

    .shorten_price input {
        width: 120px;
    }

    .sticky-wrapper {
        display: flex;
        justify-content: space-between;
        align-items: center;
        text-align: right;
        position: sticky;
        top: 0;
        background: #eef;
        border-bottom: 1px solid #ccc;
        margin: -10px -10px 0;
        padding: 10px;
        z-index: 10000;
    }

    body {
        overflow: visible;
    }

    #editor.ql-fullscreen {
        top: 70px;
        min-height: calc(100% - 72px);
        max-height: calc(100% - 72px);
        z-index: 10000000;
    }
</style>
<script>
    var awaitId;

    function awaitSearch() {
        clearTimeout(awaitId);
        awaitId = setTimeout(function() {
            searchImages();
        }, 400);
    }

    function toggleModal() {
        var m = document.getElementById("modal");
        return m.classList.toggle("displayModal");
    }
    var firstOpen = true;
    var target = "";

    function imagePicker(t) {
        var selection = quill.getSelection();
        cursorIndex = 0; //quill.getLength();
        if (selection && selection.index) {
            cursorIndex = selection.index;

            var s = getSelection();

            if (s.focusNode.parentNode.innerText.length == s.focusOffset && findBlock(s.focusNode)) {
                s.focusNode.parentNode.innerHTML += " ";
            }
        }

        var tag = document.getElementById("tag");
        if (tag.value == "")
            tag.value = "<?= $title0 ?>";
        target = t;
        toggleModal();
        if (firstOpen) {
            searchImages();
            firstOpen = false;
        }
    }

    window.addEventListener("DOMContentLoaded", function() {
        document.getElementById('imagePicker').addEventListener('submit', e => {
            e.preventDefault();

            const files = $('[type=file]').files;
            const formData = new FormData();

            for (let i = 0; i < files.length; i++) {
                let file = files[i];

                formData.append('files[]', file);
            }

            formData.append('tag', document.getElementById("tag").value);
            formData.append('search', document.getElementById("search").value);

            imageXHR(formData);
        });
    });

    var cursorIndex = 0;

    function chooseImage(src) {
        if (shiftDown) {
            searchImages(src);
            return;
        }


        toggleModal();

        if (target == "quill") {
            quill.insertEmbed(cursorIndex, 'image', src);
        } else if (target.length > 8 && target.substr(0, 8) == "zdjecia-") {
            var id = target.substr(8);
            document.getElementById("zdjecia-" + id).insertAdjacentHTML("beforeEnd",
                '<div class="wrapper"><img src="' + src + '"><div class="delete red" onclick="deleteImg(this,' + id + ')">X</div></div>'
            );
            updateZdjeciaRow(id);
        } else {
            document.getElementById(target).src = src;
            document.getElementById(target + '-src').value = src;

            if (target == "img-main") {
                var i = 0;
                while (i < 100) {
                    var p = document.getElementById("img-variant" + i);
                    if (!p) break;
                    var s = document.getElementById("img-variant" + i + "-src");
                    if (!s) break;
                    i++;
                    if (s.value != "") continue;
                    p.src = src;
                    s.value = src;
                }
            }
        }
    }

    function deleteImg(obj, variantId) {
        obj.parentNode.parentNode.removeChild(obj.parentNode);
        updateZdjeciaRow(variantId);
    }

    function searchImages(alsoDelete) {
        const formData = new FormData();
        formData.append('search', document.getElementById("search").value);
        if (alsoDelete) {
            formData.append('alsoDelete', alsoDelete);
        }
        imageXHR(formData);
    }

    function imageXHR(formData) {
        var xhr = new XMLHttpRequest();
        xhr.open('POST', "/admin/processImage", true);
        xhr.onload = function() {
            if (xhr.status == 200) {
                try {
                    images = JSON.parse(xhr.responseText);
                    var out = "";
                    var replaceImg = $(".replaceThatImagePlease");
                    for (i = 0; i < images.length; i++) {
                        if (i == 0 && replaceImg) {
                            replaceImg.src = images[i];
                            replaceImg.classList.remove("replaceThatImagePlease");
                        }
                        out += "<div onclick='chooseImage(\"<?= $SITE_URL ?>" + images[i] + "\")'><img src='<?= $SITE_URL ?>" + images[i] + "'></div>";
                    }
                    document.getElementById('gallery').innerHTML = out;
                } catch (e) {}
            }
        };
        xhr.send(formData);
    }

    function formValidate() {
        $$("#editor .ql-editor *").forEach((e) => {
            s = getComputedStyle(e);

            //var w = e.style.width;
            //var h = e.style.height;
            //console.log(getComputedStyle(e)["text-align"]);
            for (let key in s) {
                if ([
                        "fontSize",
                        "textAlign",
                        "border",
                        "padding",
                        "margin",
                        "color",
                        "background",
                        "backgroundColor",
                        "fontStyle",
                        "fontWeight",
                        "textDecotation"
                    ].indexOf(key) == -1) continue;
                let prop = key.replace(/\-([a-z])/g, v => v[1].toUpperCase());
                e.style[prop] = s[key];
            }
            //e.style.width = w;
            //e.style.height = h;
        });

        document.getElementById("description").value = $(".quill-1 .ql-editor").innerHTML;

        return validateForm({
            form: $("#mainForm")
        });
        /*var req = document.getElementsByClassName("required");
        for (i = 0; i < req.length; i++) {
            var input = req[i];
            if (input.value < 0.5 || input.value == "") {
                input.style.borderColor = "red";
                input.oninput = function() {
                    this.style.borderColor = "";
                }
                return false;
            }
        }*/
    }
</script>

<?php startSection("content"); ?>

<form class="default-form" id="mainForm" action="/admin/send_newsletter" method="post" onsubmit="return formValidate()">

    <h3 style="text-align:center">Newsletter</h3>

    <label>
        <span>Tytuł maila</span>
        <input type="text" data-validate name="title">
    </label>

    <label>
        <span>Treść</span>
    </label>
    <div id="editor" class="quill-wrapper quill-1">
        <div id="description-quill"><?= $description ?></div>
        <p id="delta-view"></p>

        <script>
            var shiftDown = false;
            var anyChange = false;
            window.addEventListener("DOMContentLoaded", function() {

                $("form").onchange = function() {
                    anyChange = true;
                }

                window.onbeforeunload = function(e) {
                    if (anyChange) return 'Wszystkie zmiany zostaną utracone!';
                }

                window.addEventListener("keydown", (e) => {
                    anyChange = true;
                    if (e.shiftKey) {
                        shiftDown = true;
                        $("body").classList.add("shift");
                    }
                });

                window.addEventListener("keyup", (e) => {
                    shiftDown = false;
                    $("body").classList.remove("shift");
                })
            });

            Quill.register({
                    'modules/better-table': quillBetterTable,
                },
                true,
            );

            let Inline = Quill.import('blots/inline');

            class SpanBlock extends Inline {
                static create(value) {
                    let node = super.create();
                    node.setAttribute('class', 'spanblock');
                    //node.innerHTML += " ";
                    return node;
                }
            }
            SpanBlock.blotName = 'spanblock';
            //SpanBlock.tagName = 'div';
            SpanBlock.tagName = 'block'; // div breaks table
            Quill.register(SpanBlock);

            var menu_sub = null;
            var active_elem = null;

            var quill = new Quill('#description-quill', {
                theme: 'snow',
                modules: {
                    'syntax': true,
                    'toolbar': [
                        [{
                            'size': []
                        }],
                        ['bold', 'italic', 'underline', 'strike'],
                        [{
                            'color': []
                        }, {
                            'background': []
                        }],
                        [ /*{ 'list': 'ordered' }, { 'list': 'bullet'}, */ {
                            'indent': '-1'
                        }, {
                            'indent': '+1'
                        }],
                        [{
                            'header': '1'
                        }, {
                            'header': '2'
                        }, {
                            'header': '3'
                        }],
                        [{
                            'align': []
                        }],
                        ['link', 'image', 'video', 'formula'],
                        ['clean'],
                        /*['table'],*/
                        ['spanblock'],
                    ],
                    table: false,
                    'better-table': {
                        operationMenu: {
                            items: {
                                /*unmergeCells: {
                                    text: 'Another unmerge cells name',
                                },*/
                            },
                            color: {
                                colors: ['#eee', 'red', 'yellow', 'blue', 'white', 'black'],
                                text: 'Background Colors:',
                            },
                        },
                    }
                },
            });

            $(".quill-1 .ql-image").outerHTML += "";
            setTimeout(function() {
                $(".quill-1 .ql-image").onclick = function() {
                    imagePicker('quill')
                };
            }, 100);

            $(".quill-1 .ql-toolbar").insertAdjacentHTML("beforeend", `
            <div class="image-buttons" style="display:none;float:right">
                Wpisz szerokość zdjęcia: <input type='text' placeholder='30px, 100%...' id="szerokosc" oninput="fixImg(this.value)" style='width:100px'>
            </div>

            <input type='text' placeholder='Wklej tekst do zaznaczenia...' oninput="paste(this)" style='width:200px;vertical-align: top;'>
            `);

            $(".quill-1 .ql-toolbar").insertAdjacentHTML("afterbegin", `
            <button type="button" title="Tryb pełnoekranowy" id="run-fullscreen"><i class="fas fa-expand"></i><i class="fas fa-compress"></i></button>

            
            `);

            let tableModule = quill.getModule('better-table')

            function insertTable() {
                tableModule.insertTable(1, 2);
            }

            function findBlock(elem) {
                while (true) {
                    if (!elem) return false;
                    if (elem.classList) {
                        if (elem.classList.contains("ql-editor")) return false;
                        else if (elem.classList.contains("spanblock")) {
                            return elem;
                        }
                    }

                    elem = elem.parentNode;
                }
            }

            function findTD(elem) {
                while (true) {
                    if (!elem) return false;
                    if (elem.classList) {
                        if (elem.classList.contains("ql-editor")) return false;
                        else if (elem.tagName == "TD") {
                            return elem;
                        }
                    }

                    elem = elem.parentNode;
                }
            }

            function makeIconWidth() {
                var selection = getSelection();
                var block = findBlock(selection.focusNode);
                if (!block) return;
                block.classList.toggle("my-icon");
            }


            function setAsLabel() {
                var selection = getSelection();
                var block = findBlock(selection.anchorNode);
                if (!block) return;

                block.classList.toggle("icon-label");
            }

            function capitalize() {
                var selection = getSelection();
                var block = findBlock(selection.anchorNode);
                if (!block) return;

                block.classList.toggle("capitalize");
            }

            function isInTable(elem) {
                if (elem) {
                    while (true) {
                        elem = elem.parentNode;
                        if (!elem || elem.className == "ql-editor") return false;
                        if (elem.tagName == "TABLE") {
                            return true;
                        }
                    }
                }
            }


            $('#run-fullscreen').addEventListener('click', function() {
                var res = $(".quill-wrapper").classList.toggle("ql-fullscreen");
                $("html").style.overflow = res ? "hidden" : "";
            });

            function makeCellPadding() {
                var selection = getSelection();
                if (selection) {
                    var elem = selection.anchorNode;
                    if (elem) {
                        while (true) {
                            elem = elem.parentNode;
                            if (!elem || elem.className == "ql-editor") break;
                            if (elem.tagName == "TD") {
                                elem.classList.toggle("cell-padding");
                                pushHistoryState();
                                break;
                            }
                        }
                    }
                }
            }

            function tableResponsive(level) {
                var selection = getSelection();
                if (selection) {
                    var elem = selection.anchorNode;
                    if (elem) {
                        while (true) {
                            elem = elem.parentNode;
                            if (!elem || elem.className == "ql-editor") break;
                            if (elem.tagName == "TABLE") {
                                if (level == 2) {
                                    elem.classList.add("table-responsive");
                                    elem.classList.add("table-responsive-2");
                                    elem.classList.remove("table-responsive-1");
                                }
                                if (level == 1) {
                                    elem.classList.add("table-responsive");
                                    elem.classList.add("table-responsive-1");
                                    elem.classList.remove("table-responsive-2");
                                }
                                if (level == 0) {
                                    elem.classList.remove("table-responsive");
                                    elem.classList.remove("table-responsive-1");
                                    elem.classList.remove("table-responsive-2");
                                }
                                pushHistoryState();
                                tableType();
                                break;
                            }
                        }
                    }
                }
            }

            function addBlock(next) {
                var s = getSelection();
                var block = findBlock(s.focusNode);

                if (block) {
                    if (next == -1) {
                        block.insertAdjacentHTML("beforebegin", " <div class='spanblock'> </div> ");
                    } else {
                        block.insertAdjacentHTML("afterend", " <div class='spanblock'> </div> ");
                    }
                } else {
                    var block = findTD(s.focusNode);
                    if (block) {
                        if (next == -1) {
                            block.insertAdjacentHTML("afterbegin", " <div class='spanblock'> </div> ");
                        } else {
                            block.insertAdjacentHTML("beforeend", " <div class='spanblock'> </div> ");
                        }
                    } else {
                        var block = s.focusNode;
                        if (block && !block.classList) block = block.parentNode;
                        if (next == -1) {
                            block.insertAdjacentHTML("beforebegin", " <div class='spanblock'> </div> ");
                        } else {
                            block.insertAdjacentHTML("afterend", " <div class='spanblock'> </div> ");
                        }
                    }
                }
                pushHistoryState();
            }

            function justBox() {
                direction = 0;
                spanBlockButton.click();
            }

            var prevSel = null;
            var wasInTable = false;
            var wasFocus = false;

            var first = true;

            var previousSelection = null;
            var wasSelection = null;

            quill.on('text-change', function(delta, oldDelta, source) {

                $$("#description-quill .ql-editor img").forEach((e) => {
                    if (e.src.indexOf("data:image/") === 0) {
                        const formData = new FormData();
                        formData.append('tag', "newsletter");
                        formData.append('base64', e.src);
                        e.classList.add("replaceThatImagePlease");
                        imageXHR(formData);
                    }
                })

                var c = $$("colgroup");
                for (a = 0; a < c.length; a++) {
                    var b = c[a].children;

                    var count = c[a].nextSibling.children[0].children.length;

                    for (i = 0; i < count; i++) {
                        if (b[i])
                            b[i].removeAttribute("width");
                    }
                    for (i = count; i < b.length; i++) {
                        if (b[i])
                            b[i].parentNode.removeChild(b[i]);
                    }
                }

                $(".quill-1 .ql-editor").scrollLeft = 0;

                if ($("#description-quill .ql-editor").innerHTML.indexOf('<div class="quill-better') === 0) {
                    $(".quill-1 .ql-editor").insertAdjacentHTML("afterbegin", "<p class='detected'><br></p>");
                }

                quill.history.clear();

                if (ignoreChange) return;

                scaleVideos();

                $$("span div.spanblock").forEach((e) => {
                    e.parentNode.classList.add("wrap-spanblock")
                });
                $$(".wrap-spanblock .spanblock").forEach((e) => {
                    e.outerHTML = e.innerHTML
                });
                $$(".wrap-spanblock").forEach((e) => {
                    e.outerHTML = '<div class="spanblock">' + e.outerHTML.replace(/(<([^>]+)>)/ig, "") + '</div>';
                });

                pushHistoryState();

                previousSelection = wasSelection;
                wasSelection = quill.getSelection();

                wasInTable = isInTable(getSelection().focusNode);

                var sel = getSelection();
                if (sel) wasFocus = sel;
            });


            var wasY = 0;
            document.getElementById("editor").addEventListener("scroll", function(e) {
                var nowY = e.srcElement.scrollTop;

                var diff = wasY - nowY;
                var m = $(".qlbt-operation-menu");
                if (m) {
                    m.style.top = Math.round(+m.style.top.replace(/[^0-9]/g, '') + diff) + "px";
                }

                wasY = nowY;
            });

            function selectElementContents(el) {
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
            }

            $(".quill-1 .ql-editor").addEventListener("click", (e) => {

                $(".image-buttons").style.display = "none";

                active_elem = e.target;
                if (e.target.tagName == "IMG") {
                    menu_sub = 'img';
                    $(".image-buttons").style.display = "block";
                    document.getElementById("szerokosc").value = active_elem.style.width;
                    selectElementContents(e.target);
                    return;
                }
                active_elem = null;
            });

            function fixImg(v) {
                if (!active_elem) return;
                active_elem.style.width = v;
            }

            var quillHistory = [];

            var ignoreChange = false;

            function historyBack(callback) {
                if (quillHistory.length >= 2) {
                    ignoreChange = true;
                    var c = quillHistory[quillHistory.length - 2];
                    $(".quill-1 .ql-editor").innerHTML = c[0];

                    var ind = wasSelection ? wasSelection.index : (previousSelection ? previousSelection.index : 0);
                    ignoreChange = false;
                    quill.setSelection({
                        index: ind,
                        length: 0
                    });
                    quillHistory.splice(quillHistory.length - 1, 1);
                }
            }

            function pushHistoryState() {
                if (ignoreChange) return;
                quillHistory.push([$(".quill-1 .ql-editor").innerHTML, quill.getSelection()]);
                if (quillHistory.length < 2) {
                    quillHistory.push([$(".quill-1 .ql-editor").innerHTML, quill.getSelection()]);
                }
                while (quillHistory.length > 50) {
                    quillHistory.splice(0, 1);
                }
            }

            var wasSel = null;
            quill.on('selection-change', function(range, oldRange, source) {
                if (range)
                    wasSel = range;
            });

            function paste(obj) {
                var s = wasSel;
                if (!s) return;
                quill.insertText(s.index, obj.value);
                obj.value = "";
            }

            $(".quill-1 .ql-editor").addEventListener("keydown", function(e) {

                if (e.shiftKey && e.key == "z") {
                    historyBack(null);
                }
                if (e.shiftKey && e.key == "Z") {
                    historyBack(null);
                }

                return;
            });

            function tableType() {
                var selection = getSelection();
                if (selection) {
                    var elem = selection.anchorNode;
                    if (elem) {
                        while (true) {
                            elem = elem.parentNode;
                            if (!elem || elem.className == "ql-editor") return;
                            if (elem.tagName == "TABLE") {

                                var t = 0;
                                if (!elem.classList.contains("table-responsive")) {
                                    t = 0;
                                } else if (elem.classList.contains("table-responsive-1")) {
                                    t = 1;
                                } else {
                                    t = 2;
                                }

                                for (i = 0; i < 3; i++) {
                                    var e = $(".res" + i);
                                    if (!e) continue;
                                    e.style.background = i == t ? "#55f" : "";
                                }

                                return;
                            }
                        }
                    }
                }
            }

            var config = {
                childList: true,
                subtree: true
            }
            var observer = new MutationObserver(() => {
                tableType();

                var tool = $('.qlbt-col-tool:not(.changed)');
                if (!tool) return;
                tool.classList.add('changed');
                tool.innerHTML = `
                <button class='res0' title="Brak responsywności" type="button" style="width:auto" onclick="tableResponsive(0)"><i class="fas fa-mobile-alt"></i> -</button>
                <button class='res1' title="Na telefonie każda kolumna będzie miała 100% szerokości" type="button" style="width:auto" onclick="tableResponsive(1)"><i class="fas fa-mobile-alt"></i> 100%</button>
                <button class='res2' title="Na telefonie każda kolumna będzie miała 50% szerokości" type="button" style="width:auto" onclick="tableResponsive(2)"><i class="fas fa-mobile-alt"></i> 50%</button>
                <button title="Dodaj odstępy w tej komórce tabeli" type="button" style="width:auto" onclick='makeCellPadding()'><div style="border: 4px solid black;width: 14px;height: 14px;"></div></button>
                `; //<button title="Szara tabelka" type="button" style="width:auto" id="make-table-gray"><div style="border: 1px solid black;width: 14px;height: 14px;background:#888"></div></button>`;

            });
            observer.observe($('.quill-1'), config);

            var spanBlockButton = $('.ql-spanblock');

            var des = `<?= str_replace(["\`", "`"], ["`", "\`"], $description) ?>`;

            $(".quill-1 .ql-editor").innerHTML = des; // necessary
        </script>
    </div>

    <textarea id="description" name="description" class="required" style="display:none"><?= htmlspecialchars($description) ?></textarea>

    <!--<input type="button" onclick="sendSome()" class="btn primary big" style="padding: 2px 4px;" value="Wyślij do mnie" onclick="anyChange=false">-->
    <div style="text-align:right">
        <button type="submit" class="btn primary medium" onclick="anyChange=false">Wyślij <i class="fas fa-paper-plane"></i></button>
    </div>
</form>

<div id="modal">
    <div id="slider">
        <form id="imagePicker" method="post" enctype="multipart/form-data">
            <div style="display: flex;background: #eee;padding: 5px;align-items: center;border-bottom: 1px solid #777;margin: -5px;">
                <i class="fa fa-cloud-upload" style="font-size: 22px;vertical-align: middle;"></i>
                <label style="display:flex;margin: 0 5px;flex-grow: 1;align-items: center;">
                    <span>Tag: </span>
                    <input style="display:inline-block; width: auto;flex-grow: 1;" type="text" name="tag" id="tag" value="newsletter">
                </label>
                <label style="display:inline-block;margin: 0 5px">
                    <input id="files" type="file" name="files[]" accept=".png,.jpg,.jpeg,.gif" multiple onchange="document.getElementById('submitbtn').click()" style="display:none">
                    <input type="submit" id="submitbtn" value="Upload File" name="submit" style="display:none">
                    <div class="btn primary big">Wyślij zdjęcie</div>
                </label>

                <label style="display:inline-block;margin: 0 25px">
                    <span>Filtruj wyniki: </span>
                    <input style="display:inline-block; width: auto;" type="text" name="search" id="search" oninput="awaitSearch()">
                </label>

                <input type="button" class="btn primary big" value="Zamknij X" onclick="toggleModal()" style="margin-left: auto">
            </div>

            <div id="gallery">

            </div>
        </form>
    </div>
</div>


<?php include "admin/default_page.php"; ?>