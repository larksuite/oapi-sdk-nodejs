import {createServer, RequestListener} from "http";
import util from "util";

export const startServer = (requestListener: RequestListener, port: number): void => {
    let server = createServer(requestListener)
    server.listen(port, () => {
        console.log(util.format("Listening for server on %s", server.address()));
    })
}