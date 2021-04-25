<?php //module_form[przelewy24]
?>

<span class="label first">ID sprzedawcy</span>
<input name="merchant_id" class="field" />

<span class="label">ID punktu sprzedaży</span>
<input name="pos_id" class="field" />

<span class="label">Klucz CRC</span>
<input name="crc" class="field" />

<label class="checkbox-wrapper label block">
    Tryb testowy
    <input type="checkbox" name="test_mode">
    <div class="checkbox"></div>
</label>

<div class="form-space"></div>

<button class="btn primary" onclick="saveModuleSettings()">Zapisz</button>