# get the port from the command line
# if no port is specified, use 3000
PORT=${1:-3000}
pushd ../
npm run build-only
popd
node ./server.js $PORT
