FROM node:14

# Create app directory
WORKDIR /usr/src/notification-service

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
#COPY package*.json ./
COPY . /usr/src/notification-service

RUN npm ci
RUN npm run build

EXPOSE 443
CMD [ "npm", "run", "start"]