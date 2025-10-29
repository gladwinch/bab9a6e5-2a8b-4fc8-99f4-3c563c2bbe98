import axios from "axios"

export default async (url, opts = {}) => {
    let data, error
    try {
        const res = await axios(url, {
            ...opts,
            baseURL: 'http://localhost:5000',
            // withCredentials: true,
        })

        data = res.data
    } catch (err) {
        error = err.message
        if (err.response && err.response.data) {
            error = err.response.data.message || err.response.data
        }

        console.log(error)
    }

    return { data, error }
}
