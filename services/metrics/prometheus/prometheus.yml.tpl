global:
  scrape_interval: 15s
  evaluation_interval: 15s
  external_labels:
    cluster: "local"
    replica: "prometheus-1"

scrape_configs:
  - job_name: 'cadvisor'
    static_configs:
      - targets: ['cadvisor:${CADVISOR_PORT}']
  - job_name: 'node_exporter'
    static_configs:
      - targets: ['node_exporter:${NODE_EXPORTER_PORT}']
  - job_name: 'db_metrics'
    static_configs:
      - targets: ['database:${DB_PORT}']
  - job_name: 'docker_custom_exporter'
    static_configs:
      - targets: ['docker_custom_exporter:${DOCKER_CUSTOM_EXPORTER_PORT}']
  - job_name: 'server'
    scheme: https
    tls_config:
      insecure_skip_verify: true
    static_configs:
      - targets: ['server:${SERVER_PORT}']

rule_files:
  - "./rules/alerts.yml"

alerting:
  alertmanagers:
    - static_configs:
        - targets:
            - 'alert_manager:${ALERTMANAGER_PORT}'

# data exporters = petits programmes qui transforment les metriques d'une appli en format comprehensible par prometheus
# integration = config de prometheus pour aller chercher les donnees de ces exporters via leurs endpoints

# docker containers = cAdvisor
# sqlite3 = exporter custom
# server = exporter custom
# linux/VM system stats = node_exporter



# TODO:
#  ajouter alerts en cas de metrics down (pas d'acces a l'endpoint)