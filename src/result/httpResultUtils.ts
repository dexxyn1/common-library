import {ErrorResult} from "./resultUtils";

const createHTTPResult = () => {
    function Accepted() {
        return {
            status: 202,
        }
    }

    function BadRequest(error:ErrorResult) {
        return {
            status: 400,
            jsonBody: JSON.stringify(error)
        }
    }

    return {Accepted, BadRequest};
}

export const HttpResult = createHTTPResult();