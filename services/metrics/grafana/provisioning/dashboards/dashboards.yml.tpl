apiVersion: 1

providers:
  - name: 'prometheus-dashboards'
    folder: 'monitoring-prom-dashboards'
    type: file
    disableDeletion: false
    updateIntervalSeconds: 10
    allowUiUpdates: false
    options:
      path: ${GRAFANA_DASHBOARDS_PATH}
      foldersFromFilesStructure: true