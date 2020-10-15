export enum ErrCode {
    IO = -1,
    Ok = 0,
    AppTicketInvalid = 10012,
    AccessTokenInvalid = 99991671,
    AppAccessTokenInvalid = 99991664,
    TenantAccessTokenInvalid = 99991663,
    UserAccessTokenInvalid = 99991668,
    UserRefreshTokenInvalid = 99991669,
}

export interface Detail {
    key: string
    value: string

    [propName: string]: any
}

export interface PermissionViolation {
    type: string
    subject: string
    description: string

    [propName: string]: any
}

export interface FieldViolation {
    field: string
    value: string
    description: string

    [propName: string]: any
}

export interface Help {
    url: string
    description: string

    [propName: string]: any
}


export interface Error {
    code: number
    msg: string
    details?: Detail[]
    permission_violations?: PermissionViolation[]
    field_violations?: FieldViolation[]
    helps?: Help[]

    [propName: string]: any
}

export const instanceOfError = (object: any): object is Error => {
    return "code" in object && "msg" in object;
}


export const retryable = (err: Error): boolean => {
    let b = false
    switch (err.code) {
        case ErrCode.AccessTokenInvalid:
        case ErrCode.AppAccessTokenInvalid:
        case ErrCode.TenantAccessTokenInvalid:
            b = true
            break
    }
    return b
}

export const newError = (e: any): Error => {
    let err = {
        code: ErrCode.IO,
        msg: e.toString(),
    }
    return err
}

export const newErrorOfInvalidResp = (msg: string): Error => {
    let err = {
        code: ErrCode.IO,
        msg: msg,
    }
    return err
}