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
    name: string = ""
    message: string = "app ticket is empty"
}

export const throwAppTicketIsEmptyErr = () => {
    throw new AppTicketIsEmptyErr()
}