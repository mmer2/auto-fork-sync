FROM node:latest

LABEL version "1.0"
LABEL description="Probot app to keep GitHub forks in sync with their upstream"
MAINTAINER Jared Murrell <jared@murrell-lab.com>

## These files are copied separately to allow updates
## to the image to be as small as possible
COPY --chown=node:node package.json /opt/auto-fork-sync/
COPY --chown=node:node index.js /opt/auto-fork-sync/
## You should edit .env.example and save it before building this image
## Future updates to this Dockerfile _may_ move this over to
## pure environment variables in Docker, so it can be passed at the CLI.
## This will be purely based on demand
COPY --chown=node:node .env /opt/auto-fork-sync/
## This can probably be removed, but users will have to make sure they
## run the container, then copy the key. This helps avoid that for folks
## using this in their enterprise environments
COPY --chown=node:node auto-fork-sync.pem /opt/auto-fork-sync/.ssh/

## Best practice, don't run as `root`
USER node
## Set our working directory
WORKDIR /opt/auto-fork-sync

## Not strictly necessary, but set permissions to 400
RUN chmod 400 .ssh/auto-fork-sync.pem .env
## Install the app and dependencies
RUN npm install

## This app will listen on port 3000
EXPOSE 3000

## This does not start properly when using the ['npm','start'] format
## so stick with just calling it outright
CMD npm start
