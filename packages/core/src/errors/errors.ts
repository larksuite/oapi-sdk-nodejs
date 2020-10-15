export class TokenInvalidErr extends Error {
    name: string = "TokenInvalidErr"
    message: string = "token invalid"
}

export const throwTokenInvalidErr = () => {
    throw new TokenInvalidErr()
}

