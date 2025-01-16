import {ErrorResult} from "./resultUtils";

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

export const HttpResultUtils = {Accepted, BadRequest};