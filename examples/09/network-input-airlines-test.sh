curl -XPOST -H 'Content-Type: application/json' -d '{
    "graphic": {
        "type": "network",
        "parameters": {
            "matrixType": "data",
            "normalize": true
        }
    },
    "data": {
        "uri": "http://192.168.0.107:54321/3/Frames/Key_Frame__airlines_aggregated.hex"
    }
}' https://12e172ff.ngrok.io/vis/network