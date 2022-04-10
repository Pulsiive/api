FROM node:14.18.1

WORKDIR /usr/src/app/api

COPY package.json ./

RUN npm install

COPY . .

EXPOSE 8080

COPY migrate.sh /usr/local/bin/migrate.sh

RUN chmod +x /usr/local/bin/migrate.sh

CMD /usr/local/bin/migrate.sh