/* js[!global] */

/**
 * @typedef {{
 * template: string
 * initialize?(node: AnyComp)
 * render?(node: AnyComp)
 * }} CompTraitDefinition
 */
const comp_traits = {};

/**
 *
 * @param {*} name
 * @param {CompTraitDefinition} trait_def
 */
function registerCompTrait(name, trait_def) {
	comp_traits[name] = trait_def;
}
