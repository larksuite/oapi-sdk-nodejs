import fetch from "node-fetch";

export const downloadFile = async (url: string, timeoutOfMs: number) => {
    let httpResponse = await fetch(url, {
        timeout: timeoutOfMs
    })
    return await httpResponse.buffer()
}