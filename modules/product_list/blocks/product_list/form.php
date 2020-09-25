<?php //module_block_form[product_list] 
?>

<span class="field-title" style="margin-top: 0">Liczba produktów</span>
<input type="number" name="product_list_count" class="field" />

<span class="field-title">Sortuj wg</span>
<radio-input name="order_by">
  <radio-option value="new" data-default> Najnowsze </radio-option>
  <radio-option value="sale"> Bestsellery </radio-option>
  <radio-option value="cheap"> Najtańsze </radio-option>
  <radio-option value="random"> Losowo </radio-option>
</radio-input>

<span class="field-title">Układ</span>
<radio-input name="layout">
  <radio-option value="grid"> Lista / Siatka </radio-option>
  <radio-option value="slider" data-default> Slider </radio-option>
</radio-input>

<span class="field-title">Kategorie</span>
<div class="category-picker" name="category_ids" data-source="product_categories"></div>