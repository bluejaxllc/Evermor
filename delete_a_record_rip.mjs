import axios from 'axios';

const API_TOKEN = "UbRvkb0VaMmoFbp1oXFqxSzmOxPjo4CQKdyoLwDf689cd8e0";
const DOMAIN = "evermore.rip";

async function deleteARecord() {
    try {
        // Delete A records for @ name
        const res = await axios.delete(`https://developers.hostinger.com/api/dns/v1/zones/${DOMAIN}`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_TOKEN}`,
                'Accept': 'application/json'
            },
            data: {
                filters: [
                    { name: "@", type: "A" }
                ]
            }
        });
        console.log("Deleted A record:", res.data);
    } catch (error) {
        if (error.response) {
            console.error("Error:", error.response.status, JSON.stringify(error.response.data, null, 2));
        } else {
            console.error("Error:", error.message);
        }
    }
}

deleteARecord();
