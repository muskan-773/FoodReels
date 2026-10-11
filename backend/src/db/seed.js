require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const foodPartnerModel = require('../models/foodpartner.model');
const userModel = require('../models/user.model');
const foodModel = require('../models/food.model');
const likeModel = require('../models/likes.model');
const saveModel = require('../models/save.model');

// Working, high-speed public CDN food reel videos
const SAMPLE_VIDEOS = [
    {
        url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
        name: "Artisan Woodfired Truffle Pizza",
        cuisine: "Italian",
        dietaryTags: ["Vegetarian", "Cheesy"],
        price: 18,
        likeCount: 142,
        savesCount: 68,
        description: "Freshly tossed sourdough crust blistered to perfection in our 900-degree woodfired oven, topped with fior di latte and aromatic black truffle oil."
    },
    {
        url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
        name: "Sizzling Butter Chicken & Garlic Naan",
        cuisine: "Indian",
        dietaryTags: ["Spicy", "Comfort Food", "Non-Veg"],
        price: 16,
        likeCount: 289,
        savesCount: 124,
        description: "Tender chicken simmered in a velvety tomato-fenugreek gravy, served piping hot alongside charred garlic butter naan straight from the clay tandoor."
    },
    {
        url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
        name: "Tokyo Rich Tonkotsu Ramen",
        cuisine: "Japanese",
        dietaryTags: ["Rich Broth", "Comfort Food"],
        price: 17,
        likeCount: 312,
        savesCount: 153,
        description: "16-hour simmered pork bone broth with springy handmade noodles, soft-boiled marinated ajitsuke tamago egg, and melt-in-your-mouth chashu pork."
    },
    {
        url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4",
        name: "Crispy Birria Beef Tacos",
        cuisine: "Mexican",
        dietaryTags: ["Spicy", "Cheesy", "Street Food"],
        price: 14,
        likeCount: 205,
        savesCount: 97,
        description: "Slow-braised beef stuffed in corn tortillas crisped on the plancha with melted Oaxaca cheese, served with deep red consommé for dipping."
    },
    {
        url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4",
        name: "Molten Belgian Chocolate Lava Cake",
        cuisine: "Bakery & Desserts",
        dietaryTags: ["Vegetarian", "Dessert", "Sweet"],
        price: 11,
        likeCount: 421,
        savesCount: 210,
        description: "Warm dark chocolate fondant with a luscious liquid core that pours out with your first spoon, paired with Madagascar vanilla bean gelato."
    },
    {
        url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4",
        name: "Green Goddess Mediterranean Bowl",
        cuisine: "Healthy & Clean",
        dietaryTags: ["Vegetarian", "Vegan", "Gluten-Free", "High-Protein"],
        price: 15,
        likeCount: 98,
        savesCount: 45,
        description: "Crisp organic greens tossed with quinoa, heirloom tomatoes, roasted spiced chickpeas, creamy avocado, and herbed tahini dressing."
    }
];

async function seed() {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
        console.error("❌ MONGODB_URI is not set. Please configure it in your .env file before seeding.");
        process.exit(1);
    }

    try {
        console.log("Connecting to MongoDB...");
        await mongoose.connect(uri);
        console.log("Connected to MongoDB successfully.");

        // Clear existing demo seed data if requested or populate cleanly
        console.log("Preparing database collections...");

        const hashedPassword = await bcrypt.hash("password123", 10);

        // 1. Create or find demo user
        let demoUser = await userModel.findOne({ email: "foodie@example.com" });
        if (!demoUser) {
            demoUser = await userModel.create({
                fullName: "Alex Rivera",
                email: "foodie@example.com",
                password: hashedPassword
            });
            console.log("✅ Created demo user: foodie@example.com (password: password123)");
        }

        // 2. Create demo food partners
        const partnersData = [
            {
                name: "Bella Napoli Pizzeria",
                contactName: "Marco Rossi",
                email: "marco@bellanapoli.com",
                phone: "+1 555-019-2831",
                address: "45 Little Italy Way, New York, NY",
                password: hashedPassword
            },
            {
                name: "Spice Symphony Bistro",
                contactName: "Priya Sharma",
                email: "priya@spicesymphony.com",
                phone: "+1 555-018-7243",
                address: "102 Curry Hill Avenue, New York, NY",
                password: hashedPassword
            },
            {
                name: "Kyoto Noodle Lab",
                contactName: "Kenji Sato",
                email: "kenji@kyotonoodles.com",
                phone: "+1 555-017-9912",
                address: "88 East Village Blvd, New York, NY",
                password: hashedPassword
            }
        ];

        const partners = [];
        for (const p of partnersData) {
            let partner = await foodPartnerModel.findOne({ email: p.email });
            if (!partner) {
                partner = await foodPartnerModel.create(p);
                console.log(`✅ Created partner: ${partner.name} (${partner.email})`);
            }
            partners.push(partner);
        }

        // 3. Seed food reels
        for (let i = 0; i < SAMPLE_VIDEOS.length; i++) {
            const v = SAMPLE_VIDEOS[i];
            const partner = partners[i % partners.length];

            const existingFood = await foodModel.findOne({ name: v.name });
            if (!existingFood) {
                const createdFood = await foodModel.create({
                    name: v.name,
                    description: v.description,
                    video: v.url,
                    cuisine: v.cuisine,
                    dietaryTags: v.dietaryTags,
                    price: v.price,
                    likeCount: v.likeCount,
                    savesCount: v.savesCount,
                    foodPartner: partner._id
                });
                console.log(`✅ Created food reel: "${createdFood.name}" for ${partner.name}`);

                // Add sample like and save for demo user
                if (i % 2 === 0 && demoUser) {
                    await likeModel.findOneAndUpdate(
                        { user: demoUser._id, food: createdFood._id },
                        { user: demoUser._id, food: createdFood._id },
                        { upsert: true }
                    );
                    await saveModel.findOneAndUpdate(
                        { user: demoUser._id, food: createdFood._id },
                        { user: demoUser._id, food: createdFood._id },
                        { upsert: true }
                    );
                }
            }
        }

        console.log("\n🎉 Database seed complete! Demo accounts ready:");
        console.log("   - User: foodie@example.com / password123");
        console.log("   - Food Partner: marco@bellanapoli.com / password123");
        console.log("   - Food Partner: priya@spicesymphony.com / password123");
        process.exit(0);
    } catch (err) {
        console.error("❌ Seed script failed:", err);
        process.exit(1);
    }
}

seed();
