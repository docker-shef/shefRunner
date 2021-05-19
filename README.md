[![Docker Build](https://github.com/docker-shef/shefRunner/actions/workflows/main.yml/badge.svg)](https://github.com/docker-shef/shefRunner/actions)

## POC Docker-shef shefRunner🛵 Repository

ShefRunner is docker host agent of the system. It is responsible for creating and deleting containers ordered by Conducktor.

For docker-shef system details visit [here](https://github.com/docker-shef/docker-shef).

## shefRunner Specific Configurations

There is just 3 variables to configure shefRunner service manually:

| VARIABLE    | DESCRIPTION                                                  | OPTIONS                                  |
| ----------- | ------------------------------------------------------------ | ---------------------------------------- |
| LOG_LEVEL   | decides the log output level, default: info                  | fatal<br /> error<br /> info<br /> debug |
| HOST_IP     | IPv4 address of docker host, default: ""                     | Valid IPv4 address                       |
| MASTER_HOST | IPv4 address of master docker-shef host that contains Conducktor service, default: HOST_IP | Valid IPv4 address                       |