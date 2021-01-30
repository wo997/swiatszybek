/* js[!global] */

/**
 * @typedef {{
 * template: string
 * initialize?(node: AnyComponent)
 * render?(node: AnyComponent)
 * }} ComponentTraitDefinition
 */
const component_traits = {};

/**
 *
 * @param {*} name
 * @param {ComponentTraitDefinition} trait_def
 */
function registerComponentTrait(name, trait_def) {
	component_traits[name] = trait_def;
}
