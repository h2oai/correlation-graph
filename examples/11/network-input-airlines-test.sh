curl -XPOST -H 'Content-Type: application/json' -d '{
    "graphic": {
        "type": "network",
        "parameters": {
            "matrixType": "data",
            "normalize": true
        }
    },
    "data": {
        "uri": "http://192.168.0.107:54321/3/Frames/aggregated_Key_Frame__sample_orig_1999_2015_headers1.hex_by_aggregator-64af7079-9791-4296-996b-c6dc5c57f458"
    }
}' https://12e172ff.ngrok.io/vis/network