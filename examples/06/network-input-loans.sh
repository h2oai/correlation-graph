curl -XPOST -H 'Content-Type: application/json' -d '{
    "graphic": {
        "type": "network",
        "parameters": {
            "matrixType": "data",
            "normalize": true
        }
    },
    "data": {
        "uri": "http://172.16.2.141:54321/3/Frames/aggregated_Key_Frame__sample_orig_1999_2015_headers.hex_by_aggregator-4e93c2ae-6430-4808-b5bf-68240c022bdf"
    }
}' localhost:8080/vis/network