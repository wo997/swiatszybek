/* js[global] */

/**
 *
 * @param {PiepNode} paginationElement
 * @param {number} currPage
 * @param {number} page_count
 * @param {*} callback
 * @param {*} options
 */
function renderPagination(paginationElement, currPage, page_count, callback, options = {}) {
	currPage = clamp(1, currPage, page_count);

	paginationElement.classList.add("pagination");

	let output = "<div class='pages-wrapper'>";
	let range = 3;
	let mobile = window.innerWidth < 760;
	//if (mobile) range = 2;
	var center = currPage;
	if (currPage < range + 1) center = range + 1;
	if (currPage > page_count - range) center = page_count - range;
	for (let i = 1; i <= page_count; i++) {
		if (i == 1 || i == page_count || (i > center - range && i < center + range)) {
			if (i == center - range + 1 && i > 2) {
				output += `<div class='splitter'>...</div>`;
			}
			output += `<div data-index='${i}' class='pagination_item ${i == currPage ? " current" : ``}'>${i}</div>`;
			if (i == center + range - 1 && i < page_count - 1) {
				output += `<div class='splitter'>...</div>`;
			}
		}
	}
	output += "</div>";

	if (page_count > 20 && !mobile && options.allow_my_page) {
		output += `<span class='setMyPage'><input class='myPage field inline' type='number' placeholder='Wpisz nr'></span>`;
	}

	paginationElement._set_content(output);
	paginationElement._children(".pagination_item:not(.current)").forEach((elem) => {
		let i = parseInt(elem.getAttribute("data-index"));
		i = clamp(1, i, page_count);
		elem.addEventListener("click", () => {
			callback(i);
		});
	});
	paginationElement._children(".myPage").forEach((elem) => {
		elem.addEventListener("keypress", (event) => {
			if (event.code == "Enter") {
				let i = parseInt(elem._get_value());
				i = clamp(1, i, page_count);
				callback(i);
			}
		});
	});
}
