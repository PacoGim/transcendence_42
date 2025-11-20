import client from 'prom-client'

export const register = new client.Registry();

export const total_queries_executed = new client.Counter({
    name: 'total_db_queries_executed',
    help: 'Total number of database queries executed',
    labelNames: ['query_type', 'status']
})

export const total_failed_queries = new client.Counter({
    name: 'total_db_failed_queries',
    help: 'Total number of failed database queries',
    labelNames: ['query_type', 'error_code']
})

export const total_successful_queries = new client.Counter({
    name: 'total_db_successful_queries',
    help: 'Total number of successful database queries',
    labelNames: ['query_type']
})

export const queries_latency_histogram = new client.Histogram({
    name: 'db_query_latency_seconds',
    help: 'Database query latency in seconds',
    labelNames: ['query_type'],
    buckets: [0.001, 0.01, 0.1, 0.5, 1, 2, 5]
})

register.registerMetric(total_queries_executed)
register.registerMetric(total_failed_queries)
register.registerMetric(total_successful_queries)
register.registerMetric(queries_latency_histogram)

total_queries_executed.inc(0)
total_queries_executed.inc(0)
total_failed_queries.inc(0)
total_successful_queries.inc(0)
queries_latency_histogram.observe(0)