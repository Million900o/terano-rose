import TeranoWorker from "../lib/TeranoWorker";

import { readdir, stat } from "fs";
import { resolve } from "path";

export default function loadFunctions(worker: TeranoWorker) {
  function loadEvents(dir: string) {
    readdir(dir, (err, files) => {
      if (err) return console.error(err.toString());
      for (const file of files) {
        stat(resolve(dir, file), (e, stats) => {
          if (e) return console.error(e.toString());
          if (stats.isDirectory()) return loadEvents(`${dir}/${file}`);
          if (stats.isFile() && file.endsWith('.js')) {
            const event = require(`${dir}/${file}`).default;
            worker.logger.log('Loaded event:', `${file}`);
            event(worker);
          }
        });
      }
    });
  }
  loadEvents(resolve(__dirname, '../', './events'));
}
