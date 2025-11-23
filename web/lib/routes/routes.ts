import axios, { AxiosInstance } from "axios"

const isProductionBackendURL: boolean = false

const devURL: string = process.env.NEXT_PUBLIC_API_URL_DEV || "http://localhost:8080"
const prodURL: string = process.env.NEXT_PUBLIC_API_URL_PROD || "http://localhost:8080"

function getBaseURL(prod: boolean) {
    if(typeof prod !== "boolean"){
        prod = false
    }
    return prod ? prodURL : devURL
}

export function getJsonApi() {
    try{ 
        const api: AxiosInstance = axios.create({
            baseURL: getBaseURL(isProductionBackendURL) || "http://localhost:8080",
            headers: {"Content-Type": "application/json"},
    });
    return api
    } catch (err: any) {
        console.error("an error occurred while creating axios instance: ", err)
        throw new Error(err.message || "Failed to create axios instance")
    }

}
export const searchUsers = 'http://localhost:8080/v1/users/search';