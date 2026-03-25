import axios from 'axios';

const API_TOKEN = "UbRvkb0VaMmoFbp1oXFqxSzmOxPjo4CQKdyoLwDf689cd8e0";
const DOMAIN = "evermor.me";

async function getDNS() {
    try {
        const res = await axios.get(`https://developers.hostinger.com/api/dns/v1/zones/${DOMAIN}`, {
            headers: {
                'Authorization': `Bearer ${API_TOKEN}`,
                'Accept': 'application/json'
            }
        });
        // Pretty print the full zone
        for (const record of res.data) {
            console.log(`${record.type}\t${record.name}\t${record.ttl}\t${JSON.stringify(record.records)}`);
        }
    } catch (error) {
        if (error.response) {
            console.error("Error:", error.response.status, error.response.data);
        } else {
            console.error("Error:", error.message);
        }
    }
}

getDNS();
