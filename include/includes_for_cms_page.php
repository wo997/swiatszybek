<script src="/src/swiper.min.js"></script>
<link rel="stylesheet" href="/src/swiper.min.css">
<style>
    [data-animation] {
        visibility: hidden;
    }

    .cms {
        opacity: 0;
        transition: opacity 0.2s;
    }
</style>
<script>
    window.addEventListener("scroll", () => {
        scrollCallback();
    });

    function scrollCallback() {
        $$("[data-animation]").forEach(e => {
            if (e.getBoundingClientRect().top < window.innerHeight * 0.8) {
                var a = e.getAttribute("data-animation");
                e.removeAttribute("data-animation");

                e = e.querySelector(".cms-block-content");
                if (a.indexOf("m_left") != -1) {
                    e.style.transform = "translate(100px,0)";
                }
                if (a.indexOf("m_right") != -1) {
                    e.style.transform = "translate(-100px,0)";
                }
                if (a.indexOf("m_up") != -1) {
                    e.style.transform = "translate(0,100px)";
                }
                if (a.indexOf("m_down") != -1) {
                    e.style.transform = "translate(0,-100px)";
                }
                if (a.indexOf("s_compress") != -1) {
                    e.style.transform = "scale(1.3)";
                }
                if (a.indexOf("s_expand") != -1) {
                    e.style.transform = "scale(0.7)";
                }
                e.style.opacity = 0;
                setTimeout(() => {
                    //e.style.transition = "opacity 1.6s, transform 0.4s";
                    e.style.transition = "all 1.6s"; // needs to be equal
                    e.style.opacity = 1;
                    e.style.transform = "translate(0,0)";
                }, 0);
            }
        });
    }

    window.addEventListener("DOMContentLoaded", function() {
        scrollCallback();
    });

    window.addEventListener("DOMContentLoaded", () => {
        $$(".cms").forEach(e => {
            e.style.opacity = "1";
        })

        $$(".cms-block-content").forEach(e => {
            e.style.marginBottom = "1px";
            setTimeout(() => {
                e.style.marginBottom = "";
            })
        })

        var sliderCount = 0;
        $$('.swiper-container:not(.product-main-slider)').forEach(e => {
            sliderCount++;
            var sliderName = "swiper-slider-" + sliderCount;
            e.classList.add(sliderName);

            swiper = new Swiper('.' + sliderName, {
                speed: 700,
                pagination: {
                    el: '.swiper-pagination',
                    clickable: true
                },
                autoplay: {
                    delay: 5000,
                },
                navigation: {
                    nextEl: '.swiper-button-next',
                    prevEl: '.swiper-button-prev',
                },
            });
        });

        $$(".ql-editor a").forEach(e => {
            if (e.href.indexOf("/") !== 0 && e.href.indexOf(window.location.hostname) === -1) {
                e.setAttribute("target", "_blank");
            }
        })

        if (window.innerWidth > 1200) {
            $$(".item-image").forEach(e => {
                var i = e.getAttribute("data-desktop");
                if (i) e.style.backgroundImage = "url('" + i + "')";
            });
        }

        if (window.innerWidth < 768) {
            $$("table").forEach(table => {
                var header = table.querySelector("tr").querySelectorAll("td");
                if (header.length <= 2) return;
                //if (header[0].innerText.trim() != "") return;
                var headers = [];
                for (i = 0; i < header.length; i++) {
                    var h = header[i].innerHTML;
                    headers.push(header[i].textContent ? "<div style='font-weight:bold;display:inline-block'>" + h + " </div>" : "");
                }
                var out = "";
                var rows = table.querySelectorAll("tr");
                for (i = 1; i < rows.length; i++) {
                    var cells = rows[i].querySelectorAll("td");
                    for (a = 0; a < cells.length; a++) {
                        out += "<div style='margin:8px 0; margin-right:5px'>" + headers[a] + "<div style='display:inline-block'>" + cells[a].innerHTML + "</div> </div>";
                    }
                    out += "<hr style='margin:20px 0'>";
                }
                table.innerHTML = out;
                table.classList.add("mytable");
            });
        }
    });

    var wt = -100;

    window.addEventListener("DOMContentLoaded", function() {
        resizeCallback();
        waitForImageLoaded();
    });


    function waitForImageLoaded() {
        wt++;
        $$(".cms img:not(.responsive)").forEach(e => {
            if (e.naturalWidth) {
                e.classList.add("responsive");
                responsiveImage(e);
                wt = 0;
            }
        });
        if (wt++ < 100) {
            requestAnimationFrame(waitForImageLoaded);
        }
    };

    function responsiveImage(e) {
        var src = e.getAttribute("src");
        if (!src) return;

        //console.log(e.naturalWidth);
        //console.log(e.width, e.naturalWidth);
        //e.width < e.naturalWidth
        var current_dimension = Math.max(e.width, e.height);
        var naturalDimension = Math.max(e.naturalWidth, e.naturalHeight);

        // cannot limit by natural dimension if user requested something bigger hmmm

        //console.log(naturalDimension);
        var target_size_name = "df";
        var target_size_dimension = "df";
        Object.entries(image_default_dimensions).forEach(([size_name, size_dimension]) => {
            //console.log(size_name, size_dimension);
            if (current_dimension < size_dimension * 1.4 && current_dimension < naturalDimension) {
                target_size_name = size_name;
                target_size_dimension = size_dimension;
            }
        });

        e.setAttribute("src", src.replace(/\/uploads\/.{0,4}\//, `/uploads/${target_size_name}/`));
    }

    function responsiveImages() {
        $$(".cms img").forEach(e => {
            responsiveImage(e);
        });
    }
</script>