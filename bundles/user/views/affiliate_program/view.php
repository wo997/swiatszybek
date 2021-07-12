<?php //route[{USER}/program-afiliacyjny]

$user = User::getCurrent();
$user_entity = $user->getEntity();
$affiliate_program_code = $user_entity->getProp("affiliate_program_code");
$__affiliate_program_code_url = $user_entity->getProp("__affiliate_program_code_url");

?>

<?php Templates::startSection("head"); ?>

<title>Program afiliacyjny</title>

<?php Templates::startSection("user_page_body"); ?>

<h1 class="h1 center">Program afiliacyjny</h1>

<div style="max-width:400px" class="mt3 mb3 mla mra">
    <?php if ($affiliate_program_code) : ?>
        <div class="label medium">Jesteś członkiem programu!</div>

        <div class="label">Link afiliacyjny</div>
        <div class="glue_children copy_code_group">
            <input class="field focus_inside" readonly value="<?= SITE_URL . "?ref=" . $__affiliate_program_code_url ?>">
            <button class="btn primary" data-tooltip="Skopiuj do schowka">
                <i class="fas fa-copy"></i>
            </button>
        </div>

        <hr class="mt5">

        <div class="label medium">Zarządzanie</div>

        <div class="label">Twój kod (cyfry, litery i spacja)</div>
        <input class="field affiliate_program_code" value="<?= $affiliate_program_code ?>">

        <button class="btn subtle mtf fill join_btn">Zapisz zmianę <i class="fas fa-chevron-right"></i></button>

        <button class="btn error_light mtf fill reject_btn">Zrezygnuj z programu <i class="fas fa-times"></i></button>

    <?php else : ?>
        <p class="">Nie jesteś jeszcze członkiem programu.</p>
        <div class="medium text_buynow">Zapisz się już teraz! </div>

        <div class="mt3">W polu poniżej:</div>

        <ul class="blc mt2 mb2">
            <li class="blc">
                Wpisz <b>własny kod</b>, który będzie widoczny w Twoim linku
            </li>
            <li class="blc">
                Lub <button class="btn primary small ml1 randomize_code_btn">Generuj losowy <i class="fas fa-dice-three"></i></button>
            </li>
        </ul>

        <div class="label">Twój kod (min. 3 znaki)</div>
        <input class="field affiliate_program_code" placeholder="Np. Andrzej G">

        <button class="btn primary mtf fill join_btn">Weź udział <i class="fas fa-chevron-right"></i></button>
    <?php endif ?>
</div>

<?php include "bundles/user/templates/default.php"; ?>