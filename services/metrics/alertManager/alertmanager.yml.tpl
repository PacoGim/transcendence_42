global:
  smtp_smarthost: ${ALERT_HOST} # SMTP server used for sending emails -> gmail = smtp.gmail.com:587
  smtp_from: "Alertmanager <${ALERT_FROM}>" # sender email address
  smtp_auth_username: ${ALERT_AUTH_USER} # SMTP login (same as smtp_from)
  smtp_auth_password: ${ALERT_AUTH_PWD} # SMTP password (from email provider)
  resolve_timeout: 5m # time to wait before retrying to resolve a notification
  smtp_require_tls: true # enforce TLS for SMTP connection

route: # who to notify and when
  receiver: 'email-receiver' # default receiver
  group_by: ['alertname'] # alerts with the same alertname are grouped together -> avoid spamming
  group_wait: 30s # time to wait before sending the first notification
  group_interval: 5m # time to wait before resending a notification for a group
  repeat_interval: 4h # if an alert is still firing, resend every 4 hours

receivers: # where to send notifications
  - name: 'email-receiver' # email receiver
    email_configs:
      - to: ${ALERT_TO}
        from: "Alertmanager <${ALERT_FROM}>"
        require_tls: true # secure SMTP connection
        headers:
          Subject: 'Alert: {{ .CommonLabels.alertname }}'
        text: |
          ALERTS:
            {{ range .Alerts }}
            - alert: {{ .Labels.alertname }}
              start: {{ .StartsAt }}
              summary: {{ .Annotations.summary }}
            {{ end }}
        html: |
          <html>
            <body>
              <h2>Alert Notification</h2>
              {{ range .Alerts }}
              <div style="margin-bottom:1rem;">
                <p><strong>Alert Name:</strong> {{ .Labels.alertname }}</p>
                <p><strong>Severity:</strong> {{ .Labels.severity }}</p>
                <p><strong>Summary:</strong> {{ .Annotations.summary }}</p>
                <p><strong>Description:</strong> {{ .Annotations.description }}</p>
                <p><strong>Start Time:</strong> {{ .StartsAt.Format "2006-01-02 15:04:05 MST" }}</p>
              </div>
              {{ end }}
            </body>
          </html>


# date "2006-01-02 15:04:05 MST" -> format de date utilise par Go pour le templating (avec MST si on veut afficher le fuseau horaire)