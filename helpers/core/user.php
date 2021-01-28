<?php

class User
{
    public static ?User $current_user = null;
    public $cart;
    public $data;
    public $priveleges;
    public $display_name;

    public static $email_client_urls = [
        "gmail.com" => "https://mail.google.com/",
        "wp.pl" => "https://profil.wp.pl/",
        "outlook.com" => "https://outlook.live.com/",
        "yahoo.com" => "https://mail.yahoo.com/",
        "icloud.com" => "https://icloud.com/mail",
        "aol.com" => "https://mail.aol.com/",
        "o2.pl" => "https://poczta.o2.pl/",
    ];

    public static $privelege_list = [
        ["privelege_id" => 0, "name" => "Gość", "backend_access" => false],
        ["privelege_id" => 1, "name" => "Klient", "backend_access" => false],
        ["privelege_id" => 2, "name" => "Admin", "backend_access" => true],
        ["privelege_id" => 3, "name" => "Sprzedawca", "backend_access" => true],
    ];


    public function __construct($user_id)
    {
        $this->id = $user_id;

        $this->setData();
        if (!$this->data) {
            return;
        }

        $this->cart = new Cart($this->getId());
    }

    private function setData()
    {
        $this->data = DB::fetchRow("SELECT * FROM user WHERE user_id = " . $this->id);

        $this->priveleges = arrayFind(self::$privelege_list, function ($p) {
            return $p["privelege_id"] === $this->data["privelege_id"];
        }, self::$privelege_list[0]);

        $this->display_name = $this->data["email"];
    }

    public function getDisplayName()
    {
        return $this->display_name;
    }

    /** 
     * @typedef RegisterData {
     * email: string
     * first_name: string
     * last_name: string
     * password: string
     * phone?: string
     * }
     */

    /**
     * @param RegisterData $data
     */
    public function register($data)
    {
        $res =
            /** @var ValidationResponse */
            [
                "errors" => [],
                "success" => false
            ];

        $existing_user_id = DB::fetchVal("SELECT user_id FROM user WHERE type = 'regular' AND email = ?", [$data["email"]]);
        if ($existing_user_id !== $this->getId()) {
            $this->id = $existing_user_id;
            $this->setData();
        }

        if ($this->data["authenticated"]) {
            $res["errors"][] = "Konto zostało już aktywowane!";
            return $res;
        }

        // if the user seems to be new
        if ($this->data["type"] !== "regular") {
            if (!validateEmail($data["email"])) {
                $res["errors"][] = "Wpisz poprawny email";
                return $res;
            }
            if (!validatePassword($data["password"])) {
                $res["errors"][] = "Wpisz poprawne hasło";
                return $res;
            }

            $password_hash = "";

            $authentication_token = Security::generateToken();

            $this->id = DB::insert("user", array_merge(filterArrayKeys($data, ["email", "first_name", "last_name", "phone"]),  [
                "password_hash" => $password_hash,
                "created_at" => date("Y-m-d.H:i:s"),
                "type" => "regular",
                "authentication_token" => $authentication_token,
                "authentication_token_untill" => date("Y-m-d H:i:s", strtotime("+24 hours"))
            ]));
            $this->setData();
        }

        $this->sendActivationLink();

        $res["success"] = true;
        return $res;
    }

    public function sendActivationLink()
    {
        if ($this->data["authenticated"]) {
            return false;
        }
        $message = "
            <h3>Kliknij w link poniżej, żeby aktywować swoje konto</h3>
            <br><a style='font-size:18px;font-weight:bold;' href='" . SITE_URL . "/activate_account/" .  $this->getId() . "/" . $this->data["authentication_token"] . "'>Aktywuj</a>
        ";
        $mailTitle = "Aktywacja konta " . "LSIT" . " " . date("d-m-Y");
        $message .= getEmailFooter();

        @sendEmail($this->data["email"], $message, $mailTitle);
    }

    public function login($email_or_login, $password)
    {
        $res =
            /** @var ValidationResponse */
            [
                "errors" => [],
                "success" => false
            ];

        $user_data = DB::fetchRow("SELECT user_id, authenticated, password_hash FROM user WHERE email = ? OR login = ?", [strtolower($email_or_login), $email_or_login]);
        if (!$user_data) {
            $res["errors"][] = "Użytkownik nie istnieje";
            return $res;
        }

        if (!password_verify($password, $user_data["password_hash"])) {
            $res["errors"][] = "Niepoprawne hasło";
            return $res;
        }

        $this->authenticated($user_data["user_id"]);

        return $res;
    }

    public function authenticated($user_id)
    {
        $_SESSION["user_id"] = $user_id;

        // warmup user ezy
        self::$current_user = null;
        self::getCurrent();
    }

    public function getId()
    {
        return $this->id;
    }

    public function isLoggedIn()
    {
        return !!$this->id;
    }

    /**
     * getCurrent
     *
     * @return User
     */
    public static function getCurrent()
    {
        if (!self::$current_user) {
            $user_id = def($_SESSION, "user_id", null);

            if (!$user_id) {
                // even a guest will have a user in db for tracking purpose lol
                // hey - I think we can remove old users if they did nothing, ezy
                DB::execute("INSERT INTO user (type,visited_at) VALUES ('guest','" . date("Y-m-d H:i:s") . "')");
                $user_id = DB::insertedId();
            }

            $_SESSION["user_id"] = $user_id;

            self::$current_user = new User($user_id);
            if (!self::$current_user->data) {
                // just in case
                unset($_SESSION["user_id"]);
                self::$current_user = null;
                return self::getCurrent();
            }
        }

        return self::$current_user;
    }

    public static function activateAccount($user_id, $authentication_token)
    {
        $res =
            /** @var ValidationResponse */
            [
                "errors" => [],
                "success" => false
            ];

        if (!$user_id || !$authentication_token) {
            $res["erros"][] = "Wystąpił błąd aktywacji konta";
            return $res;
        }

        DB::execute("UPDATE user SET authenticated = 1, authentication_token = '' WHERE user_id = ? AND authentication_token = ?", [
            $user_id, $authentication_token
        ]);

        $user_data = DB::fetchRow("SELECT email, authenticated FROM user WHERE user_id = ?", [$user_id]);

        if ($user_data["authenticated"] == "1") {
            self::getCurrent()->authenticated($user_id);
        } else {
            $res["errors"][] = "Wystąpił błąd aktywacji konta";
            return $res;
        }

        $res["success"] = true;
        return $res;
    }
}


define("visitor_priveleges", ["backend_access" => false]);
$privelege_list = [
    ["id" => 0, "name" => "Klient", "backend_access" => false],
    ["id" => 1, "name" => "Admin", "backend_access" => true],
    ["id" => 2, "name" => "Sprzedawca", "backend_access" => true],
];

function initUser()
{
    global $app;

    if (isset($_SESSION["user"])) {
        $app["user"] = $_SESSION["user"];
    } else {
        $app["user"] = [
            "id" => null,
            "privelege_id" => visitor_priveleges,
            "type" => "",
            "email" => ""
        ];
    }

    if (!isset($_SESSION["user"]) && isset($_COOKIE["remember_me_token"])) {
        $user_data = DB::fetchRow("SELECT * FROM `users` WHERE user_type = 'regular' AND authenticated = 1 AND remember_me_token = ?", [$_COOKIE["remember_me_token"]]);
        if ($user_data) {
            loginUser($user_data["user_id"], $user_data["email"], "regular", ["name" => $user_data["email"]], false);
        }
    }

    $app["user"]["priveleges"] = array_merge(visitor_priveleges, $app["user"]["privelege_id"]);

    if (empty($_SESSION["basket"]) || $_SESSION["basket"] == "null" || !$_SESSION["basket"]) {
        $b = "[]";
        if (isset($_COOKIE["basket"])) {
            $b = $_COOKIE["basket"];
        }
        setBasketData($b);
    }
}

function adminRequired()
{
    global $app;
    if (!User::getCurrent()->priveleges["backend_access"]) {
        $_SESSION["redirect_on_login"] = $_SERVER["REQUEST_URI"];
        redirect("/logowanie");
    }
}

function loginUser($user_id, $email, $user_type, $data = [])
{
    global $privelege_list;

    $_SESSION["just_logged_in"] = true;

    $user_data = DB::fetchRow("SELECT * FROM users WHERE user_id = $user_id");

    $user = [
        "id" => $user_id,
        "privelege_id" => getRowById($privelege_list, $user_data["privelege_id"]),
        "type" => $user_type,
        "email" => $email,
    ];

    if (isset($data["name"])) {
        $user["name"] = $data["name"];
    }

    $_SESSION["user"] = $user;

    // bring basket back if empty only?
    $basket = $user_data["basket"];
    // I think we should prompt the user in other case what he wanna do, correct?
    if ($basket && count(getBasketData()) < 1) {
        setBasketData($basket);
    }

    $last_viewed_products_safe_string = preg_replace("/[^0-9,]/", "", $user_data["last_viewed_products"]);
    $last_viewed_products = explode(",", $last_viewed_products_safe_string);
    addLastViewedProducts($last_viewed_products, false);

    if (isset($_SESSION["redirect_on_login"])) {
        $url = $_SESSION["redirect_on_login"];
        unset($_SESSION["redirect_on_login"]);
        redirect($url);
    } else {
        reload();
    }
}

function getPasswordHash($val)
{
    return password_hash($val, PASSWORD_BCRYPT, ['cost' => 12]);
}

function generateAuthenticationToken($length = 14)
{
    return bin2hex(random_bytes($length));
}
