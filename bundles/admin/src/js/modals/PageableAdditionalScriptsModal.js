/* js[admin] */

function getPageableAdditionalScriptsModal() {
	const ex = $("#PageableAdditionalScriptsModal");
	if (!ex) {
		registerModalContent(html`
			<div id="PageableAdditionalScriptsModal" data-dismissable data-expand>
				<div class="modal_body">
					<div class="custom_toolbar">
						<span class="title medium">Dodatkowe skrypty</span>
						<button class="btn subtle mla" onclick="hideParentModal(this)">Zamknij <i class="fas fa-times"></i></button>
						<button class="btn primary save_btn ml1">Zapisz <i class="fas fa-save"></i></button>
					</div>
					<div class="scroll_panel scroll_shadow panel_padding">
						<div class="mtfn">
							<span class="label">Skrypty w headerze (nie wdrożono)</span>
							<textarea type="text" class="field" data-name="custom_header" style="height:400px"></textarea>

							<span class="label">Skrypty w footerze (nie wdrożono)</span>
							<textarea type="text" class="field" data-name="custom_footer" style="height:400px"></textarea>

							<span class="label">Globalny JS</span>
							<textarea type="text" class="field" data-name="custom_js" style="height:400px"></textarea>

							<span class="label">Globalny CSS</span>
							<textarea type="text" class="field" data-name="custom_css" style="height:400px"></textarea>
						</div>
					</div>
				</div>
			</div>
		`);
	}

	return $("#PageableAdditionalScriptsModal");
}
