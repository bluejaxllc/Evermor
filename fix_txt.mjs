import axios from 'axios';

const API_TOKEN = "UbRvkb0VaMmoFbp1oXFqxSzmOxPjo4CQKdyoLwDf689cd8e0";
const DOMAIN = "evermor.me";

async function fixTXT() {
    try {
        const payload = {
            overwrite: true,
            zone: [
                {
                    name: "_railway-verify",
                    type: "TXT",
                    ttl: 300,
                    records: [{ content: "railway-verify=55f59ab3979d6b65afc3818be8d787aad0b9f07f75794ccb34d7a962426b32a5" }]
                }
            ]
        };

        console.log("Updating Railway verification TXT record...");
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

fixTXT();
