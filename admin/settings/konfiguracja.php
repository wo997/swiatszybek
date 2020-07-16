<?php //->[admin/konfiguracja]

$category = isset($url_params[2]) ? $url_params[2] : null;

?>

<?php startSection("head"); ?>

<title>Konfiguracja</title>

<style>

</style>

<script>
      document.addEventListener("DOMContentLoaded", function() {
        createTable({
            name: "mytable",
            url: "/admin/search_konfiguracja",
            lang: {
                subject: "stałych"
            },
            primary: "prop_id",
            db_table: "konfiguracja",
            sortable: true,
            requiredParam: () => {
            return "<?= $category ?>";
            },  
            definition: [{
                    title: "Id",
                    width: "10%",
                    render: (r) => {
                        return `${r.prop_id}`;
                    },
                },
                {
                    title: "Nazwa",
                    width: "10%",
                    render: (r) => {
                        return `${r.prop_name_nice}`;
                    },
                },
                {
                    title: "Klucz",
                    width: "10%",
                    render: (r) => {
                        return `${r.prop_name}`;
                    },
                },
                {
                    title: "Wartość",
                    width: "10%",
                    render: (r) => {
                        return `${r.prop_value}`;
                    },
                },
                {
                    title: "",
                    width: "185px",
                    render: (r, i, t) => {
                        return `
                            <div class="btn secondary" onclick="${t.name}.showEditCategory(${i})">Edytuj <i class="fa fa-cog"></i></div>
                            <div class="btn primary" onclick="${t.name}.openCategory(${i})">Więcej <i class="fas fa-chevron-circle-right"></i></div>
                        `;
                    },
                    escape: false
                }
            ],
            controls: `
                    <div class='float-icon'>
                        <input type="text" placeholder="Filtruj..." data-param="search">
                        <i class="fas fa-search"></i>
                    </div>
                `
        });
    });
</script>

<?php startSection("content"); ?>

<form action="/admin/save-konfiguracja" method="post">
  <div style="max-width:500px;margin:30px auto"><?php
      
      $where = "WHERE 1";
      if ($category) {
        $category = mysqli_real_escape_string($con,$category);
        $where .= ' AND category = "'.$category.'"';
      }
      $stmt = $con->prepare("SELECT prop_id, prop_name, prop_value, prop_name_nice FROM konfiguracja $where");
      
      $stmt->execute();
      $stmt->bind_result($prop_id, $prop_name, $prop_value, $prop_name_nice);
      while (mysqli_stmt_fetch($stmt))
      {
        echo "
          <div class='field-title'>".$prop_name_nice."</div>
          <input class='field' type='text' name='prop_val[$prop_id]' value='".htmlspecialchars($prop_value)."'>
        ";
      }
      $stmt->close();
    ?>
    <input type='submit' class='btn primary fill' value='Zapisz' style="width:100%;margin-top:10px;">  
  </div>
</form>

<div class="mytable"></div>

<?php include "admin/default_page.php"; ?>
