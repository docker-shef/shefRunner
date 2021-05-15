'use strict'

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

    async listContainers() {
        let containers = []
        await dockerCon.listContainers({ "all": true }).then((containers) => {
            containers.forEach((containerInfo) => {
                if (Object.keys(containerInfo.Labels).includes("shef-managed-container")) { // checking container labels for shef-managed-container label
                    tempContainer = {
                        Image: containerInfo.Image,
                        Names: containerInfo.Names,
                        Labels: containerInfo.Labels,
                        State: containerInfo.State
                    };
                }
            })
        });
    }
}

module.exports = Util