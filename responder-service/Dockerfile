FROM node:23-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

CMD ["sh", "-c", "export RESPONDER_TOKEN=\"tenant-demo-$(cat /proc/sys/kernel/random/uuid | cut -d'-' -f1)\" && node src/cli.js health --auto --interval 60"]