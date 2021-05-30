<?php //hook[cron]

if (cronHourlyCondition()) {
    if (shouldRunCron("payment_reminder", CRON_HOURLY_GAP)) {
        sendEmail("wojtekwo997@gmail.com", "bla bla duuuude", "hey payment " . date("H:i:s"));
    }
}
