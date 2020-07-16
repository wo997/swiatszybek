<?php //->[admin/slider] ?>

<?php startSection("head"); ?>

<title>Slider</title>

<style>
    .ql-editor {
        font-size: 20px;
    }

    .typ {
        padding: 5px;
        background: #eee;
    }

    .typ .number {
        font-weight: bold;
    }

    .model {
        padding: 5px;
        padding-left: 70px;
        border-bottom: 1px solid #ccc;
    }

    .model:before {
        content: "●";
    }

    .number {
        width: 30px;
        border: none !important;
        margin-right: 5px;
        text-align: center;
        background: transparent;
    }

    #typy input {
        padding: 2px 4px;
    }

    .remove {
        background: #f44;
        color: white;
    }

    .unpublished {
        background: #fcc;
        filter: contrast(0.5);
    }

    .slide-img {
        max-width: 500px;
        display: block;
        margin-top: 8px;
    }

    .typ-wrapper {
        margin: 3px;
    }
</style>
<script>

    useTool("quillEditor");

    window.addEventListener("load",()=>{
        imagePicker.setDefaultTag("slider");
    });

    function showNextVariant() {
        var aaa = document.querySelectorAll(".typ-wrapper");

        for (i = 0; i < aaa.length; i++) {
            d = aaa[i];

            if (d.style.display == "none") {
                d.style.display = "";
                break;
            }
        }
    }

    function swap_div(e, dir) {
        var sibling = dir == -1 ? e.previousSibling : e.nextSibling;
        if (!sibling || !sibling.className || sibling.style.display != "") return;
        if (dir == -1)
            e.parentNode.insertBefore(e, sibling);
        else
            e.parentNode.insertBefore(e, sibling.nextSibling);

        var i1 = 1,
            child = e;
        while ((child = child.previousSibling) != null) i1++;

        var i2 = 1,
            child = sibling;
        while ((child = child.previousSibling) != null) i2++;

        var k = document.getElementsByClassName("kolejnosc");
        for (i = 0; i < k.length; i++) {
            k[i].value = i + 1;
        }
    }

    function unpublish_thing(button, d, unpublish) {
        if (unpublish) {
            if (d.classList.contains("unpublished")) {
                d.classList.remove("unpublished");
                button.value = "Ukryj";
                button.style.background = "";
                d.querySelector(".published").value = "1";
            } else {
                d.classList.add("unpublished");
                button.value = "Przywróć";
                button.style.background = "#0c0";
                d.querySelector(".published").value = "0";
            }
        } else {
            //d.parentNode.removeChild(d);

            d.querySelectorAll("input[type=text]:not(.kolejnosc)").forEach((e) => {
                e.value = ""
            });
            d.querySelector("img").src = "";

            /*var k = document.getElementsByClassName("kolejnosc");
            for (i = 0; i < k.length; i++) {
                k[i].value = i + 1;
            }*/
        }
    }

    function quillEdit(e) {
        quillEditor.open(e,{
            callback: () => {

            }
        });
    }
    function chooseImage(e,src) {
        src = "/uploads/df/"+src;
        e.src = src;
        if (e.id)  {
            var eSrc = document.getElementById(e.id + '-src');
            if (eSrc) eSrc.value = src;
        }
    }
</script>

<?php startSection("content"); ?>

<form action="/admin/save-slider" method="post">
    <div id="typy">
        <?php
        $stmt = $con->prepare("SELECT slide_id, img, link, tekst FROM slides ORDER BY kolejnosc");
        $stmt->execute();
        $stmt->bind_result($slide_id, $img, $link, $tekst);
        $typy = [];
        while (mysqli_stmt_fetch($stmt)) {
            $typy[] = [$slide_id, $img, $link, $tekst];
        }
        $stmt->close();

        for ($a = 0; $a < 500; $a++) {
            $NEW = $a >= count($typy);
            if (!$NEW) {
                $k = $typy[$a];
                $slide_id = $k[0];
                $img = $k[1];
                $link = $k[2];
                $tekst = $k[3];
            } else {
                $slide_id = "";
                $img = "";
                $link = "";
                $tekst = "";
            }

            $ukryjBtn = "<button type='button' class='remove' onclick='unpublish_thing(this,this.parentNode.parentNode,false)'>Ukryj</button>";

            $hide = $NEW ? "style='display:none'" : "";

            //Link: <input type='text' name='typ[$a][link]' value='$link'>
            echo "<div class='typ-wrapper' $hide>
                <div class='typ'>
                    <input type='text' class='number kolejnosc' name='typ[$a][kolejnosc]' readonly value='" . ($a + 1) . "'>
                    <input type='button' onclick='imagePicker.open((src) => {chooseImage(elem(\"#img-$a\"),src)});' value='Wybierz zdjęcie'>
                    
                    <input type='hidden' name='typ[$a][id]' value='$slide_id'>
                    $ukryjBtn
                    <button type='button' class='btn primary' onclick='swap_div(this.parentNode.parentNode,-1)'><i class='fa fa-arrow-up'></i></button>
                    <button type='button' class='btn primary' onclick='swap_div(this.parentNode.parentNode,1)'><i class='fa fa-arrow-down'></i></button>
                    
                    <button type='button' class='btn primary' onclick='quillEdit(elem(\"#slide$a\"))'>Edytuj tekst</button>
                    <input type='text' style='display:none' name='typ[$a][img]' value='$img' id='img-$a-src'>
                    <div class='mobileRow'>
                        <div>
                            <img src='/uploads/df/$img' class='slide-img' id='img-$a'>
                        </div>
                        <div style='flex-grow:1;margin:10px'>
                            <div class='ql-editor' style='padding:5px;background:#ccc' id='slide$a'>$tekst</div>
                            <textarea style='display:none' name='typ[$a][tekst]' id='slide$a-src'>$tekst</textarea>
                        </div>
                    </div>
                </div>
            </div>";
        }
        ?></div>
    <button type='button' class='btn primary' onclick='showNextVariant()' style="margin:5px 0;width:100%;padding: 3px"><span>Nowy slajd</span> <i class="fa fa-plus"></i></button>
    <div style="text-align:right;margin:20px 0">
        <input type='submit' class='btn primary' value='Zapisz'>
    </div>
</form>

<?php include "admin/default_page.php"; ?>