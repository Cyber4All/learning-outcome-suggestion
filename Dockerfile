# ------------------------------------------------------
# Install dependencies and run the build command
# note that we must stay at node 8 for this process till
# gulp is updated from version 3.9.1
# ------------------------------------------------------

# ------------------------------------------------------
# STAGE BUILD
# ------------------------------------------------------
FROM node:8 as build
ARG UNIT_TEST=0
WORKDIR /build
COPY . .
COPY package.json package-lock.json* ./
RUN npm install
RUN if [ "$UNIT_TEST" = "1" ] ; then npm test ; else echo Not running unit tests ; fi
RUN npm run build

# ------------------------------------------------------
# STAGE SERVE
# ------------------------------------------------------
FROM node:12-alpine as serve
ARG PORT=80
ENV PORT $PORT
EXPOSE $PORT
WORKDIR /opt/app
COPY package.json package-lock.json* .env* ./
COPY --from=build /build/dist ./dist
RUN npm install --only=production
CMD ["node", "dist/app.js"]