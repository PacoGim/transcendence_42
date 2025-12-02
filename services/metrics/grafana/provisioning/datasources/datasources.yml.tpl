apiVersion: 1

datasources:
  - name: prometheus
    type: prometheus
    access: proxy
    url: http://prometheus:${PROMETHEUS_PORT}
    isDefault: true
    version: 1
    editable: false