TUSCLI_VERSION := $(shell sed -n -e '/^  "version": "/ {s/"[ ,]*$$//;s/^.*"//p;}' package.json)

.PHONY: default
default: build

.PHONY: release
release: build release-docker release-npm

.PHONY: clean
clean:
	rm tuscli
	rm -rf node_modules

.PHONY: build
build:
	@echo Building $(TUSCLI_VERSION)...
	npm update
	npm install
	npm audit --production
	npm run build
	docker build --pull -t tuscli -f docker/Dockerfile .
	docker tag tuscli hoijnet/tuscli:$(TUSCLI_VERSION)
	docker tag tuscli hoijnet/tuscli:latest

.PHONY: release-docker
release-docker:
	docker push hoijnet/tuscli:$(TUSCLI_VERSION)
	docker push hoijnet/tuscli:latest

.PHONY: release-npm
release-npm:
	npm publish
