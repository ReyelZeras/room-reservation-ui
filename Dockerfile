# ESTÁGIO 1: Build do Angular
FROM node:20-alpine AS build

WORKDIR /app

# Copia os ficheiros de dependências e instala
COPY package*.json ./
RUN npm install

# Copia o resto do código e gera a versão de produção
COPY . .
RUN npm run build --configuration=production

# ESTÁGIO 2: Servidor Nginx
FROM nginx:alpine

# Remove a configuração padrão do Nginx
RUN rm /etc/nginx/conf.d/default.conf

# Copia a nossa configuração customizada (o arquivo nginx.conf)
COPY nginx.conf /etc/nginx/conf.d/

# Copia a build do Angular do Estágio 1 para a pasta pública do Nginx
# NOTA: O Angular 17+ coloca a build dentro da pasta "browser".
COPY --from=build /app/dist/room-reservation-ui/browser /usr/share/nginx/html

# Expõe a porta 80 do Nginx
EXPOSE 80

# Inicia o Nginx
CMD ["nginx", "-g", "daemon off;"]
