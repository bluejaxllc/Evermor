import axios from 'axios';

const API_TOKEN = "UbRvkb0VaMmoFbp1oXFqxSzmOxPjo4CQKdyoLwDf689cd8e0";
const DOMAIN = "evermor.me";

async function fixAlias() {
    try {
        // Railway's ACTUAL per-service CNAME target (from dashboard screenshot)
        const railwayTarget = "h3pk63qf.up.railway.app";

        const payload = {
            overwrite: true,
            zone: [
                {
                    name: "@",
                    type: "ALIAS",
                    ttl: 300,
                    records: [{ content: railwayTarget }]
                },
                {
                    name: "www",
                    type: "CNAME",
                    ttl: 300,
                    records: [{ content: railwayTarget }]
                }
            ]
        };

        console.log(`Updating DNS to point to Railway's actual target: ${railwayTarget}`);
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
            console.error("Error:", error.response.status, JSON.stringify(error.response.data, null, 2));
        } else {
            console.error("Error:", error.message);
        }
    }
}

fixAlias();
