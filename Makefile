TUSCLI_VERSION := $(shell sed -n -e '/^  "version": "/ {s/"[ ,]*$$//;s/^.*"//p;}' package.json)

.PHONY: default
default: build

.PHONY: release
release: build release-docker release-npm

.PHONY: clean
clean:
	rm -f tuscli
	rm -rf node_modules

.PHONY: build
build: build-npm build-docker

.PHONY: build-npm
build-npm:
	@echo Building $(TUSCLI_VERSION)...
	npm update
	npm install
	npm audit --production
	npm run build

.PHONY: build-docker
build-docker:
	docker build --pull -t tuscli -f docker/Dockerfile .
	docker tag tuscli hoijnet/tuscli:$(TUSCLI_VERSION)
	docker tag tuscli hoijnet/tuscli:latest

.PHONY: build-mcp
build-mcp:
	docker build --pull -t tuscli-mcp -f docker/Dockerfile.mcp .
	docker tag tuscli-mcp hoijnet/tuscli-mcp:$(TUSCLI_VERSION)
	docker tag tuscli-mcp hoijnet/tuscli-mcp:latest

.PHONY: release-docker
release-docker:
	docker push hoijnet/tuscli:$(TUSCLI_VERSION)
	docker push hoijnet/tuscli:latest
	docker push hoijnet/tuscli-mcp:$(TUSCLI_VERSION)
	docker push hoijnet/tuscli-mcp:latest

.PHONY: release-npm
release-npm:
	npm publish
