const assert = require('assert');
const app = require('../src/app');
const aiService = require('../src/services/ai.service');

// Simple lightweight HTTP test runner using Node's built-in http/assert
const http = require('http');

function makeRequest(server, path, method = 'GET', body = null, headers = {}) {
    return new Promise((resolve, reject) => {
        const addr = server.address();
        const options = {
            hostname: '127.0.0.1',
            port: addr.port,
            path,
            method,
            headers: {
                'Content-Type': 'application/json',
                ...headers
            }
        };

        const req = http.request(options, res => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                let parsed = data;
                try {
                    parsed = JSON.parse(data);
                } catch (e) {}
                resolve({ status: res.statusCode, headers: res.headers, body: parsed });
            });
        });

        req.on('error', reject);
        if (body) {
            req.write(typeof body === 'string' ? body : JSON.stringify(body));
        }
        req.end();
    });
}

async function runTests() {
    console.log('🧪 Starting FoodReels Backend Verification Tests...\n');
    let passed = 0;
    let failed = 0;

    const server = http.createServer(app);
    await new Promise(resolve => server.listen(0, resolve));

    async function test(name, fn) {
        try {
            await fn();
            console.log(`  ✅ PASS: ${name}`);
            passed++;
        } catch (err) {
            console.error(`  ❌ FAIL: ${name}`);
            console.error(`     Error: ${err.message}`);
            failed++;
        }
    }

    try {
        // Test 1: Health endpoint
        await test('GET /api/health returns healthy status', async () => {
            const res = await makeRequest(server, '/api/health');
            assert.strictEqual(res.status, 200);
            assert.strictEqual(res.body.status, 'healthy');
            assert.ok(res.body.timestamp);
        });

        // Test 2: Root Welcome endpoint
        await test('GET / returns API welcome and health link', async () => {
            const res = await makeRequest(server, '/');
            assert.strictEqual(res.status, 200);
            assert.ok(res.body.message.includes('FoodReels API'));
        });

        // Test 3: 404 Route handling
        await test('GET /api/nonexistent returns clean 404 JSON', async () => {
            const res = await makeRequest(server, '/api/nonexistent');
            assert.strictEqual(res.status, 404);
            assert.strictEqual(res.body.success, false);
        });

        // Test 4: Auth validation on user register
        await test('POST /api/auth/user/register rejects empty fields with 400', async () => {
            const res = await makeRequest(server, '/api/auth/user/register', 'POST', {
                email: 'test@example.com'
                // missing password and fullName
            });
            assert.strictEqual(res.status, 400);
            assert.ok(res.body.message.includes('required'));
        });

        // Test 5: Protected route rejection without token
        await test('POST /api/food rejects unauthenticated food partner with 401', async () => {
            const res = await makeRequest(server, '/api/food', 'POST', {
                name: 'Unauthorized Pizza'
            });
            assert.strictEqual(res.status, 401);
        });

        // Test 6: AI Description Fallback generator
        await test('AI Service generates fallback description when offline', async () => {
            const desc = await aiService.generateFoodDescription('Artisan Margherita Pizza', 'Italian');
            assert.ok(desc && desc.length > 10, 'Expected non-empty description');
            assert.ok(desc.includes('Pizza') || desc.includes('Artisan') || desc.includes('flavor'), 'Expected food-related keywords in description');
        });

        // Test 7: AI Food Recommendation Engine (Algorithmic & Heuristic)
        await test('AI Recommendation Engine selects matching dishes with scores and reasons', async () => {
            const sampleCatalog = [
                {
                    _id: '64f1a2b3c4d5e6f7a8b9c0d1',
                    name: 'Fiery Dragon Ramen',
                    description: 'Extra spicy chili pork broth with soft boiled egg',
                    cuisine: 'Japanese',
                    dietaryTags: ['Spicy', 'Non-Veg'],
                    likeCount: 45
                },
                {
                    _id: '64f1a2b3c4d5e6f7a8b9c0d2',
                    name: 'Classic Margherita Pizza',
                    description: 'Fresh basil and mozzarella on sourdough',
                    cuisine: 'Italian',
                    dietaryTags: ['Vegetarian'],
                    likeCount: 12
                }
            ];

            const result = await aiService.recommendFoods({
                query: 'spicy chili broth',
                dietaryPreferences: ['Spicy'],
                availableFoods: sampleCatalog
            });

            assert.ok(Array.isArray(result.recommendations), 'Expected recommendations array');
            assert.strictEqual(result.recommendations.length, 2);
            // Top recommendation must be Fiery Dragon Ramen
            assert.strictEqual(result.recommendations[0].name, 'Fiery Dragon Ramen');
            assert.ok(result.recommendations[0].matchScore >= 70, 'Expected high match score');
            assert.ok(result.recommendations[0].recommendationReason, 'Expected recommendation reason');
        });

    } finally {
        server.close();
    }

    console.log(`\n📊 Test Summary: ${passed} passed, ${failed} failed`);
    if (failed > 0) {
        process.exit(1);
    } else {
        console.log('✨ All backend verification checks passed!\n');
    }
}

runTests().catch(err => {
    console.error('Test runner failure:', err);
    process.exit(1);
});
