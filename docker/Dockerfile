FROM ubuntu:latest AS build

RUN apt-get update && DEBIAN_FRONTEND=noninteractive apt-get install -y nodejs python npm git

RUN mkdir -p /build
COPY src /build/src
COPY dist /build/dist
COPY types /build/types
COPY package.json /build/
COPY package-lock.json /build/
COPY tsconfig.json /build/
WORKDIR /build

RUN npm install
RUN npm run buildnexe

FROM ubuntu:latest
COPY --from=build /build/tuscli /bin/tuscli
RUN chmod 755 /bin/tuscli
RUN useradd user

# Drop root
USER user

ENTRYPOINT ["/bin/tuscli"]
CMD ["--help"]
