#!/usr/bin/env node
'use strict'

const { log } = require("./config/config.js");
const express = require("express");
const Docker = require("dockerode");
const DockerUtils = require("./src/dockerUtils");
const post = require("./src/post");

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
        await post.postConducktor();
        // await post.testFunc();

        setInterval(async () => {
            try {
                log.debug("Scheduled container checks!");
                await post.postConducktor();
            } catch (err) {
                log.fatal("Something wrong.", err);
            }
        }, 30000);

        const app = express();
        app.use(express.json());

        app.post("/container", async (req, res) => {
            let container = req.body;
            log.debug(container);
            await post.createContainer(container.opts)
                .then(reply => {
                    log.debug(reply);
                    res.json(reply)
                })
                .catch((err) => {
                    log.error(err);
                    res.status(409).json({ error: err });
                })
            await post.postConducktor(false);
        });

        app.delete("/container", async (req, res) => {
            let container = req.body;
            await post.deleteContainer(container)
                .then(reply => {
                    log.debug(reply);
                    res.json(reply);
                })
                .catch((err) => {
                    log.error(err);
                    res.status(409).json({ error: err });
                })
            await post.postConducktor(false);
        });

        app.get("/health", (req, res) => {
            res.status(200).send({ OK: true });
        });

        app.listen(global.gConfig.PORT, () => {
            log.info(`Server listening on port ${global.gConfig.PORT}`);
        });
    } catch (err) {
        throw log.fatal(err);
    }
}
