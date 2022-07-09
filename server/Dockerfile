FROM node:lts-alpine3.16

WORKDIR /dapp

# COPY package*.json ./

# COPY . .

# RUN npm install


# COPY ui/package*.json ui/

# RUN npm run install-client 

# COPY server/package*.json server/

# RUN npm run install-server

# COPY  ui/ ui/

# RUN npm run build --prefix ui

# COPY server/ server/

# EXPOSE 8000
COPY package*.json  .
RUN npm ci
COPY . .
EXPOSE 7000
CMD ["npm", "start"]