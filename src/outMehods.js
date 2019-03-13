import axios from 'axios';

const url = 'https://openexchangerates.org/api/latest.json';
const app_id = '2c2f685e54b44e1b96bcefc8380ef32a';
const options = 'base=usd&symbols=rub&prettyprint=true&show_alternative=true';

function checkStatus(response) {

    if (response.status >= 200 && response.status < 300) {
        return response.data;
    }
    const error = new Error(response.statusText);
    error.response = response;
    throw error;
}

export function getRate() {
    const request = `${url}?app_id=${app_id}&${options}`;

    return axios.get(request)
        .then(checkStatus)
        .catch((e) => {
            const error = new Error(e.message);
            throw error;
        });
}