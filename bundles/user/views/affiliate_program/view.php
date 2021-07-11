<?php //route[{USER}/program-afiliacyjny]

$user = User::getCurrent();
$affiliate_program_code = $user->getEntity()->getProp("affiliate_program_code");
?>

<?php Templates::startSection("head"); ?>

<title>Program afiliacyjny</title>

<?php Templates::startSection("user_page_body"); ?>

<h1 class="h1 center">Program afiliacyjny</h1>

<div style="max-width:500px" class="mt3 mb3 mla mra">
    <?php if ($affiliate_program_code) : ?>
        <div class="label medium">Jesteś członkim programu!</div>

        <div class="label medium">Twój kod</div>
        <div><?= $affiliate_program_code ?></div>
    <?php else : ?>
        <p class="">Nie jesteś jeszcze członkim programu.</p>
        <div class="medium text_buynow">Zapisz się już teraz! </div>

        <div class="mt3">W polu poniżej</div>

        <ul class="blc mt2 mb2">
            <li class="blc">
                Wpisz <b>własny kod</b>, który będzie widoczny w Twoim linku
            </li>
            <li class="blc">
                Lub <button class="btn primary small ml1">Generuj losowy <i class="fas fa-dice-three"></i></button>
            </li>
        </ul>

        <div class="label">Twój kod</div>
        <input class="field affiliate_program_code" placeholder="Np. Andrzej G">

        <button class="btn primary mtf fill">Weź udział <i class="fas fa-chevron-right"></i></button>
    <?php endif ?>
</div>

<?php include "bundles/user/templates/default.php"; ?>