import {requestListener} from "../native/native";
import {Config, startServer as startServer1} from "@larksuiteoapi/core";

export const startServer = (conf: Config, port: number): void => {
    startServer1(requestListener(conf), port)
}