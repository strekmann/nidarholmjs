import path from "path";

import config from "config";

export default function findPath(configName) {
  let configRoot = "files";
  if (config.paths && config.paths.files) {
    configRoot = config.paths.files;
  }
  let configPath = path.join(configRoot, configName);
  if (config.paths && config.paths[configName]) {
    configPath = config.paths[configName];
  }
  if (configPath[0] !== "/") {
    configPath = path.join(__dirname, "..", "..", "..", configPath);
  }
  return configPath;
}
