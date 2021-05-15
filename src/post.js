const { log } = require("../config/config.js");
const Docker = require("dockerode");
const axios = require("axios");

const dockerCon = new Docker({ socketPath: "/var/run/docker.sock" });

const postConducktor = async () => {
    if (await checkExist(dockerCon, opts)) {
        return true;
    } else {
        return await dockerCon.createContainer(opts)
            .then(function (container) {
                log.debug(`Creating ${opts.name} container!`);
                container.start();
                return true;
            }).catch(function (err) {
                log.fatal(err);
            });
    }
}

module.exports = {postConducktor};