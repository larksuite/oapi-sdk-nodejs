export enum ErrCode {
    Native = -1,
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

export interface Err {
    details?: Detail[]
    permission_violations?: PermissionViolation[]
    field_violations?: FieldViolation[]
    helps?: Help[]

    [propName: string]: any
}


export interface Error {
    code: number
    msg: string
    error?: Err

    [propName: string]: any
}

export const instanceOfError = (object: any): object is Error => {
    return "code" in object && "msg" in object;
}

export const newErr = (e: any): Error => {
    let err = {
        code: ErrCode.Native,
        msg: e.toString(),
    }
    return err
}

export const newErrorOfInvalidResp = (msg: string): Error => {
    let err = {
        code: ErrCode.Native,
        msg: msg,
    }
    return err
}