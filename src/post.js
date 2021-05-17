const { log } = require("../config/config.js");
const Docker = require("dockerode");
const axios = require("axios");
const _ = require("lodash");
const DockerUtils = require("./dockerUtils");

const dockerCon = new Docker({ socketPath: "/var/run/docker.sock" });
var docker = new DockerUtils(dockerCon);

const createContainer = async (opts) => {
    return await docker.createContainer(opts);
}

const deleteContainer = async (opts) => {
    let listedContainers = await docker.listContainers(opts.serviceName);
    return await docker.removeContainer(listedContainers[0]);
}

const postConducktor = async (check = true) => {
    let listedContainers = await docker.listContainers();
    let runnerSchema = {
        runnerName: global.gConfig.HOST_IP,
        containers: listedContainers
    }

    if (check) {
        let res = await axios.get(global.gConfig.CONDUCKTOR_URL + "/runner", { data: runnerSchema }).catch(e => null);
        if (_.isEmpty(res)) {
            log.info("Deleting containers deleted by Conducktor.");
            for (const container in listedContainers) {
                await deleteContainer(container);
            }
            runnerSchema.containers = await docker.listContainers();
        } else {
            for (const container of res.data.containers) {
                listedContainers = listedContainers.filter(item => item.name !== container.name);
            }
            if (!_.isEmpty(listedContainers)) {
                log.info("Deleting unknown containers.");
                for (const container in listedContainers) {
                    await deleteContainer(container);
                }
                runnerSchema.containers = await docker.listContainers();
            }
        }
    }
    await axios.post(global.gConfig.CONDUCKTOR_URL + "/runner", runnerSchema).then((res) => {
        log.debug(`conducktor post ${JSON.stringify(res.data)}`);
    }).catch((e) => {
        log.error("Something wrong with conducktor endpoint.");
        log.debug(e);
    })
}

const testFunc = async () => {
    const image = await dockerCon.listImages();
    log.debug("image:", image);
}

module.exports = { postConducktor, createContainer, deleteContainer, testFunc };