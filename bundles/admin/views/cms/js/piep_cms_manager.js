/* js[!piep_cms_dependencies] */

class PiepCMSManager {
	constructor() {
		/** @type {cmsEditableProp[]} */
		this.blc_props = [];

		/** @type {cmsFloatingEditableProp[]} */
		this.floating_blc_props = [];

		/** @type {BlockSchema[]} */
		this.blcs_schema = [];

		/** @type {renderedVDomNode[]} */
		this.rendered_nodes = [];
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

	updateModules() {
		this.v_nodes_to_render = [];

		/**
		 * @param {vDomNode[]} v_nodes
		 */
		const traverseVDom = (v_nodes) => {
			for (const v_node of v_nodes) {
				if (v_node.module_name) {
					this.v_nodes_to_render.push(v_node);
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
		let full_css = "";

		/**
		 * @param {vDomNode[]} v_nodes
		 */
		const traverseVDom = (v_nodes) => {
			for (const v_node of v_nodes) {
				if (v_node.module_name) {
					const rendered_v_node = this.rendered_nodes.find((rendered_v_node) => rendered_v_node.id === v_node.id);
					if (rendered_v_node) {
						const node = this.piep_cms.getNode(rendered_v_node.id);
						if (node) {
							node._set_content(rendered_v_node.body);
							full_css += rendered_v_node.css_content;
						}
					}
				}
				if (v_node.children) {
					traverseVDom(v_node.children);
				}
			}
		};
		traverseVDom(this.piep_cms.v_dom);

		this.full_css = full_css;

		this.recalculateCss();
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
		let full_css_cheat = this.full_css;
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

		window.dispatchEvent(new Event("resize"));
	}
}

const piep_cms_manager = new PiepCMSManager();
