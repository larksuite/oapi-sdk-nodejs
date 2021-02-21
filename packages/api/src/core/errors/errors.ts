import {Response} from "../response/response"
import {Err} from "../response/error";

export const throwAccessTokenTypeIsInValidErr = () => {
    throw new Error("access token type invalid")
}
export const throwTenantKeyIsEmptyErr = () => {
    throw new Error("tenant key is empty")
}
export const throwUserAccessTokenKeyIsEmptyErr = () => {
    throw new Error("user access token is empty")
}

export class AppTicketIsEmptyErr extends Error {
    name: string = "AppTicketIsEmptyErr"
    message: string = "app ticket is empty"
}

export const throwAppTicketIsEmptyErr = () => {
    throw new AppTicketIsEmptyErr()
}

export class AccessTokenObtainErr extends Error {
    name: string = "AccessTokenObtainErr"
    response: Response<any>
    code: number
    msg: string
    error: Err

    constructor(message: string, response: Response<any>) {
        super(message);
        this.response = response
        this.code = response.code;
        this.msg = response.msg;
        this.error = response.error;
    }
}