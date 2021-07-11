/* js[view] */

domload(() => {
	const randomize_code_btn = $(".randomize_code_btn");
	if (randomize_code_btn) {
		randomize_code_btn.addEventListener("click", () => {
			xhr({
				url: STATIC_URLS["USER"] + "/affiliate_program/code/randomize",
				success: (res) => {
					if (res) {
						$(".affiliate_program_code")._set_value(res.affiliate_program_code);
					}
				},
			});
		});
	}

	$(".join_btn").addEventListener("click", () => {
		xhr({
			url: STATIC_URLS["USER"] + "/affiliate_program/code/set",
			params: {
				affiliate_program_code: $(".affiliate_program_code")._get_value(),
			},
			success: (res) => {
				if (res.success) {
					window.location.reload();
				} else {
					showNotification(
						html`<div class="header">Wystąpił błąd!</div>
							${res.message}`
					);
				}
			},
		});
	});

	const reject_btn = $(".reject_btn");
	if (reject_btn) {
		reject_btn.addEventListener("click", () => {
			if (!confirm("Czy aby na pewno chcesz zrezygnować z programu?")) {
				return;
			}

			xhr({
				url: STATIC_URLS["USER"] + "/affiliate_program/code/set",
				params: {
					affiliate_program_code: "",
				},
				success: (res) => {
					window.location.reload();
				},
			});
		});
	}

	const copy_code_group = $(".copy_code_group");
	if (copy_code_group) {
		copy_code_group.addEventListener("click", () => {
			const code = copy_code_group._child(".field")._get_value();
			copyTextToClipboard(code);
			showNotification("Skopiowano do schowka", { type: "success", one_line: true });
		});
	}
});
