import config from 'config';
import path from 'path';

export default function findPath(configName) {
    let configRoot = 'files';
    if (config.paths && config.paths.images) {
        configRoot = config.paths.images;
    }
    let configPath = path.join(configRoot, configName);
    if (config.paths && config.paths[configName]) {
        configPath = config.paths[configName];
    }
    if (configPath[0] !== '/') {
        configPath = path.join(__dirname, '..', '..', '..', configPath);
    }
    return configPath;
}
