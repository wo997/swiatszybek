<?php //module_block_form[product_list]
?>

<span class="label first">Liczba produktów</span>
<input type="number" name="product_list_count" class="field" />

<span class="label">Sortuj wg</span>
<radio-input name="order_by" class="default">
    <radio-option value="new" class="default"> Najnowsze </radio-option>
    <radio-option value="sale"> Bestsellery </radio-option>
    <radio-option value="cheap"> Najtańsze </radio-option>
    <radio-option value="random"> Losowo </radio-option>
</radio-input>

<span class="label">Układ</span>
<radio-input name="layout" class="default">
    <radio-option value="grid"> Lista / Siatka </radio-option>
    <radio-option value="slider" class="default"> Slider </radio-option>
</radio-input>

<span class="label">Kategorie</span>
<div class="category-picker" name="category_ids" data-source="product_categories"></div>