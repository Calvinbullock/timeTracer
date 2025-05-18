
/* ===================================================== *\
|| Extract the top level domain from the URL             ||
\* ===================================================== */
function extractBaseUrl(url) {
    if (!url) {
        return null;
    }

    try {
        const urlObj = new URL(url);
        const parts = urlObj.pathname.split('/');
        let baseUrl = urlObj.origin;

        if (parts.length > 1) {
            baseUrl += parts.slice(0, 2).join('/');
        }
        return baseUrl;

    } catch (error) {
        console.error("Invalid URL:", url, error);
        return null;
    }
}

export {
    extractBaseUrl
}
