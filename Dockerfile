FROM oven/bun:1 AS build

WORKDIR /app

# Cache packages installation
COPY package.json package.json
COPY bun.lock bun.lock

RUN bun install

COPY ./src ./src

ENV NODE_ENV=production

RUN bun build \
  --minify-whitespace \
  --minify-syntax \
  --target bun \
  --outfile ./dist/index.js \
  src/index.ts

RUN bun tsc dist/index.js \ 
  -d --declarationDir dist/lib \
  --declarationMap \
  --emitDeclarationOnly \
  --allowJs

RUN bun build \
  --compile \
  --minify-whitespace \
  --minify-syntax \
  --outfile server \
  src/index.ts

FROM gcr.io/distroless/base

WORKDIR /app

COPY --from=build /app/server server
COPY --from=build /app/dist/lib/index.d.ts dist/index.d.ts

ENV NODE_ENV=production

CMD ["./server"]

EXPOSE 3000
