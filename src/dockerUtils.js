'use strict'

const { isEmpty } = require("lodash");
const { log } = require("../config/config.js");
const streamToPromise = require("stream-to-promise");

class Util {
    constructor(dockerCon) {
        this.dockerCon = dockerCon;
    }

    async ping(cb) {
        await this.dockerCon.ping((err, data) => {
            if (err) {
                return cb(err, {});
            }
            return cb(null, data);
        });
    }

    async listContainers(serviceName = "") {
        let listOpts = { "all": true, "filters": "" };
        if (isEmpty(serviceName)) {
            listOpts["filters"] = { "label": ["shef-managed-container"] }
        } else {
            listOpts["filters"] = {
                "label": [
                    "shef-managed-container",
                    "shef-serviceName=" + serviceName
                ]
            }
        }
        let managedContainers = []
        await this.dockerCon.listContainers(listOpts).then((containers) => {
            containers.forEach((containerInfo) => {
                let tempContainer = {
                    image: containerInfo.Image,
                    name: containerInfo.Names[0].slice(1),
                    state: containerInfo.State,
                    serviceName: containerInfo.Names[0].slice(1, containerInfo.Names[0].length - 7),
                    id: containerInfo.Id
                };
                managedContainers.push(tempContainer)
            })
        });
        return managedContainers;
    }

    async createContainer(opts) {
        let containerSchema = {
            name: opts.serviceName + "-" + ("" + (Math.random())).substring(2, 8),
            Image: opts.image,
            Labels: {
                "shef-managed-container": "true",
                "shef-serviceName": opts.serviceName
            },
            HostConfig: {
                "RestartPolicy": {
                    "Name": "unless-stopped"
                }
            }
        };
        let imageExist = false;
        if (!containerSchema.Image.includes(":")) containerSchema.Image = containerSchema.Image + ":latest";
        for (const image of await this.dockerCon.listImages()) {
            if (image.RepoTags.includes(opts.Image)) {
                imageExist = true;
                break;
            };
        }
        if (!imageExist) {
            await streamToPromise(await this.dockerCon.pull(containerSchema.Image).catch((err) => {
                log.fatal(err);
                throw "Couldn't pull Image!";
            }));
        }
        return await this.dockerCon.createContainer(containerSchema).then((container) => {
            log.info(`Creating ${containerSchema.name} container!`);
            container.start();
            containerSchema.id = container.id;
            return containerSchema;
        }).catch((err) => {
            log.fatal(err);
            throw "Couldn't create container!";
        });
    }

    async removeContainer(opts) {
        try {
            log.info(`Removing ${opts.name} container!`);
            await this.dockerCon.getContainer(opts.id).remove({ "force": true })
            return opts;
        } catch (error) {
            log.fatal(error);
            throw "Couldn't remove container!";
        }
    }
}

module.exports = Util