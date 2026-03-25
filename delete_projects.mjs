const token = "rw_Fe26.2**3bc7cd9c603973c402d8d9410c86e058a567ebc2f5de2f9108f6c62a36985770*NVko3GDmgAG77lQ8acTXGA*utAQNmzNfJwOV-VPxiTtr4fGm3kx9hE1TnI4K7UnwuhLKqTnSyEnu3CFRtXAx08bh2UUUCxh4uJNoNY-2w6c3Q*1775719849990*0b1c54f4975e964949b7980013a089c631a273a82c0166fbfd2525bcb34b9a27*mBISbff2U0waoXrnQ32U1qmqVJCABJJA5FPr2d2UFkI";
const query = `
mutation projectDelete($id: String!) {
  projectDelete(id: $id)
}`;

async function deleteProject(id) {
    const res = await fetch("https://backboard.railway.app/graphql/v2", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ query, variables: { id } })
    });
    const data = await res.json();
    console.log(`Deleted ${id}:`, data);
}

async function main() {
    await deleteProject("e2506be0-29c7-4a89-a5e1-e90254ed6f05"); // elegant-elegance
    await deleteProject("71fcb91d-48c4-420b-9ca8-488f3ed6f08a"); // old evermor
}

main().catch(console.error);
