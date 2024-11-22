create:
	docker run --name projet_cyber -p 8080:8080 -e KEYCLOAK_ADMIN=admin -e KEYCLOAK_ADMIN_PASSWORD=adminpwd quay.io/keycloak/keycloak:latest start-dev

start:
	docker start projet_cyber

stop:
	docker stop projet_cyber

remove:
	docker rm projet_cyber