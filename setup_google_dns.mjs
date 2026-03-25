import axios from 'axios';

const API_TOKEN = "UbRvkb0VaMmoFbp1oXFqxSzmOxPjo4CQKdyoLwDf689cd8e0";
const DOMAIN = "evermor.me";

async function setupGoogleWorkspaceDNS() {
    try {
        const payload = {
            overwrite: true,
            zone: [
                // ---- Existing Railway records ----
                {
                    name: "_railway-verify",
                    type: "TXT",
                    ttl: 300,
                    records: [{ content: "railway-verify=55f59ab3979d6b65afc3818be8d787aad0b9f07f75794ccb34d7a962426b32a5" }]
                },
                {
                    name: "@",
                    type: "ALIAS",
                    ttl: 300,
                    records: [{ content: "h3pk63qf.up.railway.app" }]
                },
                {
                    name: "www",
                    type: "CNAME",
                    ttl: 300,
                    records: [{ content: "h3pk63qf.up.railway.app" }]
                },

                // ---- Google CNAME Verification ----
                {
                    name: "t2v76upxshrg",
                    type: "CNAME",
                    ttl: 300,
                    records: [{ content: "gv-tf3kuqq3vrnsyr.dv.googlehosted.com" }]
                },

                // ---- Google TXT Verification ----
                {
                    name: "@",
                    type: "TXT",
                    ttl: 300,
                    records: [{ content: "google-site-verification=jxsMsGWFYDrLvehVwUKimuw3K1ryedipZVtaEl-ekUw" }]
                },

                // ---- Google SPF Record ----
                {
                    name: "@",
                    type: "TXT",
                    ttl: 300,
                    records: [{ content: "v=spf1 include:_spf.google.com ~all" }]
                },

                // ---- Google DKIM ----
                {
                    name: "google._domainkey",
                    type: "TXT",
                    ttl: 300,
                    records: [{ content: "v=DKIM1;k=rsa;p=MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAxflI+sESb0LaAenMNn6kbbIF1UGGX6wSLJ3e7BuEEXEGDspIUW4ph6/0v8eztaOLbD86TDgmzw5n1dP7lyDMM2n+dJ7sluZOiLwLSXf/JwQUbLRbq8XM8z5bY0XUN3VYefEkPBBTje52u6wNMjsQjiExa4rogStxdLQxVUHP764L/si5PIgVgRH4ZCtFPerqZjmE5vGXfPEF51cwPjXGTMkVA1QFHmbn4Covfg3kiBbNZnTjXUJgtntbUnk454uWiBsyozNs9TnINQ5ohS4ZqBBKuSLOGokdp0mKVNPcFP7IBRCrQ/fXaU1WGnfShcVAsCTPgWhHeIzjU7ApSmzkQwIDAQAB" }]
                },

                // ---- Google Workspace MX Records ----
                {
                    name: "@",
                    type: "MX",
                    ttl: 3600,
                    records: [
                        { content: "1 ASPMX.L.GOOGLE.COM." },
                        { content: "5 ALT1.ASPMX.L.GOOGLE.COM." },
                        { content: "5 ALT2.ASPMX.L.GOOGLE.COM." },
                        { content: "10 ALT3.ASPMX.L.GOOGLE.COM." },
                        { content: "10 ALT4.ASPMX.L.GOOGLE.COM." }
                    ]
                }
            ]
        };

        console.log("Pushing DNS with SPF record...");
        const res = await axios.put(`https://developers.hostinger.com/api/dns/v1/zones/${DOMAIN}`, payload, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_TOKEN}`,
                'Accept': 'application/json'
            }
        });
        console.log("✅ Success!", JSON.stringify(res.data, null, 2));
    } catch (error) {
        if (error.response) {
            console.error("❌ Error:", error.response.status, JSON.stringify(error.response.data, null, 2));
        } else {
            console.error("❌ Error:", error.message);
        }
    }
}

setupGoogleWorkspaceDNS();
