/* js[global] */

function starsLoaded() {
	$$(".stars:not(.rdy)").forEach((stars) => {
		stars.classList.add("rdy");

		let stars_html = "";
		const rating = numberFromStr(stars.innerHTML);
		for (let i = 1; i <= 5; i++) {
			// <i class="fas fa-star-half-alt"></i>
			if (i <= rating) {
				stars_html += html`<i class="fas fa-star"></i>`;
			} else {
				stars_html += html`<i class="far fa-star"></i>`;
			}
		}
		stars._set_content(stars_html);
	});
}
