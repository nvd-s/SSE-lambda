import mysql from "mysql2/promise";

export const dbConfig = {
  uri:
    process.env.DATABASE_URL
};

const pool = mysql.createPool(dbConfig.uri);

export async function insertLocationData(data) {
  if (
    data.Longitude === "" ||
    data.Latitude === "" ||
    parseFloat(data.Longitude) === parseFloat(0) ||
    parseFloat(data.Latitude) === parseFloat(0)
  ) {
    throw new Error("Invalid GPS data: coordinates missing or zero");
  }

  const connection = await pool.getConnection();

  try {
    const [result] = await connection.execute(
      `INSERT INTO LocationData 
      (longitude, latitude, device_id, Speed, numberOfSatellites, RawGNSS, Temprature, 
      GyroX, GyroY, GyroZ, acceleroX, acceleroY, acceleroZ, updatedAt) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        parseFloat(data.Longitude),
          parseFloat(data.Latitude),
          data.device_id,
          data.Speed,
          parseInt(data.UsedSatellites.GPSSatellitesCount) || 0,
          data.RawData,
          parseInt(data.EnvironmentalData.Temperature) || 0,
          parseFloat(data.Gyroscope.xAxis),
          parseFloat(data.Gyroscope.yAxis),
          parseFloat(data.Gyroscope.zAxis),
          parseFloat(data.Accelerometer.xAxis),
          parseFloat(data.Accelerometer.yAxis),
          parseFloat(data.Accelerometer.zAxis),
      ]
    );

    return result;
  } finally {
    connection.release();
  }
}

export default pool;
