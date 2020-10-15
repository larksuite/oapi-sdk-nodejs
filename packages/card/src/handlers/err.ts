export class NotHandlerErr implements Error {
    name: string = "NotHandlerErr"
    message: string = "not find handler"

    toString(): string {
        return this.message
    }
}

export class SignatureErr implements Error {
    name: string = "SignatureErr"
    message: string = "signature Err"

    toString(): string {
        return this.message
    }
}