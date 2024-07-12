const express = require('express');
const app = express();
const cors = require('cors');
const dgram = require('dgram');
const WebSocket = require('ws');
const fs = require('fs');
const path = require('path');
const Ajv = require('ajv');

app.use(cors());
app.options('*', cors());
app.use(express.static(path.join(__dirname, 'src')));

// Load configuration from config.json
const configPath = path.join(__dirname, 'config.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

const udpServer = dgram.createSocket('udp4');
const wss = new WebSocket.Server({
  port: config.webSocketPort,
  handleProtocols: (protocols, request) => {
    cors()(request, {}, () => {});
    return protocols[0];
  }
});
let messageQueue = [];

// Load JSON schema
const schemaFilePath = path.join(__dirname, 'json_scheme.txt');
const schema = JSON.parse(fs.readFileSync(schemaFilePath, 'utf8'));
const ajv = new Ajv();
const validate = ajv.compile(schema);

udpServer.on('message', (msg, rinfo) => {
  // Add the message and sender info to the queue
  messageQueue.push({ msg, rinfo, ip: rinfo.address });
});

setInterval(() => {
  // If there are no messages in the queue, do nothing
  if (messageQueue.length === 0) {
    return;
  }

  // Create an array to store all new data
  let newDataArray = [];

  // Process all messages in the queue
  while (messageQueue.length > 0) {
    const { msg, rinfo } = messageQueue.shift();

    console.log(`UDP server received: ${msg} from ${rinfo.address}`);

    // Parse the message as JSON
    let newData;
    try {
      newData = JSON.parse(msg.toString());

      // Validate the JSON data against the schema
      const valid = validate(newData);
      if (!valid) {
        console.error('Invalid data received:', validate.errors);
        continue; // Skip processing this message
      }

      newDataArray.push(newData);
    } catch (error) {
      console.error('Failed to parse JSON:', error);
      continue; // Skip processing this message
    }
  }

  // If there's no valid new data, do nothing
  if (newDataArray.length === 0) {
    return;
  }

  const filePath = path.join(__dirname, 'src', 'data.json');

  let existingData = [];
  try {
    const fileData = fs.readFileSync(filePath, 'utf8');

    // Check if the file is empty
    if (fileData.trim() !== '') {
      const parsedData = JSON.parse(fileData);

      // Ensure that existingData is always an array
      existingData = Array.isArray(parsedData) ? parsedData : [parsedData];
    }
  } catch (err) {
    if (err.code !== 'ENOENT') {
      console.error('Error reading file:', err);
      return;
    }
  }

  const updatedData = [...existingData, ...newDataArray];

  // Write the updated data back to the file
  try {
    fs.writeFileSync(filePath, JSON.stringify(updatedData, null, 2));
    console.log('Data written to file');
  } catch (writeErr) {
    console.error('Error writing file:', writeErr);
  }

  // Broadcast to all WebSocket clients
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(newDataArray));
    }
  });
}, 1000);

// Start Express server
app.listen(config.expressPort, () => {
  console.log(`Express server is running on port ${config.expressPort}`);
});

// Bind UDP server
udpServer.bind(config.udpPort, config.udpAddress, () => {
  console.log(`UDP server is running and listening on ${config.udpAddress}:${config.udpPort}`);
});
