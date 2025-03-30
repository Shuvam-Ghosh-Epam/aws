import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { PutCommand } from "@aws-sdk/lib-dynamodb";
import { v4 as uuidv4 } from "uuid";

const dynamoDBClient = new DynamoDBClient();
const TABLE_NAME = process.env.TABLE_NAME || "Events";

export const handler = async (event) => {
    console.log("Received event:", JSON.stringify(event, null, 2));

    try {
        const inputEvent = typeof event.body === "string" ? JSON.parse(event.body) : event.body;
        
        if (!inputEvent?.principalId || inputEvent?.content === undefined) {
            console.error("Validation failed: Missing required fields", inputEvent);
            return {
                statusCode: 400,
                body: JSON.stringify({ message: "Invalid input: principalId and content are required" })
            };
        }

        const eventItem = {
            id: uuidv4(),
            principalId: Number(inputEvent.principalId),
            createdAt: new Date().toISOString(),
            body: inputEvent.content
        };

        console.log("Saving to DynamoDB:", JSON.stringify(eventItem, null, 2));

        await dynamoDBClient.send(new PutCommand({
            TableName: TABLE_NAME,
            Item: eventItem,
        }));

        console.log("Saved successfully");

        return {
            statusCode: 201,
            body: JSON.stringify({ statusCode: 201, event: eventItem })
        };
    } catch (error) {
        console.error("Error processing request:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: "Internal server error", error: error.message })
        };
    }
};
