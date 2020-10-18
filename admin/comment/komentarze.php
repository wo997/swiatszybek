<?php //route[{ADMIN}komentarze] 
?>

<?php startSection("head"); ?>

<title>Komentarze</title>

<script>
    document.addEventListener("DOMContentLoaded", function() {
        createDatatable({
            name: "mytable",
            lang: {
                subject: "komentarzy",
            },
            url: "/search_comments",
            params: () => {
                return {

                }
            },
            definition: [{
                    title: "Pseudonim",
                    width: "10%",
                    render: (r) => {
                        return `${r.pseudonim}`;
                    }
                },
                {
                    title: "Komentarz",
                    width: "30%",
                    className: "auto-width",
                    render: (r) => {
                        return `${r.tresc}`;
                    },
                    escape: false
                },
                {
                    title: "Kiedy",
                    width: "10%",
                    render: (r) => {
                        return `${r.dodano}`;
                    }
                },
                {
                    title: "Ocena",
                    width: "10%",
                    render: (r) => {
                        return `${r.rating}`;
                    },
                    escape: false
                },
                {
                    title: "Produkt",
                    width: "10%",
                    render: (r) => {
                        return `<a href="${r.link}">${r.title}</a>`;
                    },
                    escape: false,
                },
                {
                    title: "",
                    width: "10%",
                    render: (r) => {
                        var action = "";
                        action = `<button class='btn red' style='margin-left:10px' onclick='commentAction(${r.comment_id},-1)'>Usuń</button>`;
                        if (r.accepted == 0)
                            action += `<button class='btn primary' style='margin-left:10px' onclick='commentAction(${r.comment_id},1)'>Akceptuj</button>`;
                        return action;
                    },
                    escape: false,
                },
            ],
            controls: `
                    <div class='float-icon'>
                        <input type="text" placeholder="Szukaj..." data-param="search" class="field inline">
                        <i class="fas fa-search"></i>
                    </div>
                    <select data-param="status" class="field inline">
                        <option value=''>Wszystkie</option>
                        <option value='n'>Niezatwierdzone</option>
                    </select>
                `
        });
    });

    function commentAction(i, action) {
        if (action == -1 && !confirm("Czy aby na pewno chcesz usunąć komentarz?")) return;
        ajax("/commentAction", {
            comment_id: i,
            action: action
        }, () => {
            currPage = 0;
            mytable.search();
        }, () => {});
    }
</script>

<?php startSection("content"); ?>

<div class="mytable"></div>

<?php include "admin/default_page.php"; ?>