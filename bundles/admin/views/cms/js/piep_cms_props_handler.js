/* js[!piep_cms_dependencies] */

class PiepCMSManager {
	constructor() {
		/** @type {cmsEditableProp[]} */
		this.blc_props = [];

		/** @type {cmsFloatingEditableProp[]} */
		this.floating_blc_props = [];

		/** @type {BlockToAdd[]} */
		this.blcs_to_add = [];
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
	 * @param {BlockToAdd} blc_to_add
	 */
	registerBlcToAdd(blc_to_add) {
		this.blcs_to_add.push(blc_to_add);
	}
}

const piep_cms_manager = new PiepCMSManager();
