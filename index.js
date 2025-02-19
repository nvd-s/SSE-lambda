import { processDatabaseOperation } from "./dbOps.js";
import { processRedisOperation } from "./redisOps.js";

export const handler = async (event) => {
  console.log("Received event:", JSON.stringify(event, null, 2));

  try {
    // 1. Parse data
    const data = typeof event === "string" ? JSON.parse(event) : event;
    console.log("Parsed data:", JSON.stringify(data, null, 2));

    // 2. Validate data
    if (!data || !data.device_id) {
      throw new Error("Invalid data: device_id is required");
    }

    const [dbResult, redisResult] = await Promise.allSettled([
      // Database operation
      processDatabaseOperation(data),
      // Redis operation
      processRedisOperation(data),
    ]);

    if (dbResult.status === 'rejected') {
      console.error('Database operation failed:', dbResult.reason);
    }
    
    if (redisResult.status === 'rejected') {
      console.error('Redis operation failed:', redisResult.reason);
    }

    const response = {
      statusCode: 200,
      body: {
        message: "Processing complete",
        database:
          dbResult.status === "fulfilled"
            ? dbResult.value
            : { error: dbResult.reason?.message },
        redis:
          redisResult.status === "fulfilled"
            ? redisResult.value
            : { error: redisResult.reason?.message },
      },
    };
    console.log("Final response:", response);
    return response;
  } catch (error) {
    console.error("Error in main handler:", error);
    return {
      statusCode: 500,
      body: {
        message: "Error processing data",
        error: error.message,
      },
    };
  }
};
