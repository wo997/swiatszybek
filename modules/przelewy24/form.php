<?php //module_form[przelewy24]
?>

<span class="field-title first">ID sprzedawcy</span>
<input type="text" name="merchant_id" class="field" />

<span class="field-title">ID punktu sprzedaży</span>
<input type="text" name="pos_id" class="field" />

<span class="field-title">Klucz CRC</span>
<input type="text" name="crc" class="field" />

<label class="checkbox-wrapper field-title block">
    Tryb testowy
    <input type="checkbox" name="test_mode">
    <div class="checkbox"></div>
</label>

<div class="form-space"></div>

<button class="btn primary" onclick="saveModuleSettings()">Zapisz</button>