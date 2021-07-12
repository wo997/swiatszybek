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

	if (affiliate_program_events) {
		let events_html = "";
		const addEvents = (event_name, label) => {
			const events = affiliate_program_events.filter((e) => e.event_name === event_name);
			const classes = ["event_count"];
			const count = events.length;
			if (count > 0) {
				classes.push("more_than_zero");
			}
			events_html += html`
				<div class="affiliate_event">
					<div class="medium">
						<span class="${classes.join(" ")}">${count}</span>
						<span>${label}</span>
						<button class="btn transparent small expand_btn">
							<i class="fas fa-chevron-right"></i>
						</button>
					</div>
					<div class="expand_y hidden animate_hidden">
						<ul class="blc mt1">
							${events.map((e) => html`<li class="blc">${niceDate(e.added_at, true)}</li>`).join("")}
						</ul>
					</div>
				</div>
			`;
		};
		addEvents("visit", "Otworzyło Twój link");
		addEvents("shop_order", "Dokonało zakupu");

		const container = $(".affiliate_program_events_container");
		container.classList.add("mt2");
		container._set_content(events_html);

		container.addEventListener("click", (ev) => {
			const target = $(ev.target);

			const expand_btn = target._parent(".expand_btn");
			if (expand_btn) {
				expand(expand_btn._parent()._next(), expand_btn.classList.toggle("expanded"));
			}
		});
	}
});
