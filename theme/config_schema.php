<?php //route[{ADMIN}testing_form_builder_chill]

$variables = [
    [
        "name" => "my_theme_color",
        "type" => "text",
        "default" => "default value",
    ],
    [
        "name" => "is_slider",
        "type" => "checkbox",
        "default" => "default value",
    ],
];

?>

<?php startSection("head"); ?>

<title>Konfig</title>

<style>

</style>

<?php startSection("content"); ?>


<?php
/*foreach ($variables as $variable) {
    $name = $variable["name"];
    echo "<input class='field' name='$name' value='" . '' . "'>";

    echo "<label class='checkbox-wrapper'>Czy strona jest publiczna? <input type='checkbox' name='$name' 
        ($page_data["published"] == 1) echo "checked"; ?>>
            <div class='checkbox'></div>
        </label>";
}*/
?>