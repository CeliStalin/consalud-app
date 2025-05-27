FROM node:20

WORKDIR /app

COPY package*.json ./
COPY consalud-core-1.0.0.tgz ./

RUN npm install --force && npm cache clean --force

COPY . .

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host"]
