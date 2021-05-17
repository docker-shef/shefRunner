const _ = require("lodash");
const bunyan = require("bunyan");
const { isIPv4 } = require("net");
const config = require("./config.json");

const defaultConfig = config.development;
const environment = process.env.NODE_ENV || "development";
const environmentConfig = config[environment];
const finalConfig = _.merge(defaultConfig, environmentConfig);
finalConfig.LOG_LEVEL = (process.env.LOG_LEVEL || finalConfig.LOG_LEVEL).toLowerCase();
if( environment == "production" ) {
    var log = bunyan.createLogger({ name: "shefRunner", level: finalConfig.LOG_LEVEL, localtime: new Date().toISOString() });
} else {
    var log = bunyan.createLogger({ name: "shefRunner", level: finalConfig.LOG_LEVEL});
}

finalConfig.HOST_IP = process.env.HOST_IP || finalConfig.HOST_IP;
if (!isIPv4(finalConfig.HOST_IP)) {
    throw log.fatal("HOST_IP environment variable is not a valid IPv4 address!");
}

finalConfig.MASTER_HOST = process.env.MASTER_HOST || finalConfig.MASTER_HOST || finalConfig.HOST_IP;
if (!isIPv4(finalConfig.MASTER_HOST)) {
    throw log.fatal("MASTER_HOST environment variable is not a set properly!");
}

finalConfig.PORT = 11044;
finalConfig.CONDUCKTOR_URL = "http://" + finalConfig.MASTER_HOST + ":8044";
finalConfig.LOG_LEVEL = process.env.LOG_LEVEL || finalConfig.LOG_LEVEL;

log.info("Timezone", Intl.DateTimeFormat().resolvedOptions().timeZone);

global.gConfig = finalConfig;

module.exports = { log };