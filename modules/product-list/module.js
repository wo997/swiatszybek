/* js[modules] */
var module_name = "product-list";
modules[module_name] = {
  params: "",
  description: "Lista produktów",
  icon: '<i class="fas fa-cube"></i>',
  form: `
        <span class="field-title" style='margin-top:0'>Liczba produktów</span>
        <input type='number' name="product_list_count" class="field">
    
        <span class="field-title">Sortuj wg</span>
        <select name='order_by' class="field">
            <option value='new'>Najnowsze</option>
            <option value='sale'>Bestsellery</option>
            <option value='cheap'>Najtańsze</option>
            <option value='random'>Losowo</option>
        </select>
            
        <span class="field-title">Kategorie</span>               
        <div class="category-picker" name="category_ids" data-source="product_categories"></div>
        `,
  formOpen: (params, block, moduleName) => {
    setFormData(params, `#${module_name}`);
    loadCategoryPicker("product_categories", { skip: 2 }, () => {
      $(`#${moduleName} [name="category_ids"]`).setValue(
        nonull(params["category_ids"], "[]")
      );
    });
  },
  formClose: () => {
    const params = getFormData(`#${module_name}`);
    cmsTarget.setAttribute("data-module-params", JSON.stringify(params));
  },
  render: (params) => {
    const productListCount = params["product_list_count"];
    return productListCount ? `Liczba produktów: ${productListCount}` : "";
  },
};
