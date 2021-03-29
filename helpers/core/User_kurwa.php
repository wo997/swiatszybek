<?php

// TODO: user will have multiple options to authenticate but these will target to a single user account, really simple

class User
{
    private static ?User $current_user = null;
    public $cart;
    public $last_viewed_products;
    /** @var Entity User */
    public $entity;
    public $priveleges;
    public $display_name;
    private $id;

    public static $email_client_urls = [
        "gmail.com" => "https://mail.google.com/",
        "wp.pl" => "https://profil.wp.pl/",
        "outlook.com" => "https://outlook.live.com/",
        "yahoo.com" => "https://mail.yahoo.com/",
        "icloud.com" => "https://icloud.com/mail",
        "aol.com" => "https://mail.aol.com/",
        "o2.pl" => "https://poczta.o2.pl/",
    ];

    public static $user_roles = [
        ["role_id" => 0, "name" => "Gość", "backend_access" => false],
        ["role_id" => 1, "name" => "Klient", "backend_access" => false],
        ["role_id" => 2, "name" => "Admin", "backend_access" => true],
        ["role_id" => 3, "name" => "Sprzedawca", "backend_access" => true],
    ];

    public function __construct($user_id)
    {
        $this->id = $user_id;
        $this->setData();

        if (!$this->entity) {
            return;
        }

        $this->cart = new Cart($this);
        $this->last_viewed_products = new LastViewedProducts($this);
    }

    public static function getEmailclientUrl($email)
    {
        $email_domain = def(explode("@", $email), 1);
        $email_client_url = def(User::$email_client_urls, $email_domain, "");
        return $email_client_url;
    }

    private function setData()
    {
        if ($this->entity) {
            $this->entity->setCurrSimpleProps();
        } else {
            $this->entity = EntityManager::getEntityById("user", $this->id);
        }

        if (!$this->entity) {
            // if ($this->id === User::getCurrent()->id) {
            //     $this->logout();
            //     Request::redirect("/");
            // } else {
            // }
            return;
        }

        $priveleges = self::$user_roles[0];
        foreach (self::$user_roles as $p) {
            if ($p["role_id"] === $this->entity->getProp("role_id")) {
                $priveleges = $p;
            }
        }
        $this->priveleges = $priveleges;

        $this->display_name = $this->entity->getProp("email");
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

        $authenticated = DB::fetchVal("SELECT authenticated FROM user WHERE type = 'regular' AND email = ?", [$data["email"]]);
        if ($authenticated === 1) {
            $res["errors"][] = "Konto zostało już aktywowane!";
            $res["is_info"] = true;
            return $res;
        }
        // if ($authenticated === 0) {
        //     $res["errors"][] = "Konto zostało już aktywowane!";
        //     $res["is_info"] = true;
        //     return $res;
        // }

        // if the user seems to be new
        if ($this->entity->getProp("type") !== "regular") {
            if (!validateEmail($data["email"])) {
                $res["errors"][] = "Wpisz poprawny email";
                return $res;
            }
            if (!validatePassword($data["password"])) {
                $res["errors"][] = "Wpisz poprawne hasło";
                return $res;
            }

            $password_hash = Security::getPasswordHash($data["password"]);

            $this->id = DB::insert("user", [
                "email" => trim($data["email"]),
                "password_hash" => $password_hash,
                "created_at" => date("Y-m-d.H:i:s"),
                "type" => "regular",
                "role_id" => 1
            ]);

            // $this->id = DB::insert("user", array_merge(filterArrayKeys($data, ["email", "first_name", "last_name", "phone"]),  [
            //     "password_hash" => $password_hash,
            //     "created_at" => date("Y-m-d.H:i:s"),
            //     "type" => "regular",
            // ]));
            $this->setData();
        }

        return $this->sendActivationLink(
            $this->getId()
        );
    }

    public static function resetPassword($data)
    {
        $res =
            /** @var ValidationResponse */
            [
                "errors" => [],
                "success" => false
            ];

        $reset = Security::useAuthenticationToken("reset_user_" . $data["user_id"], $data["authentication_token"]);

        if (!$reset["success"]) {
            return $reset;
        }

        DB::update("user", ["password_hash" => Security::getPasswordHash($data["password"])], "user_id = " . intval($data["user_id"]));
        self::getCurrent()->setData();

        $res["success"] = true;
        return $res;
    }

    public function changePassword($current_password, $password)
    {
        $res =
            /** @var ValidationResponse */
            [
                "errors" => [],
                "success" => false
            ];

        /** @var Entity User */
        $user = $this->entity;

        if (!Security::verifyPassword($current_password, $user->getProp("password_hash"))) {
            $res["errors"][] = "Obecne hasło jest niepoprawne";
            return $res;
        }

        DB::update("user", ["password_hash" => Security::getPasswordHash($password)], "user_id = " . $this->getId());
        $this->setData();

        $res["success"] = true;
        return $res;
    }

    public static function sendResetPasswordLink($email)
    {
        $res =
            /** @var ValidationResponse */
            [
                "errors" => [],
                "success" => false
            ];

        $user_data = DB::fetchRow("SELECT user_id, authenticated FROM user WHERE type = 'regular' AND email = ?", [$email]);
        if (!$user_data) {
            $res["errors"][] = "Konto nie istnieje";
            return $res;
        }

        if (!$user_data["authenticated"]) {
            // probably an exception but let's send it anyway in case the user is silly
            return self::sendActivationLink($user_data["user_id"]);
        }

        $authentication_token = Security::createAuthenticationToken("reset_user_" . $user_data["user_id"]);

        $message = "
            <h3>Kliknij w przycisk poniżej, żeby potwierdzić chęć zresetowania hasła</h3>
            <a style=\"font-size: 1.3em;padding: 5px;background: #15c;border-radius: 4px;color: #fff;text-decoration: none;width: 130px;display: inline-block;text-align: center;\" href=\"" . SITE_URL . "/zresetuj-haslo/" .  $user_data["user_id"] . "/" . $authentication_token . "\">Resetuj hasło</a>
        ";

        $mailTitle = "Resetowanie hasła konta " . $email . " - LSIT";
        $message .= getEmailFooter();

        sendEmail($email, $message, $mailTitle);

        $res["success"] = true;
        return $res;
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

        if (!Security::verifyPassword($password, $user_data["password_hash"])) {
            $res["errors"][] = "Niepoprawne hasło";
            return $res;
        }

        $this->authenticated($user_data["user_id"]);

        Request::setSingleUsageSessionVar("just_logged_in", true);

        if (isset($_SESSION["redirect_on_login"])) {
            $res["data"]["redirect_url"] = $_SESSION["redirect_on_login"];
            unset($_SESSION["redirect_on_login"]);
        } else {
            if (self::getCurrent()->priveleges["backend_access"]) {
                $res["data"]["redirect_url"] = Request::$static_urls["ADMIN"] . "/pulpit";
            }
        }

        $res["success"] = true;
        return $res;
    }

    public function logout()
    {
        unset($_SESSION["user_id"]);
        unset($_SESSION["redirect_on_login"]);
        unset($_SESSION["current_user_cart_json"]);
        unset($_SESSION["current_user_last_viewed_products_json"]);
        setcookie("remember_me_token", "", 0);
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
        return $this->entity->getProp("role_id") !== 0;
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
            if (!self::$current_user->entity) {
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
            $res["erros"][] = "Błąd krytyczny";
            return $res;
        }

        $activate = Security::useAuthenticationToken("activate_user_$user_id", $authentication_token);

        if (!$activate["success"]) {
            return $activate;
        }

        DB::execute("UPDATE user SET authenticated = 1 WHERE user_id = ?", [
            $user_id
        ]);
        self::getCurrent()->authenticated($user_id);

        $res["success"] = true;
        return $res;
    }

    public static function sendActivationLink($user_id)
    {
        $res =
            /** @var ValidationResponse */
            [
                "errors" => [],
                "success" => false
            ];

        $user_data = DB::fetchRow("SELECT email, authenticated FROM user WHERE user_id = ?", [$user_id]);
        if (!$user_data) {
            $res["errors"][] = "Konto nie istnieje!";
            return $res;
        }
        if ($user_data["authenticated"]) {
            $res["errors"][] = "Konto zostało już aktywowane!";
            $res["is_info"] = true;
            return $res;
        }

        $authentication_token = Security::createAuthenticationToken("activate_user_$user_id");

        $message = "
            <h3>Kliknij w przycisk poniżej, żeby aktywować swoje konto</h3>
            <a style=\"font-size: 1.3em;padding: 5px;background: #15c;border-radius: 4px;color: #fff;text-decoration: none;width: 130px;display: inline-block;text-align: center;\" href=\"" . SITE_URL . "/konto/aktywuj/$user_id/$authentication_token\">Aktywuj konto</a>

        ";

        $mailTitle = "Aktywacja konta " . $user_data["email"] . " - LSIT";
        $message .= getEmailFooter();

        sendEmail($user_data["email"], $message, $mailTitle);

        $res["success"] = true;
        return $res;
    }
}
