const {Queue} = require("bullmq")

const videoQueue = new Queue("video-transcode",{
    connection: {host:"localhost", port: 6379},
})

module.exports = videoQueue;