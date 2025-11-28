#!/bin/bash

set -e

until [ "$(curl -s http://localhost:5601/api/status | jq -r '.status.overall.level')" = "available" ] ; do
  echo "Waiting for Kibana to be ready..."
  sleep 5
done

until curl -s http://elasticsearch:9200/.kibana_task_manager_8.15.0 >/dev/null 2>&1; do
  sleep 5
done

curl -X POST "http://kibana:5601/api/saved_objects/_import?overwrite=true" \
  -H "kbn-xsrf: kibana" \
  -F "file=@/usr/share/kibana/imports/settings.ndjson"

curl -X POST "http://kibana:5601/api/saved_objects/_import?overwrite=true" \
  -H "kbn-xsrf: kibana" \
  -F "file=@/usr/share/kibana/imports/source.ndjson"

curl -X POST "http://kibana:5601/api/saved_objects/_import?overwrite=true" \
  -H "kbn-xsrf: kibana" \
  -F "file=@/usr/share/kibana/imports/dashboards.ndjson"