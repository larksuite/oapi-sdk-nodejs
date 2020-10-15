import {RequestListener} from "http";
import {httpHandle} from "../http";
import {Config, requestListener as requestListener1} from "@larksuiteoapi/core";

export const requestListener = (conf: Config): RequestListener => {
    return requestListener1(conf, httpHandle)
}