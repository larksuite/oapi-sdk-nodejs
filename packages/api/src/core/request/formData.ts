const stream = require('stream');

export class FormData {
    private params: Map<string, string | number | boolean>
    private files: File[]

    constructor() {
        this.params = new Map<string, string | number | boolean>()
        this.files = []
    }

    setField(k: string, v: string | number | boolean): FormData {
        this.params.set(k, v)
        return this
    }

    addField(k: string, v: string | number | boolean): FormData {
        this.params.set(k, v)
        return this
    }

    addFile(k: string, file: File): FormData {
        file.setFieldName(k)
        this.files.push(file)
        return this
    }

    appendFile(file: File): FormData {
        this.files.push(file)
        return this
    }

    getParams(): Map<string, string | number | boolean> {
        return this.params
    }

    getFiles(): File[] {
        return this.files
    }
}

export class File {
    private fieldName: string = "file"
    private name: string = "unknown"
    private type: string
    private content: any
    private stream: boolean

    getFieldName(): string {
        return this.fieldName
    }

    setFieldName(fieldName: string): File {
        this.fieldName = fieldName
        return this
    }

    setName(name: string): File {
        this.name = name
        return this
    }

    getName(): string {
        return this.name
    }

    setType(type: string): File {
        this.type = type
        return this
    }

    getType(): string {
        return this.type
    }

    setContent(content: any): File {
        if (content instanceof stream.Readable) {
            this.stream = true
        }
        this.content = content
        return this
    }

    getContent(): any {
        return this.content
    }

    isStream(): boolean {
        return this.stream
    }

}
