export const handle = async (event) => {
    return {
        statusCode: 201,
        body: JSON.stringify({
            message: "Serverless function is working!"
        }),
        headers:{
            "Content-Type": "application/json"
        }
    }
}