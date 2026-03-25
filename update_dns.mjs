import axios from 'axios';

const API_TOKEN = "UbRvkb0VaMmoFbp1oXFqxSzmOxPjo4CQKdyoLwDf689cd8e0";
const DOMAIN = "evermor.me";

async function updateDNS() {
    try {
        const payload = {
            overwrite: true,
            zone: [
                {
                    name: "@",
                    type: "A",
                    ttl: 300,
                    records: [{ content: "66.33.22.134" }]
                },
                {
                    name: "www",
                    type: "CNAME",
                    ttl: 300,
                    records: [{ content: "evermor.me.up.railway.app" }]
                }
            ]
        };

        console.log("Sending payload...");
        const res = await axios.put(`https://developers.hostinger.com/api/dns/v1/zones/${DOMAIN}`, payload, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_TOKEN}`,
                'Accept': 'application/json'
            }
        });
        console.log("Success:", res.data);
    } catch (error) {
        if (error.response) {
            console.error("API Error HTTP", error.response.status);
            console.error(error.response.data);
        } else {
            console.error("Network Error:", error.message);
        }
    }
}

updateDNS();
