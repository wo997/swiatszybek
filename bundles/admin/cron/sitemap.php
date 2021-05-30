<?php //hook[cron]

if (cronTimeCondition("00:00:00", "01:00:00")) {
    if (shouldRunCron("generate_sitemap", CRON_DAILY_GAP)) {
        generateSitemap();
        // lovely
        //sendEmail("wojtekwo997@gmail.com", "sitemap generated ;)", "when " . date("H:i:s"));
    }
}
