import {Config} from "../config/config";
import {Request, Response} from "./model";

export type HTTPHandle = (conf: Config, request: Request, err: any) => Promise<Response>