#!/bin/sh

set -e

echo "Starting project setup..."

echo "Generating .env file from .env.tpl"
ENV=".env"
cp .env.tpl $ENV

PASSPHRASE="abcde"
LOGS_PATH="./logs"
GRAFANA_ADMIN_USER="adminuser"
GRAFANA_ADMIN_PWD="adminpwd"
GRAFANA_USER_NAME="grafanauser"
GRAFANA_USER_MAIL="grafanauser@example.com"
GRAFANA_USER_PWD="grafanauserpwd"
MINIO_ROOT_USER="minioroot"
MINIO_ROOT_PASSWORD="miniorootpwd"
ELASTICSEARCH_PWD="elasticpwd"

if [ "$(uname)" = "Darwin" ]; then
    SED="gsed -i"
else
    SED="sed -i"
fi

echo "Filling in the placeholders in .env file"
$SED "s|^\(PASSPHRASE=\).*|\1${PASSPHRASE}|" $ENV
$SED "s|^\(LOGS_PATH=\).*|\1${LOGS_PATH}|" $ENV
$SED "s|^\(GRAFANA_ADMIN_USER=\).*|\1${GRAFANA_ADMIN_USER}|" $ENV
$SED "s|^\(GRAFANA_ADMIN_PWD=\).*|\1${GRAFANA_ADMIN_PWD}|" $ENV
$SED "s|^\(GRAFANA_USER_NAME=\).*|\1${GRAFANA_USER_NAME}|" $ENV
$SED "s|^\(GRAFANA_USER_MAIL=\).*|\1${GRAFANA_USER_MAIL}|" $ENV
$SED "s|^\(GRAFANA_USER_PWD=\).*|\1${GRAFANA_USER_PWD}|" $ENV
$SED "s|^\(MINIO_ROOT_USER=\).*|\1${MINIO_ROOT_USER}|" $ENV
$SED "s|^\(MINIO_ROOT_PASSWORD=\).*|\1${MINIO_ROOT_PASSWORD}|" $ENV
$SED "s|^\(ELASTICSEARCH_PWD=\).*|\1${ELASTICSEARCH_PWD}|" $ENV

echo "Setting up Ethereal email account"
chmod +x ./scripts/setup_ethereal.sh
./scripts/setup_ethereal.sh

echo "Setting up YAML configuration files"
chmod +x ./scripts/generate_yml_conf_files.sh
./scripts/generate_yml_conf_files.sh

echo "Setting up Thanos Store volume"
chmod +x ./services/metrics/thanosStore/init_volume.sh
./services/metrics/thanosStore/init_volume.sh

echo "Project setup completed successfully."
