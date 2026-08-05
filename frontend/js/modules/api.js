/**
 * API Client Helper for Client Cloud Portal
 */
export class ApiClient {
    static async request(url, options = {}) {
        const defaultHeaders = {
            'X-Requested-With': 'XMLHttpRequest'
        };

        options.headers = { ...defaultHeaders, ...options.headers };

        try {
            const response = await fetch(url, options);
            const contentType = response.headers.get('content-type');

            if (contentType && contentType.includes('application/json')) {
                const data = await response.json();
                if (!response.ok) {
                    throw new Error(data.message || `HTTP error ${response.status}`);
                }
                return data;
            }

            if (!response.ok) {
                throw new Error(`HTTP error ${response.status}`);
            }

            return await response.text();
        } catch (error) {
            console.error(`[API Error] ${url}:`, error);
            throw error;
        }
    }

    static get(url, headers = {}) {
        return this.request(url, { method: 'GET', headers });
    }

    static post(url, body, headers = {}) {
        let options = { method: 'POST', headers };

        if (body instanceof FormData) {
            options.body = body;
        } else if (typeof body === 'object') {
            options.headers['Content-Type'] = 'application/json';
            options.body = JSON.stringify(body);
        } else {
            options.body = body;
        }

        return this.request(url, options);
    }
}
