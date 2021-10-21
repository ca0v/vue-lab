export function log(...args) {
  const logger = document.getElementById("logger");
  const logItem = document.createElement("p");
  logger.insertBefore(logItem, logger.firstChild);
  logItem.innerText = args.join("+");
}
