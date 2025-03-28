exports.handler = async (event) => {
    // Display the incoming queue event for troubleshooting
    console.log("Queue event received:", JSON.stringify(event, null, 2));
    
    // Iterate through each message in the batch
    event.Records.forEach(message => {
      // Extract and output the payload from each queue message
      const payload = message.body;
      console.log("Message payload:", payload);
    });
    
    // Return confirmation after processing the queue messages
    return {
      statusCode: 200,
      body: "Queue messages successfully processed"
    };
  };