/* js[cms-page] */

domload(() => {
	$$(".cms").forEach((e) => {
		e.style.opacity = "1";
	});
});

// domload(() => {
// 	$$(".ql-editor a").forEach((e) => {
// 		if (
// 			e.href.indexOf("/") !== 0 &&
// 			e.href.indexOf(window.location.hostname) === -1
// 		) {
// 			e.setAttribute("target", "_blank");
// 		}
// 	});
// });
