const http = require('http');

const postData = JSON.stringify({
    name: 'Test User',
    email: 'testserver@example.com',
    password: 'password123',
    role: 'customer'
});

const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/auth/register',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
    }
};

const req = http.request(options, (res) => {
    console.log(`Status: ${res.statusCode}`);
    console.log(`Headers: ${JSON.stringify(res.headers)}`);
    
    let data = '';
    res.on('data', (chunk) => {
        data += chunk;
    });
    
    res.on('end', () => {
        console.log('Response:', data);
        try {
            const response = JSON.parse(data);
            if (response.message === 'Server error') {
                console.log('❌ Server error detected');
                console.log('This usually means there\'s an exception in the backend code');
            } else if (res.statusCode === 200) {
                console.log('✅ Registration successful');
            } else {
                console.log(`❌ Registration failed with status ${res.statusCode}:`, response);
            }
        } catch (e) {
            console.log('❌ Invalid JSON response:', data);
        }
    });
});

req.on('error', (e) => {
    console.error(`Problem with request: ${e.message}`);
});

req.write(postData);
req.end();








