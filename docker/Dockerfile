FROM ubuntu:latest AS build

COPY . /build
WORKDIR /build

RUN apt-get update && DEBIAN_FRONTEND=noninteractive apt-get install -y nodejs python3 npm

RUN npm install
RUN npm run buildnexe

FROM alpine:latest
COPY --from=build /build/tuscli /bin/tuscli
RUN useradd user

# Drop root
USER user

CMD [ "cat" ]
