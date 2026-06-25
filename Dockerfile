# Estagio 1 - instala dependencias e gera o build de producao
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Estagio 2 - copia apenas o dist/ e sobe o servidor estatico
FROM node:20-alpine
RUN npm install -g serve
COPY --from=builder /app/dist /app/dist
EXPOSE 3039
CMD ["serve", "-s", "/app/dist", "-l", "3039"]
