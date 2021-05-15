#!/usr/bin/env node
'use strict'

const { log } = require("./config/config.js");
const express = require("express");
const Docker = require("dockerode");
const DockerUtils = require("./src/dockerUtils");
const { postConducktor } = require("./src/post");

const dockerCon = new Docker({ socketPath: "/var/run/docker.sock" });

log.info("Log level:", global.gConfig.LOG_LEVEL);

initShefRunner().catch(e => log.error(e));

async function initShefRunner() {
    try {
        log.info("Starting shefRunner.");
        var docker = new DockerUtils(dockerCon);

        await docker.ping((err) => {
            if (err) {
                log.fatal("Docker socket isn't working.", err);
                process.exit(1);
            }
            log.info("Docker connected.");
        });

        log.info("First boot checks!");
        // await checkContainers();
        await postConducktor();

        setInterval(async () => {
            try {
                log.info("Scheduled container checks!");
                // await checkContainers();
                await postConducktor();
            } catch (err) {
                log.fatal("Something wrong with system containers and couldn't restarted.", err);
            }
        }, 20000);

        const app = express();
        app.use(express.json());

        app.post("/container", (req, res) => {
            
        });

        app.put("/container", (req, res) => {
            
        });

        app.delete("/container", (req, res) => {
            
        });

        app.listen(global.gConfig.PORT, () => {
            log.info(`Server listening on port ${global.gConfig.PORT}`);
        });
    } catch (err) {
        throw log.fatal(err);
    }
}
