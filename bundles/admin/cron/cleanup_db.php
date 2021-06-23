<?php //hook[cron]

if (cronTimeCondition("01:00:00", "02:00:00")) {
    if (shouldRunCron("cleanup_db", CRON_DAILY_GAP)) {
        sendEmail("wojtekwo997@gmail.com", "cleanup_db", "when " . date("H:i:s"));
        // TODO: only if cart is empty? :)
        // should we really do it? cmon
        //DB::execute("DELETE FROM `user` WHERE type = 'guest' AND last_active_at < ?", [date("Y-m-d H:i:s", strtotime("-7 days"))]);
    }
}
