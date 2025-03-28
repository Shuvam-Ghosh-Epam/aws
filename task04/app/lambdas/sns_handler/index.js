exports.handler = async (event) => {
    // Log the incoming event for debugging purposes
    console.log("Incoming SNS notification:", JSON.stringify(event, null, 2));
    
    // Process each record in the event
    event.Records.forEach(record => {
        // Extract and log the message content from each SNS notification
        const messageContent = record.Sns.Message;
        console.log("Notification content:", messageContent);
    });
    
    // Return success response after processing all messages
    return {
        statusCode: 200,
        body: "Successfully handled all SNS notifications"
    };
};