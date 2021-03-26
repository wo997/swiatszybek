<div class="password_form">
    <div class="label">
        Nowe hasło
        <button class="btn small transparent toggle_password" style="margin-left:0" data-tooltip="Pokaż hasło" data-tooltip_position="right">
            <i class="fas fa-eye"></i>
        </button>
    </div>
    <input type="password" class="field password pretty_errors pretty_errors_inline" data-validate="password" autocomplete="new-password">
    <div class="user_tip password_requirements" style="margin-top:10px;">
        <p class="eigth_characters"> 8 znaków długości</p>
        <p class="one_small_letter"> 1 mała litera (a-z)</p>
        <p class="one_big_letter"> 1 wielka litera (A-Z)</p>
        <p class="one_digit"> 1 cyfra (0-9)</p>
    </div>

    <div class="label">
        Powtórz hasło
        <button class="btn small transparent toggle_password" style="margin-left:0" data-tooltip="Pokaż hasło" data-tooltip_position="right">
            <i class="fas fa-eye"></i>
        </button>
    </div>
    <input type="password" class="field password_rewrite pretty_errors" data-validate="match:.password_form .password" autocomplete="new-password">
</div>