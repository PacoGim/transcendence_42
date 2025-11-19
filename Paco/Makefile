up: docker-required
	docker compose build
	docker compose up -d
	docker compose logs -f

docker-required:
	@docker info >/dev/null 2>&1 || { \
		echo "Docker not running. Launching Docker Desktop..."; \
		open -a Docker; \
		echo "Waiting for Docker to start..."; \
		while ! docker info >/dev/null 2>&1; do \
			sleep 2; \
		done; \
		echo "Docker is running."; \
	}

it:
	docker exec -it backend bash

down:
	docker compose down

nuke:
	docker ps -q | xargs -r docker stop
	docker system prune -fa --volumes

fclean:
	find . -type d -name node_modules -prune -exec rm -rf '{}' +
