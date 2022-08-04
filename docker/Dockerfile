FROM node AS build

RUN mkdir -p /build
COPY src /build/src
COPY dist /build/dist
COPY types /build/types
COPY package.json /build/
COPY package-lock.json /build/
COPY tsconfig.json /build/
WORKDIR /build

RUN rm package-lock.json
RUN npm install
RUN npx npm run buildexe
RUN chmod 755 /build/bin/tuscli

FROM scratch
COPY --from=build /build/bin/tuscli /bin/tuscli
USER 998

ENTRYPOINT ["/bin/tuscli"]
CMD ["--help"]