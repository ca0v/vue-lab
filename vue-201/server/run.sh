# get the port from the command line
# if no port is specified, use 3000
PORT=${1:-3000}
cd ../
npm run build-only
cd ./server/dist
node ../server.js $PORT
