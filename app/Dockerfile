FROM node:14

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
#COPY package*.json ./
COPY . /usr/src/app

RUN npm config set user 0
RUN npm ci 
RUN npm run build
RUN npm test

EXPOSE 3000
CMD [ "npm", "run", "start"]