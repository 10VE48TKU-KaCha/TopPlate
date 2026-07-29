FROM node:18-alpine AS base

WORKDIR /app

COPY package.json ./
RUN npm install

ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

RUN npm run build

EXPOSE 3000

ENV PORT 3000

CMD ["sh", "-c", "npm start -- -p ${PORT:-3000}"]
