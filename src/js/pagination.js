/* js[global] */

function renderPagination(
	paginationElement,
	currPage,
	pageCount,
	callback,
	options = {}
) {
	currPage = getSafePageIndex(currPage, pageCount);

	var output = "<div class='pages-wrapper'>";
	var range = 3;
	var mobile = window.innerWidth < 760;
	//if (mobile) range = 2;
	var center = currPage;
	if (currPage < range + 1) center = range + 1;
	if (currPage > pageCount - range) center = pageCount - range;
	for (i = 1; i <= pageCount; i++) {
		if (
			i == 1 ||
			i == pageCount ||
			(i > center - range && i < center + range)
		) {
			if (i == center - range + 1 && i > 2) {
				output += `<div class='splitter'>...</div>`;
			}
			output += `<div data-index='${i}' class='pagination_item ${
				i == currPage ? " current" : ``
			}'>${i}</div>`;
			if (i == center + range - 1 && i < pageCount - 1) {
				output += `<div class='splitter'>...</div>`;
			}
		}
	}
	output += "</div>";

	if (pageCount > 20 && !mobile && options.allow_my_page) {
		output += `<span class='setMyPage'><input class='myPage field inline' type='number' placeholder='Wpisz nr'></span>`;
	}

	paginationElement.setContent(output);
	paginationElement
		.findAll(".pagination_item:not(.current)")
		.forEach((elem) => {
			var i = parseInt(elem.getAttribute("data-index"));
			i = getSafePageIndex(i, pageCount);
			elem.addEventListener("click", () => {
				callback(i);
			});
		});
	paginationElement.findAll(".myPage").forEach((elem) => {
		elem.addEventListener("keypress", (event) => {
			if (event.code == "Enter") {
				var i = parseInt(elem.value);
				i = getSafePageIndex(i, pageCount);
				callback(i);
			}
		});
	});
}
