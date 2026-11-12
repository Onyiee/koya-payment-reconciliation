require("dotenv").config();

async function getAddress() {
    const apiKey = process.env.POSITIONSTACK_API_KEY;

    if (!apiKey) {
        throw new Error("Positionstack API key is missing.");
    }

    const params = new URLSearchParams({
        access_key: apiKey,
        query: "6.4410,3.5357",
    });

    const response = await fetch(
        `https://api.apilayer.net/positionstack/v1/reverse?${params}`
    );

    const result = await response.json();

    if (!response.ok || result.error) {
        throw new Error(JSON.stringify(result.error));
    }

    if (!result.data || result.data.length === 0) {
        throw new Error("No address found for these coordinates.");
    }

    return result.data[0].label;
}

getAddress()
    .then(console.log)
    .catch(console.error);
