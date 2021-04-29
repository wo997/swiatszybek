/* js[!piep_cms_dependencies] */

class PiepCMSPropsHandler {
	constructor() {
		/** @type {cmsEditableProp[]} */
		this.blc_props = [];

		/** @type {cmsFloatingEditableProp[]} */
		this.floating_blc_props = [];
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
}

const piep_cms_props_handler = new PiepCMSPropsHandler();
