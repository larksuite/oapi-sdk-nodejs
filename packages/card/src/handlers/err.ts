export class NotFoundHandlerErr implements Error {
    name: string = "NotFoundHandlerErr"
    message: string = "card, not found handler"

    toString(): string {
        return this.message
    }
}

export class SignatureErr implements Error {
    name: string = "SignatureErr"
    message: string = "signature error"

    toString(): string {
        return this.message
    }
}