/* js[!piep_cms_dependencies] */

class PiepCMSManager {
	constructor() {
		/** @type {cmsEditableProp[]} */
		this.blc_props = [];

		/** @type {cmsFloatingEditableProp[]} */
		this.floating_blc_props = [];

		/** @type {BlockSchema[]} */
		this.blcs_schema = [];

		/** @type {vDomNode[]} */
		this.rendered_nodes = [];

		this.match_media_tags = /^(img|video|iframe)$/;

		// this.match_tags_containing_text =
		// 	/^(tt|i|b|big|small|em|strong|dfn|code|samp|kbd|var|cite|abbr|acronym|sub|sup|span|bdo|address|div|a|object|p|h[1-6]|pre|q|ins|del|dt|dd|li|label|option|textarea|fieldset|legend|button|caption|td|th|title|script|style)$/;

		this.match_text_containers = /^(h1|h2|h3|h4|h5|h6|p)$/;
		this.match_textables = /^(span|b)$/;

		this.single_tags = ["area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "param", "source", "track", "wbr"];

		this.match_linkables = new RegExp(`^(?!${this.single_tags.map((e) => e + "$").join("|")})`);

		/** @type {number[]} */
		this.pretty_percentages = [100];
		for (const w of [2, 3, 4, 5, 6]) {
			for (let i = 1; i < w; i++) {
				this.pretty_percentages.push((100 * i) / w);
			}
		}
		this.pretty_percentages = this.pretty_percentages.filter(onlyUnique);
		this.pretty_percentages.sort((a, b) => Math.sign(a - b));

		this.text_block_props = ["styles.textAlign", "tag"];

		this.request_vids = []; // backend render

		this.map_vid_css = {}; // vid => css
	}

	/**
	 *
	 * @param {PiepCMS} piep_cms
	 */
	setPiepCms(piep_cms) {
		this.piep_cms = piep_cms;
	}

	editorReady() {
		this.piep_cms.container.insertAdjacentHTML("beforeend", html`<style class="modules_css"></style>`);
		this.modules_css_node = this.piep_cms.container._child(".modules_css");

		this.piep_cms.select_resolution.addEventListener("change", () => {
			this.recalculateCss();
		});

		window.addEventListener("resize", () => {
			if (this.resize_timeout) {
				clearTimeout(this.resize_timeout);
			}

			this.resize_timeout = setTimeout(() => {
				this.resize_timeout = undefined;
				this.recalculateCss();
			}, 500);
		});
	}

	requestRender(vid) {
		if (this.request_vids.includes(vid)) {
			return;
		}
		this.request_vids.push(vid);
	}

	updateModules() {
		if (this.request_vids.length === 0) {
			return;
		}

		this.v_nodes_to_render = [];

		/**
		 * @param {vDomNode[]} v_nodes
		 */
		const traverseVDom = (v_nodes) => {
			for (const v_node of v_nodes) {
				const vid_index = this.request_vids.indexOf(v_node.id);
				if (vid_index !== -1) {
					this.v_nodes_to_render.push(v_node);
					this.request_vids.splice(vid_index, 1);
				}
				if (v_node.children) {
					traverseVDom(v_node.children);
				}
			}
		};
		traverseVDom(this.piep_cms.v_dom);

		xhr({
			url: `${STATIC_URLS["ADMIN"]}/cms/module/render_many`,
			params: {
				v_nodes_to_render: this.v_nodes_to_render,
			},
			success: (res) => {
				this.rendered_nodes = res;
				this.render();
			},
		});
	}

	render() {
		/**
		 * @param {vDomNode[]} v_nodes
		 */
		const traverseVDom = (v_nodes) => {
			for (const v_node of v_nodes) {
				if (v_node.module_name) {
					const rendered_v_node = this.rendered_nodes.find((rendered_v_node) => rendered_v_node.id === v_node.id);
					if (rendered_v_node) {
						v_node.rendered_body = rendered_v_node.rendered_body;
						v_node.rendered_css_content = rendered_v_node.rendered_css_content;
						const node = this.piep_cms.getNode(rendered_v_node.id);
						if (node) {
							node._set_content(rendered_v_node.rendered_body);
						}
						this.map_vid_css[rendered_v_node.id] = rendered_v_node.rendered_css_content;
					}
				}
				if (v_node.children) {
					traverseVDom(v_node.children);
				}
			}
		};
		traverseVDom(this.piep_cms.v_dom);

		this.recalculateCss();

		//this.piep_cms.recreateDom();
		window.dispatchEvent(new Event("resize"));
	}

	/**
	 *
	 * @param {cmsEditableProp} blc_prop
	 */
	registerProp(blc_prop) {
		this.blc_props.push(blc_prop);
	}

	/**
	 *
	 * @param {cmsFloatingEditableProp} floating_blc_prop
	 */
	registerFloatingProp(floating_blc_prop) {
		this.floating_blc_props.push(floating_blc_prop);
	}

	/**
	 *
	 * @param {BlockSchema} blc_schema
	 */
	registerBlcSchema(blc_schema) {
		this.blcs_schema.push(blc_schema);
	}

	recalculateCss() {
		let full_css_cheat = Object.values(this.map_vid_css).join(" ");
		if (!full_css_cheat) {
			return;
		}

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

const piep_cms_manager = new PiepCMSManager();
