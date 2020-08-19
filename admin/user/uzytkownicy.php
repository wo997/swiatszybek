<?php //route[admin/uzytkownicy]

if (isset($url_params[2]) && strlen($url_params[2]) > 0) {
    $user_id = $url_params[2];
} else
    $user_id = null;
?>

<?php startSection("head"); ?>

<title>Użytkownicy</title>

<script src="/admin/zamowienia_table_definition.js?a=<?= RELEASE ?>"></script>
<script>
    document.addEventListener("DOMContentLoaded", function() {

        var tableName = "mytable";
        createTable({
            name: tableName,
            url: "/admin/search_uzytkownicy",
            lang: {
                subject: "użytkowników",
            },
            width: 1300,
            definition: [{
                    title: "Imię, Nazwisko",
                    width: "25%",
                    render: (r) => {
                        var client = escapeHTML(`${r.imie} ${r.nazwisko}`);
                        if (r.user_type == 'g') client = '<img src="/img/google.png" style="width: 15px;vertical-align: sub;"> ' + client;
                        if (r.user_type == 'f') client = '<i class="fab fa-facebook-square" style="font-size: 15px;color: #3b5998;"></i> ' + client;
                        return `<a class="btn secondary" href='/moje-konto/dane-uzytkownika/${r.user_id}'><i class="fas fa-cog"></i></a> ${client}`;
                    },
                    escape: false
                },
                {
                    title: "Firma",
                    width: "10%",
                    render: (r) => {
                        return r.firma;
                    }
                },
                {
                    title: "Email",
                    width: "10%",
                    render: (r) => {
                        return r.email;
                    }
                },
                {
                    title: "Telefon",
                    width: "8%",
                    render: (r) => {
                        return r.telefon;
                    }
                },
                {
                    title: "Uprawnienia",
                    width: "8%",
                    render: (r) => {
                        return r.permissions;
                    }
                },
                {
                    title: "Data utworzenia",
                    width: "10%",
                    render: (r) => {
                        return nonull(r.stworzono);
                    }
                },
                {
                    title: "Ilość zamówień",
                    width: "10%",
                    render: (r, i) => {
                        var zamowienia = nonull(r.zamowienia_count);
                        if (r.zamowienia_count > 0) zamowienia += `<button type="button" class="btn secondary" style="margin-left:7px" onclick="showUser(${r.user_id})"> Pokaż <i class="fas fa-chevron-circle-right"></i></a>`;
                        return zamowienia;
                    },
                    escape: false
                },
            ],
            controls: `
                <div class='float-icon'>
                    <input type="text" placeholder="Szukaj..." data-param="search">
                    <i class="fas fa-search"></i>
                </div>                `
        });

        <?php if ($user_id) echo "showUser($user_id);"; ?>
    });

    document.addEventListener("DOMContentLoaded", function() {

        var tableName = "zamowieniatable";
        createTable({
            name: tableName,
            url: "/admin/search_zamowienia",
            lang: {
                subject: "zamówień",
            },
            width: 1300,
            nosearch: true,
            params: () => {
                return {
                    user_id: USER_ID
                }
            },
            definition: zamowienia_table_definition,
            controls: `
                    <h3><button class="btn primary" style="margin-right:10px" onclick="back()"><i class="fas fa-chevron-circle-left"></i>&nbsp;Cofnij</button> Zamówienia użytkownika <span id="username"></span></h3>
                `
        });
    });

    var USER_ID = null;

    function showUser(user_id) {

        USER_ID = user_id;

        xhr({
            url: "/admin/search_uzytkownicy",
            params: {
                user_id: USER_ID
            },
            success: (res) => {
                if (res.results.length > 0) {
                    var r = res.results[0];
                    var client = escapeHTML(`${r.imie} ${r.nazwisko} ${r.firma}`);

                    USER_ID = r.user_id;
                    zamowieniatable.search(() => {
                        $('#caseSingleUser').style.display = 'block';
                        $('#caseAllUsers').style.display = 'none';

                        $('#username').innerHTML = `<td><a class='link' href='/moje-konto/dane-uzytkownika/${USER_ID}'>${client}</a></td>`;
                    });
                }
            }
        })
    }

    function back() {
        mytable.search(() => {
            $('#caseSingleUser').style.display = 'none';
            $('#caseAllUsers').style.display = 'block';
        });
    }
</script>

<?php startSection("content"); ?>

<div class="mytable" id="caseAllUsers"></div>
<div id="caseSingleUser" style="display:none">
    <div class="zamowieniatable"></div>
</div>

<?php include "admin/default_page.php"; ?>