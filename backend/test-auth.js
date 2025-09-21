const axios = require('axios');

async function testAuth() {
    try {
        console.log('Testing registration...');
        const registerResponse = await axios.post('http://localhost:5000/api/auth/register', {
            name: 'Test User',
            email: 'test2@example.com',
            password: 'password123',
            role: 'User'
        });
        console.log('Registration successful:', registerResponse.data);
    } catch (error) {
        console.error('Registration error:', error.response?.data || error.message);
    }

    try {
        console.log('\nTesting login...');
        const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
            email: 'user@ecogrid.com',
            password: 'user123',
            role: 'User'
        });
        console.log('Login successful:', loginResponse.data);
    } catch (error) {
        console.error('Login error:', error.response?.data || error.message);
    }
}

testAuth();










