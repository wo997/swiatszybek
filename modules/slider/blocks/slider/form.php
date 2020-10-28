<?php //module_block_form[slider] 
?>

<span class="field-title">Wysokość slidera</span>
<c-select class="inline" style="width: 150px">
  <input type="text" class="field" name="desktop-slider-height" data-default-value="" data-default-unit="px" onchange="MODULE_BLOCK.sliderHeightChanged(this)" />
  <c-arrow></c-arrow>
  <c-options>
    <c-option>35%</c-option>
    <c-option>45%</c-option>
    <c-option>450px</c-option>
    <c-option>600px</c-option>
  </c-options>
</c-select>

<span class='field-title inline'>
  Slajdy
  <span class='add_buttons'></span>
</span>

<div name="cms_slides"></div>