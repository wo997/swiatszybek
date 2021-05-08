/* js[piep_cms] */

class PiepCMSCheatReasponsiveCSS {
	constructor(piep_cms) {
		this.piep_cms = piep_cms;

		let full_css = "";
		Object.entries(modules_css).forEach((/** @type {string[]} */ [module_name, module_css]) => {
			// const matches = module_css.match(/@media.*?-width:\d*?px\)\{.*?\}\s*?\}/g); // no need looool
			// if (matches) {
			// 	console.log(matches);
			// 	//matches[0]
			// }
			full_css += module_css;
		});

		this.full_css = full_css;

		this.piep_cms.container.insertAdjacentHTML("beforeend", html`<style class="modules_css"></style>`);
		this.modules_css_node = this.piep_cms.container._child(".modules_css");

		this.recalculate();

		this.piep_cms.select_resolution.addEventListener("change", () => {
			this.recalculate();
		});

		window.addEventListener("resize", () => {
			if (this.resize_timeout) {
				clearTimeout(this.resize_timeout);
			}

			this.resize_timeout = setTimeout(() => {
				this.resize_timeout = undefined;
				this.recalculate();
			}, 500);
		});
	}

	recalculate() {
		let full_css_cheat = this.full_css;

		const media_width_diff = window.innerWidth - this.piep_cms.content.offsetWidth;

		{
			const matches = full_css_cheat.match(/\((min|max)-width:\d*?px\)/g); // oh yeah baby
			if (matches) {
				matches.forEach((match) => {
					const width = numberFromStr(match);
					const new_match = match.replace(width + "", width + media_width_diff + "");
					full_css_cheat = full_css_cheat.replace(match, new_match);
				});
			}
		}

		this.modules_css_node._set_content(full_css_cheat);
	}
}
