import {requestListener} from "../native/requestListener";
import {Config, startServer as startServer1} from "@larksuite/oapi-core";

export const startServer = (conf: Config, port: number): void => {
    startServer1(requestListener(conf), port)
}