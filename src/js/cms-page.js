/* js[cms-page] */
window.addEventListener("scroll", () => {
	scrollCallback();
});

function scrollCallback() {
	$$("[data-animation]").forEach((e) => {
		if (e.getBoundingClientRect().top < window.innerHeight * 0.8) {
			var a = e.getAttribute("data-animation");
			e.removeAttribute("data-animation");

			e = e.find(".cms-block-content");
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

window.addEventListener("DOMContentLoaded", function () {
	scrollCallback();
});

window.addEventListener("DOMContentLoaded", () => {
	$$(".cms").forEach((e) => {
		e.style.opacity = "1";
	});

	$$(".cms-block-content").forEach((e) => {
		e.style.marginBottom = "1px";
		setTimeout(() => {
			e.style.marginBottom = "";
		});
	});

	$$(".slider_module .cms-block-content").forEach((e) => {
		e.setAttribute("data-swiper-parallax", "-180");
	});

	var sliderCount = 0;
	$$(
		".cms-block .swiper-container.slider_module:not(.swiper-container-initialized)"
	).forEach((e) => {
		sliderCount++;
		var sliderName = "swiper_slider_" + sliderCount;
		e.classList.add(sliderName);
		var swiper = new Swiper("." + sliderName, {
			speed: 700,
			parallax: true,
			pagination: {
				el: ".swiper-pagination",
				clickable: true,
			},
			autoplay: {
				delay: 5000,
			},
			navigation: {
				nextEl: ".swiper-button-next",
				prevEl: ".swiper-button-prev",
			},
		});
	});

	$$(
		".product_list_module .swiper-container:not(.swiper-container-initialized)"
	).forEach((e) => {
		sliderCount++;
		var sliderName = "swiper_slider_" + sliderCount;
		e.classList.add(sliderName);

		var swiper_all = e.parent();
		var clprev = sliderName + "_prev_btn";
		var clnext = sliderName + "_next_btn";
		swiper_all.find(".swiper-button-prev").classList.add(clprev);
		swiper_all.find(".swiper-button-next").classList.add(clnext);

		var swiper = new Swiper("." + sliderName, {
			speed: 700,
			navigation: {
				prevEl: "." + clprev,
				nextEl: "." + clnext,
			},
		});
		e.swiper = swiper;

		var event = new CustomEvent("products-swiper-created", {
			detail: {
				node: e,
			},
		});
		window.dispatchEvent(event);
	});

	$$(".ql-editor a").forEach((e) => {
		if (
			e.href.indexOf("/") !== 0 &&
			e.href.indexOf(window.location.hostname) === -1
		) {
			e.setAttribute("target", "_blank");
		}
	});

	if (window.innerWidth < 768) {
		$$("table").forEach((table) => {
			var header = table.find("tr").findAll("td");
			if (header.length <= 2) return;
			//if (header[0].innerText.trim() != "") return;
			var headers = [];
			for (i = 0; i < header.length; i++) {
				var h = header[i].innerHTML;
				headers.push(
					header[i].textContent
						? "<div style='font-weight:bold;display:inline-block'>" +
								h +
								" </div>"
						: ""
				);
			}
			var out = "";
			var rows = table.find("tr");
			for (i = 1; i < rows.length; i++) {
				var cells = rows[i].find("td");
				for (a = 0; a < cells.length; a++) {
					out +=
						"<div style='margin:8px 0; margin-right:5px'>" +
						headers[a] +
						"<div style='display:inline-block'>" +
						cells[a].innerHTML +
						"</div> </div>";
				}
				out += "<hr style='margin:20px 0'>";
			}
			table.innerHTML = out;
			table.classList.add("mytable");
		});
	}
});
