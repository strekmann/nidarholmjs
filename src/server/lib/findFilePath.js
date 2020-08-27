import path from "path";

import config from "config";

export default function findPath(configName) {
  const configRoot = process.env.FILE_PATH || "files";
  let configPath = path.join(configRoot, configName);
  if (config.paths && config.paths[configName]) {
    configPath = config.paths[configName];
  }
  if (configPath[0] !== "/") {
    configPath = path.join(__dirname, "..", "..", "..", configPath);
  }
  return configPath;
}
