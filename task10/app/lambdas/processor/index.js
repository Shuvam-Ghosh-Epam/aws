const AWS = require("aws-sdk");
const axios = require("axios");
const { v4: generateUUID } = require("uuid");

const dbClient = new AWS.DynamoDB.DocumentClient();
const WEATHER_TABLE = process.env.TARGET_TABLE || "Weather";

// Function to retrieve weather forecast from Open-Meteo API
const getWeatherForecast = async () => {
    const weatherAPI = "https://api.open-meteo.com/v1/forecast?latitude=50.4375&longitude=30.5&hourly=temperature_2m";

    try {
        const { data } = await axios.get(weatherAPI);
        console.log("Weather API response:", JSON.stringify(data, null, 2));
        return data;
    } catch (err) {
        console.error("Failed to fetch weather data:", err.message);
        throw new Error("Unable to retrieve weather forecast");
    }
};

// Lambda handler
exports.handler = async (event) => {
    console.log("Event Triggered:", JSON.stringify(event, null, 2));

    try {
        const forecastData = await getWeatherForecast();

        const weatherRecord = {
            id: generateUUID(),
            forecast: {
                latitude: forecastData.latitude,
                longitude: forecastData.longitude,
                generatedAt: forecastData.generationtime_ms,
                utcOffset: forecastData.utc_offset_seconds,
                timezone: forecastData.timezone,
                timezoneAbbreviation: forecastData.timezone_abbreviation,
                elevation: forecastData.elevation,
                hourlyUnits: forecastData.hourly_units,
                hourlyData: forecastData.hourly
            }
        };

        console.log("Preparing to store record in DynamoDB:", JSON.stringify(weatherRecord, null, 2));

        await dbClient.put({
            TableName: WEATHER_TABLE,
            Item: weatherRecord
        }).promise();

        console.log("Record saved successfully to DynamoDB");

        return {
            statusCode: 200,
            body: JSON.stringify({ message: "Weather information saved successfully!" }),
            headers: {
                "Content-Type": "application/json"
            }
        };
    } catch (err) {
        console.error("Handler encountered an error:", err);

        return {
            statusCode: 500,
            body: JSON.stringify({ message: "Server encountered an error", error: err.message }),
            headers: {
                "Content-Type": "application/json"
            }
        };
    }
};
